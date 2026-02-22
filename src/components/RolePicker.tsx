import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { List, ListItem, Button, Input, Icon } from 'react-onsenui'

import {
  addRole,
  removeRole,
  createCustomRole,
  deleteCustomRole,
  setRoleTiming,
  setRoleNightSchedule,
  createFaction,
  setRoleFaction,
  setRoleAdditionalWake,
} from '../reducers/game'

import styles from './RolePicker.module.css'
import { defaultRoles } from '../config'

function mapStateToProps(state: RootState) {
  return {
    availableRoles: state.game.availableRoles,
    availableFactions: state.game.availableFactions,
    pickedRoles: state.game.pickedRoles,
    roleTimings: state.game.roleTimings,
    roleNightWakeRules: state.game.roleNightWakeRules,
  }
}

const mapDispatch = {
  addRole,
  removeRole,
  createCustomRole,
  deleteCustomRole,
  setRoleTiming,
  setRoleNightSchedule,
  createFaction,
  setRoleFaction,
  setRoleAdditionalWake,
}
const connector = connect(mapStateToProps, mapDispatch)
export default connector(RolePicker)

type RolePickerProps = ConnectedProps<typeof connector>
type RoleActivationMode = "day" | "night_every" | "night_zero" | "night_even" | "night_odd"
const roleActivationOrder: RoleActivationMode[] = ["day", "night_every", "night_zero", "night_even", "night_odd"]

const modeInfo = (mode: RoleActivationMode): { label: string, icon: string, cssClass: string } => {
  switch (mode) {
    case "night_zero":
      return { label: "Nacht: 1x", icon: "fa-hourglass-half", cssClass: styles.modeNightZero }
    case "night_even":
      return { label: "Nacht: 2n", icon: "fa-adjust", cssClass: styles.modeNightEven }
    case "night_odd":
      return { label: "Nacht: 2n+1", icon: "fa-random", cssClass: styles.modeNightOdd }
    case "night_every":
      return { label: "Nacht: ∞", icon: "fa-moon", cssClass: styles.modeNightEvery }
    default:
      return { label: "Tag/Passiv", icon: "fa-sun", cssClass: styles.modeDay }
  }
}

const getNextMode = (currentMode: RoleActivationMode): RoleActivationMode => {
  const currentIdx = roleActivationOrder.indexOf(currentMode)
  const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % roleActivationOrder.length : 0
  return roleActivationOrder[nextIdx]
}

const roleScheduleToMode = (schedule: RoleNightSchedule | undefined): RoleActivationMode => {
  switch (schedule || "from_night_one") {
    case "night_zero_only":
      return "night_zero"
    case "every_even_night_from_two":
      return "night_even"
    case "every_odd_night_from_one":
      return "night_odd"
    default:
      return "night_every"
  }
}

const modeToSchedule = (mode: RoleActivationMode): RoleNightSchedule => {
  switch (mode) {
    case "night_zero":
      return "night_zero_only"
    case "night_even":
      return "every_even_night_from_two"
    case "night_odd":
      return "every_odd_night_from_one"
    default:
      return "from_night_one"
  }
}

const resolveRoleMode = (
  roleTiming: RoleTiming,
  wakeRule: RoleNightWakeRule,
): RoleActivationMode => {
  if (roleTiming !== "night") {
    return "day"
  }

  const schedule = (wakeRule.wakeAsFaction && wakeRule.hasAdditionalRoleWake)
    ? (wakeRule.additionalRoleSchedule || wakeRule.schedule || "from_night_one")
    : (wakeRule.schedule || "from_night_one")

  return roleScheduleToMode(schedule)
}

function RolePicker({
  availableRoles,
  availableFactions,
  pickedRoles,
  roleTimings,
  roleNightWakeRules,
  addRole,
  removeRole,
  createCustomRole,
  deleteCustomRole,
  setRoleTiming,
  setRoleNightSchedule,
  createFaction,
  setRoleFaction,
  setRoleAdditionalWake,
}: RolePickerProps) {
  const [newFactionName, setNewFactionName] = React.useState("")
  const [newRoleName, setNewRoleName] = React.useState("")

  const sortedFactions = React.useMemo<[string, string][]>(() => (
    Object.entries(availableFactions).sort((a, b) => a[1].localeCompare(b[1], "de"))
  ), [availableFactions])
  const sortedRoleIDs = React.useMemo<string[]>(() => (
    Object.keys(availableRoles).sort((roleA, roleB) => availableRoles[roleA].localeCompare(availableRoles[roleB], "de"))
  ), [availableRoles])

  const addNewFaction = () => {
    const factionName = newFactionName.trim()
    if (factionName.length <= 0) {
      return
    }
    createFaction(factionName)
    setNewFactionName("")
  }

  const availableRolesItems = (roleKey: string) => {
    const roleTiming = roleTimings[roleKey] || "day"
    const wakeRule = roleNightWakeRules[roleKey] || {}
    const currentMode = resolveRoleMode(roleTiming, wakeRule)
    const nextMode = getNextMode(currentMode)
    const currentModeInfo = modeInfo(currentMode)
    const isNightRole = roleTiming === "night"
    const roleFactionID = isNightRole ? (wakeRule.factionID || "") : ""
    const roleHasFaction = roleFactionID.length > 0
    const roleHasAdditionalWake = Boolean(roleHasFaction && wakeRule.hasAdditionalRoleWake)

    const factionOptions: [string, string][] = roleFactionID in availableFactions || roleFactionID.length <= 0
      ? sortedFactions
      : [[roleFactionID, roleFactionID], ...sortedFactions]

    const applyMode = () => {
      if (nextMode === "day") {
        setRoleTiming({ roleID: roleKey, timing: "day" })
        return
      }

      setRoleTiming({ roleID: roleKey, timing: "night" })
      setRoleNightSchedule({ roleID: roleKey, schedule: modeToSchedule(nextMode) })
    }

    return (
      <ListItem key={roleKey} className={styles.roleRow}>
        <div className={`center ${styles.rowContent}`}>
          <div className={styles.roleTitleRow}>
            <span className={styles.roleName}>{availableRoles[roleKey]}</span>
            {!(roleKey in defaultRoles) && (
              <Button className={styles.deleteRoleButton} onClick={() => deleteCustomRole(roleKey)}>
                <Icon icon='trash' />
              </Button>
            )}
          </div>

          <div className={styles.modeColumn}>
            <Button
              modifier="quiet"
              className={`${styles.modeButton} ${currentModeInfo.cssClass}`}
              onClick={applyMode}
            >
              <Icon icon={currentModeInfo.icon} /> {currentModeInfo.label}
            </Button>
          </div>

          {isNightRole ? (
            <details className={styles.roleOptions}>
              <summary>Böse Fraktion & Zusatz</summary>
              <div className={styles.roleOptionsBody}>
                <label className={styles.optionLabel} htmlFor={`faction_${roleKey}`}>Böse Fraktion</label>
                <select
                  id={`faction_${roleKey}`}
                  className={styles.optionSelect}
                  value={roleFactionID}
                  onChange={event => setRoleFaction({ roleID: roleKey, factionID: event.currentTarget.value })}
                >
                  <option value="">Dorf / Solofraktion</option>
                  {factionOptions.map(([factionID, factionName]) => (
                    <option key={`${roleKey}_${factionID}`} value={factionID}>{factionName}</option>
                  ))}
                </select>
                {roleHasFaction && (
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={roleHasAdditionalWake}
                      onChange={event => setRoleAdditionalWake({ roleID: roleKey, enabled: event.currentTarget.checked })}
                    />
                    Zusätzlich als Rolle aufwachen
                  </label>
                )}
              </div>
            </details>
          ) : (
            <div className={styles.roleOptionsPlaceholder} aria-hidden="true" />
          )}
        </div>
        <div className={`right ${styles.countColumn}`}>
          <div className={styles.countStepper}>
            <Button className={styles.stepButton} onClick={() => removeRole(roleKey)} disabled={pickedRoles[roleKey] <= 0}>-</Button>
            <span className={styles.counter}>{pickedRoles[roleKey]}</span>
            <Button className={styles.stepButton} onClick={() => addRole(roleKey)}>+</Button>
          </div>
        </div>
      </ListItem>
    )
  }

  const addCustomRole = () => {
    const roleName = newRoleName.trim()
    if (roleName.length <= 0) {
      return
    }
    createCustomRole(roleName)
    setNewRoleName("")
  }

  const footer = (
    <ListItem key={"new_role"}>
      <div className="center">
        <Input
          inputId={"new_role"}
          modifier='material'
          placeholder='Neue Rolle'
          value={newRoleName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewRoleName(event.currentTarget.value)}
          float
        />
      </div>
      <div className="right">
        <Button onClick={addCustomRole}>+</Button>
      </div>
    </ListItem>
  )

  return (
    <>
      <details className={styles.factionPanel}>
        <summary>Böse Fraktionen verwalten</summary>
        <div className={styles.factionPanelBody}>
          <p className={styles.factionHint}>Nur für böse Fraktionen als Gegenpart zur Dorffraktion.</p>
          <div className={styles.factionCreateRow}>
            <input
              type="text"
              className={styles.inlineInput}
              value={newFactionName}
              onChange={event => setNewFactionName(event.currentTarget.value)}
              placeholder="Neue böse Fraktion"
            />
            <Button modifier="quiet" onClick={addNewFaction}>+ Böse Fraktion</Button>
          </div>
          <div className={styles.factionChipRow}>
            {sortedFactions.map(([factionID, factionName]) => (
              <span key={factionID} className={styles.factionChip}>{factionName}</span>
            ))}
          </div>
        </div>
      </details>
      <List
      >
        {sortedRoleIDs.map(availableRolesItems)}
        {footer}
      </List>
    </>
  )
}
