import React from 'react'
import { Fab, Icon, Page, List, ListItem, ListTitle, AlertDialog, Button, Dialog, Checkbox, Input } from 'react-onsenui'
import { connect, ConnectedProps } from 'react-redux'

import { togglePlayerAlive, fullReset, togglePlayerEffect, createEffect, deleteEffect, generateEffectID, advanceNightZero, advanceToDay, advanceToNight } from '../reducers/game'
import { navTo } from '../reducers/ui'
import Toolbar from './Toolbar'
import { availableIcons } from '../config'
import styles from './Play.module.css'

const mapStateToProps = (state: RootState) => ({
  players: state.game.players,
  pickedRoles: state.game.pickedRoles,
  availableRoles: state.game.availableRoles,
  availableEffects: state.game.availableEffects,
  roleTimings: state.game.roleTimings,
  roleNightWakeRules: state.game.roleNightWakeRules,
  phase: state.game.phase,
})

const mapDispatch = { togglePlayerAlive, fullReset, navTo, togglePlayerEffect, createEffect, deleteEffect, advanceNightZero, advanceToDay, advanceToNight }
const connector = connect(mapStateToProps, mapDispatch)

const pStyle: React.CSSProperties = {
  textAlign: 'center',
  opacity: 0.6,
  fontSize: '0.85rem',
  margin: '8px 0'
}

type PlayProps = ConnectedProps<typeof connector>

const effectDurationLabel = (duration: EffectDuration): string => {
  switch (duration) {
    case "night":
      return "Nur Nacht"
    case "next_day":
      return "Nächster Tag"
    default:
      return "Permanent"
  }
}

const effectDurationClass = (duration: EffectDuration): string => {
  switch (duration) {
    case "night":
      return styles.effectNight
    case "next_day":
      return styles.effectNextDay
    default:
      return styles.effectPermanent
  }
}

const durationSortOrder = (duration: EffectDuration): number => {
  switch (duration) {
    case "permanent":
      return 0
    case "night":
      return 1
    case "next_day":
      return 2
    default:
      return 3
  }
}

const effectDurationOptions: Array<{ duration: EffectDuration, label: string }> = [
  { duration: "permanent", label: "Permanent" },
  { duration: "night", label: "Nur Nacht" },
  { duration: "next_day", label: "Nächster Tag" },
]

const getAllowedEffectDurations = (mode: GameState["phase"]["mode"], nightCount: number): EffectDuration[] => {
  if (mode === "day") {
    return ["permanent"]
  }
  if (nightCount === 0) {
    return ["permanent"]
  }
  return ["night", "next_day"]
}

const roleWakesAtNight = (timing: RoleTiming): boolean => timing === "night"

const countAlivePlayers = (players: Player[]) => players.reduce((c, p) => c + (p.alive ? 1 : 0), 0)

const countActiveEffects = (players: Player[], availableEffects: { [key: string]: Effect }, duration: EffectDuration): number => {
  return players.reduce((count, player) => (
    count + player.effects.filter(effectID => availableEffects[effectID]?.duration === duration).length
  ), 0)
}

const wakesOnNight = (schedule: RoleNightSchedule | undefined, nightCount: number): boolean => {
  switch (schedule || "from_night_one") {
    case "night_zero_only":
      return nightCount === 0
    case "every_even_night_from_two":
      return nightCount >= 2 && nightCount % 2 === 0
    case "every_odd_night_from_one":
      return nightCount >= 1 && nightCount % 2 === 1
    default:
      return nightCount >= 1
  }
}

// Night order for the narrator assistant
const NIGHT_ORDER = [
  "armor",
  "priest",
  "seherin",
  "werwolf",
  "vampir",
  "hexe",
  "heiler",
  "lehrling",
  "traumwolf",
  "wolfsjunges",
  "zahnarzt",
  "putzfrau",
  "bodyguard",
]

const Play = ({
  players,
  pickedRoles,
  availableRoles,
  availableEffects,
  roleTimings,
  roleNightWakeRules,
  phase,
  togglePlayerAlive,
  fullReset,
  navTo,
  togglePlayerEffect,
  createEffect,
  deleteEffect,
  advanceNightZero,
  advanceToDay,
  advanceToNight,
}: PlayProps) => {
  const [endAlertIsOpen, setEndAlertIsOpen] = React.useState(false)
  const [playerDetailsAreOpen, setPlayerDetailsAreOpen] = React.useState(false)
  const [newEffectFormIsOpen, setNewEffectFormIsOpen] = React.useState(false)
  const [playerNameDialogIsOpen, setPlayerNameDialogIsOpen] = React.useState(false)
  const [selectedPlayer, setSelectedPlayer] = React.useState(0)
  const [nameEditPlayerID, setNameEditPlayerID] = React.useState<number | null>(null)
  const [nameInput, setNameInput] = React.useState("")
  const [playerNames, setPlayerNames] = React.useState<{ [playerID: number]: string }>({})
  const [doneSteps, setDoneSteps] = React.useState<Set<string>>(new Set())

  const selectedPlayerData = players[selectedPlayer]
  const sortedEffectIDs = Object.keys(availableEffects).sort((effectA, effectB) => {
    const durationDiff = durationSortOrder(availableEffects[effectA].duration) - durationSortOrder(availableEffects[effectB].duration)
    if (durationDiff !== 0) {
      return durationDiff
    }
    return availableEffects[effectA].name.localeCompare(availableEffects[effectB].name, "de")
  })

  const allowedEffectDurations = React.useMemo(() => (
    new Set<EffectDuration>(getAllowedEffectDurations(phase.mode, phase.nightCount))
  ), [phase.mode, phase.nightCount])

  const selectableEffectIDs = React.useMemo(() => (
    sortedEffectIDs.filter(effectID => allowedEffectDurations.has(availableEffects[effectID]?.duration))
  ), [sortedEffectIDs, availableEffects, allowedEffectDurations])

  const effectPickerHint = React.useMemo(() => {
    if (phase.mode === "day") {
      return "Tagsüber lassen sich nur permanente Effekte aktivieren."
    }
    if (phase.nightCount === 0) {
      return "In Nacht 0 sind nur permanente Effekte auswählbar."
    }
    return "Ab Nacht 1 sind nur Nacht- und Nächster-Tag-Effekte aktivierbar."
  }, [phase.mode, phase.nightCount])

  const { wakingRoleIDsTonight, additionalActiveRoleIDsTonight } = React.useMemo(() => {
    const wakingRoleIDs = new Set<string>()
    const additionalActiveRoleIDs = new Set<string>()
    if (phase.mode !== "night") {
      return {
        wakingRoleIDsTonight: wakingRoleIDs,
        additionalActiveRoleIDsTonight: additionalActiveRoleIDs,
      }
    }

    Object.entries(pickedRoles).forEach(([roleID, count]) => {
      if (count <= 0 || !roleWakesAtNight(roleTimings[roleID] || "day")) {
        return
      }

      const wakeRule = roleNightWakeRules[roleID] || {}
      const fallbackSchedule = wakeRule.schedule
      const factionSchedule = wakeRule.factionSchedule || fallbackSchedule
      const additionalRoleSchedule = wakeRule.additionalRoleSchedule || fallbackSchedule

      const wakeAsFaction = Boolean(wakeRule.wakeAsFaction && wakeRule.factionID)
      const wakesAsFactionTonight = wakeAsFaction && wakesOnNight(factionSchedule, phase.nightCount)
      const wakesAsAdditionalRoleTonight = Boolean(wakeRule.hasAdditionalRoleWake) && wakesOnNight(additionalRoleSchedule, phase.nightCount)

      const wakesAsRoleTonight = (!wakeAsFaction && wakesOnNight(fallbackSchedule, phase.nightCount))
        || wakesAsAdditionalRoleTonight

      if (wakesAsFactionTonight || wakesAsRoleTonight) {
        wakingRoleIDs.add(roleID)
      }

      if (wakesAsFactionTonight && wakesAsAdditionalRoleTonight) {
        additionalActiveRoleIDs.add(roleID)
      }
    })

    return {
      wakingRoleIDsTonight: wakingRoleIDs,
      additionalActiveRoleIDsTonight: additionalActiveRoleIDs,
    }
  }, [phase.mode, phase.nightCount, pickedRoles, roleTimings, roleNightWakeRules])

  const tonightOrder = React.useMemo(() => {
    if (phase.mode !== "night") return []
    return NIGHT_ORDER.filter(roleID => wakingRoleIDsTonight.has(roleID))
  }, [phase.mode, wakingRoleIDsTonight])

  const endGameOk = () => {
    setEndAlertIsOpen(false)
    fullReset()
    navTo('prepare')
  }

  const toggleStep = (roleID: string) => {
    const nextDone = new Set(doneSteps)
    if (nextDone.has(roleID)) {
      nextDone.delete(roleID)
    } else {
      nextDone.add(roleID)
    }
    setDoneSteps(nextDone)
  }

  React.useEffect(() => {
    setDoneSteps(new Set())
  }, [phase.mode, phase.nightCount])

  const closeNewEffectForm = () => {
    setNewEffectFormIsOpen(false)
    setPlayerDetailsAreOpen(true)
  }

  const openPlayerNameDialog = (playerID: number) => {
    setNameEditPlayerID(playerID)
    setNameInput(playerNames[playerID] || "")
    setPlayerNameDialogIsOpen(true)
  }

  const closePlayerNameDialog = () => {
    setPlayerNameDialogIsOpen(false)
    setNameEditPlayerID(null)
    setNameInput("")
  }

  const savePlayerName = () => {
    if (nameEditPlayerID === null) {
      return
    }

    const normalizedName = nameInput.trim()
    setPlayerNames(previousNames => {
      const nextNames = { ...previousNames }
      if (normalizedName.length > 0) {
        nextNames[nameEditPlayerID] = normalizedName
      } else {
        delete nextNames[nameEditPlayerID]
      }
      return nextNames
    })
    closePlayerNameDialog()
  }

  const submitNewEffect = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const defaultDuration = effectDurationOptions[0]?.duration || "permanent"
    const rawDuration = formData.get("newEffectDuration")
    const newEffectDuration = (rawDuration === "night" || rawDuration === "next_day" || rawDuration === "permanent")
      ? rawDuration
      : defaultDuration
    const effectIcon = String(formData.get("newEffectIcon") || "").trim() || (
      newEffectDuration === "night" ? "fa-moon" : newEffectDuration === "next_day" ? "fa-sun" : "fa-heart"
    )

    let effectName = String(formData.get("newEffectName") || "").trim()
    if (!effectName) {
      effectName = effectDurationLabel(newEffectDuration)
    }

    const effectID = generateEffectID(effectName)
    if (effectID in availableEffects) {
      alert(`Effekt "${effectName}" existiert bereits.`)
      return
    }

    createEffect({
      newEffect: {
        name: effectName,
        icon: effectIcon,
        duration: newEffectDuration,
      }
    })
    togglePlayerEffect({ playerID: selectedPlayer, effectID })
    closeNewEffectForm()
    event.currentTarget.reset()
  }

  const renderPlayerCard = (player: Player, playerID: number) => {
    const isDead = !player.alive
    const roleWakesTonight = phase.mode === "night" && wakingRoleIDsTonight.has(player.role)
    const roleHasAdditionalWakeTonight = phase.mode === "night" && additionalActiveRoleIDsTonight.has(player.role)
    
    return (
      <div 
        key={playerID} 
        className={`${styles.playerCard} ${isDead ? styles.playerDead : ''} ${roleWakesTonight ? styles.playerWakeTonight : ''}`}
      >
        <div className={styles.playerCardContent}>
          <div className={styles.playerHeader}>
            <div className={styles.playerInfo}>
              <span className={styles.playerNumber}>Spieler {playerID + 1}</span>
              <span className={styles.playerRoleName}>{availableRoles[player.role]}</span>
              {playerNames[playerID] && (
                <span className={styles.playerNameLabel}>{playerNames[playerID]}</span>
              )}
            </div>
            <div className={styles.playerActions}>
              <button 
                className={`${styles.actionButton} ${isDead ? styles.actionButtonDead : ''}`}
                onClick={() => togglePlayerAlive(playerID)}
                title={isDead ? "Wiederbeleben" : "Eliminieren"}
              >
                <Icon icon={isDead ? 'medkit' : 'skull-crossbones'} />
              </button>
              <button 
                className={styles.actionButton}
                onClick={() => { setPlayerDetailsAreOpen(true); setSelectedPlayer(playerID) }}
                title="Details & Effekte"
              >
                <Icon icon="ellipsis-v" />
              </button>
            </div>
          </div>
          
          <div className={styles.playerFooter}>
            {roleWakesTonight && (
              <span className={`${styles.wakeTonightBadge} ${styles.wakeTonightBadgeActive}`}>wach</span>
            )}
            {roleHasAdditionalWakeTonight && (
              <span className={styles.additionalWakeBadge}>Aktiv</span>
            )}
            
            {phase.mode === "day" && (
              <button
                className={styles.playerNameEditButton}
                onClick={() => openPlayerNameDialog(playerID)}
                aria-label="Name bearbeiten"
              >
                <Icon icon="fa-pen" />
              </button>
            )}

            {player.effects.map(effectID => {
              const effect = availableEffects[effectID]
              if (!effect) return null
              return (
                <span key={effectID} className={`${styles.effectChip} ${effectDurationClass(effect.duration)}`} title={effect.name}>
                  <Icon icon={effect.icon} />
                </span>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Page
      renderToolbar={() => (<Toolbar />)}
      renderFixed={() =>
        <div>
          <Fab position="bottom left" onClick={() => setEndAlertIsOpen(true)}><Icon icon='fa-undo' /></Fab>
        </div>
      }
    >
      <section className={styles.phasePanel}>
        <div className={styles.phaseHeader}>
          <div className={styles.phaseHeaderLeft}>
            <span className={`${styles.phaseBadge} ${phase.mode === "night" ? styles.phaseNight : styles.phaseDay}`}>
              {phase.mode === "night" ? `Nacht ${phase.nightCount}` : `Tag ${phase.dayCount}`}
            </span>
            <span className={styles.phaseCounter}>Status: {countAlivePlayers(players)} / {players.length} am Leben</span>
          </div>
          <Button
            modifier="quiet"
            onClick={() => {
              if (phase.mode === "night") {
                if (phase.nightCount === 0) {
                  advanceNightZero()
                } else {
                  advanceToDay()
                }
                return
              }
              advanceToNight()
            }}
          >
            {phase.mode === "night" ? "Nacht beenden" : "Tag beenden"}
          </Button>
        </div>

        {phase.mode === "night" ? (
          <p className={styles.sectionHint}>Rollen, die in dieser Nacht aufwachen, sind markiert.</p>
        ) : (
          <p className={styles.sectionHint}>Nutze den Tag, um Namen zu vergeben und Effekte zu prüfen.</p>
        )}
      </section>

      {phase.mode === "night" && tonightOrder.length > 0 && (
        <section className={styles.narratorAssistant}>
          <div className={styles.narratorTitle}>
            <Icon icon="fa-list-check" /> Erzähler-Assistent (Nacht-Reihenfolge)
          </div>
          <div className={styles.narratorList}>
            {tonightOrder.map((roleID, index) => (
              <div 
                key={roleID} 
                className={`${styles.narratorItem} ${doneSteps.has(roleID) ? styles.narratorItemDone : ''}`}
                onClick={() => toggleStep(roleID)}
              >
                <div className={styles.narratorStepNumber}>{index + 1}</div>
                <span>{availableRoles[roleID]} aufwecken</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="scrollable_content">
        {players.map(renderPlayerCard)}
      </div>

      <AlertDialog isOpen={endAlertIsOpen} isCancelable={true} onCancel={() => setEndAlertIsOpen(false)}>
        <div className="alert-dialog-title">Spiel beenden?</div>
        <div className="alert-dialog-content">
          Möchtest du das aktuelle Spiel wirklich abbrechen und zur Vorbereitung zurückkehren?
        </div>
        <div className="alert-dialog-footer flex">
          <Button onClick={endGameOk} className="alert-dialog-button">
            Ja
          </Button>
          <Button onClick={() => setEndAlertIsOpen(false)} className="alert-dialog-button">
            Nein
          </Button>
        </div>
      </AlertDialog>

      <Dialog isOpen={playerDetailsAreOpen && !!selectedPlayerData} isCancelable={true} onCancel={() => setPlayerDetailsAreOpen(false)}>
        <ListTitle>
          {selectedPlayer + 1}: {selectedPlayerData ? availableRoles[selectedPlayerData.role] : ""}
          {playerNames[selectedPlayer] ? ` · ${playerNames[selectedPlayer]}` : ""}
        </ListTitle>
        <List className="effect-list">
          {selectableEffectIDs.map((effectID: string) => {
            const effect = availableEffects[effectID]
            if (!effect || !selectedPlayerData) {
              return null
            }
            return (
              <ListItem key={effectID} tappable onClick={() => togglePlayerEffect({ playerID: selectedPlayer, effectID })}>
                <label className="left">
                  <Checkbox
                    inputId={effectID}
                    checked={selectedPlayerData.effects.includes(effectID)}
                    onChange={() => {}} // Handled by ListItem onClick
                    modifier="noborder"
                  />
                </label>
                <label htmlFor={effectID} className="icon-text">
                  <Icon icon={effect.icon} />
                  {effect.name}
                  <span className={`${styles.effectDurationLabel} ${effectDurationClass(effect.duration)}`}>
                    {effectDurationLabel(effect.duration)}
                  </span>
                </label>
                <button className="right button--dialog" onClick={(e) => { e.stopPropagation(); deleteEffect(effectID); }}>
                  <Icon icon="trash" />
                </button>
              </ListItem>
            )
          })}
        </List>
        <p className={styles.effectPickerHint}>{effectPickerHint}</p>
        <Button onClick={() => { setPlayerDetailsAreOpen(false); setNewEffectFormIsOpen(true) }} className="alert-dialog-button">Neuer Effekt</Button>
        <Button onClick={() => setPlayerDetailsAreOpen(false)} className="alert-dialog-button">Schließen</Button>
      </Dialog>

      <Dialog isOpen={newEffectFormIsOpen} isCancelable={true} onCancel={closeNewEffectForm}>
        <ListTitle>
          Neuer Effekt
        </ListTitle>
        <form onSubmit={submitNewEffect}>
          <div className="effect-form-wrapper">
            <Input name="newEffectName" inputId="new_effect" modifier="material" placeholder="Name des Effekts" autocomplete="off" float style={{width: '100%'}} />
            <div className={styles.durationPicker}>
              {effectDurationOptions.map((option, index) => (
                <label key={option.duration}>
                  <input
                    type="radio"
                    name="newEffectDuration"
                    value={option.duration}
                    defaultChecked={index === 0}
                  />
                  {` ${option.label}`}
                </label>
              ))}
            </div>
            <div className="icon-list">
              {availableIcons.length > 0 ? availableIcons.map(iconID => {
                return (
                  <div className="icon-list-element" key={iconID}>
                    <input type="radio" id={iconID} name="newEffectIcon" value={iconID} className="hidden" />
                    <label htmlFor={iconID}>
                      <div className="button button--outline button--effect" >
                        <Icon icon={iconID} />
                      </div>
                    </label>
                  </div>
                )
              }) : "No icons available"}
            </div>
          </div>
          <button type="submit" className="alert-dialog-button">Speichern</button>
        </form>
        <Button onClick={closeNewEffectForm} className="alert-dialog-button">Abbrechen</Button>
      </Dialog>

      <Dialog isOpen={playerNameDialogIsOpen && nameEditPlayerID !== null} isCancelable={true} onCancel={closePlayerNameDialog}>
        <ListTitle>
          Name für Spieler {nameEditPlayerID !== null ? nameEditPlayerID + 1 : ""}
        </ListTitle>
        <div className={styles.nameDialogBody}>
          <Input
            value={nameInput}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNameInput(event.currentTarget.value)}
            modifier="material"
            placeholder="Name eingeben"
            float
            style={{width: '100%'}}
          />
        </div>
        <Button onClick={savePlayerName} className="alert-dialog-button">Speichern</Button>
        <Button onClick={closePlayerNameDialog} className="alert-dialog-button">Abbrechen</Button>
      </Dialog>

    </Page >
  )
}

export default connector(Play)
