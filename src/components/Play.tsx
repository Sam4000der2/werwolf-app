import React from 'react'
import { Fab, Icon, Page, List, ListItem, ListTitle, AlertDialog, Button, Dialog, Checkbox, Input } from 'react-onsenui'
import { connect, ConnectedProps } from 'react-redux'

import { togglePlayerAlive, fullReset, togglePlayerEffect, createEffect, deleteEffect, generateEffectID, advanceNightZero, advanceToDay, advanceToNight } from '../reducers/game'
import { navTo } from '../reducers/ui'
import Toolbar from './Toolbar'
import { availableIcons, defaultEffectOrder } from '../config'
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

type PlayProps = ConnectedProps<typeof connector>
type ConfirmationState = {
  isOpen: boolean
  title: string
  message: string
  onConfirm: (() => void) | null
}

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
const PLAYER_NAME_STORAGE_KEY = "playPlayerNames"

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

const NARRATOR_NIGHT_ORDER_PREFERENCE = [
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
  const [currentNightStepIndex, setCurrentNightStepIndex] = React.useState(0)
  const [effectFormError, setEffectFormError] = React.useState("")
  const [confirmationState, setConfirmationState] = React.useState<ConfirmationState>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  })

  const selectedPlayerData = players[selectedPlayer]
  const defaultEffectPriorityByID = React.useMemo(() => {
    const mappedPriority: { [effectID: string]: number } = {}
    defaultEffectOrder.forEach((effectID, index) => {
      mappedPriority[effectID] = index
    })
    return mappedPriority
  }, [])

  const selectedPlayerEffectIDs = React.useMemo(() => (
    new Set(selectedPlayerData?.effects || [])
  ), [selectedPlayerData])

  const sortedEffectIDs = React.useMemo(() => (
    Object.keys(availableEffects).sort((effectA, effectB) => {
      const effectAIsActive = selectedPlayerEffectIDs.has(effectA)
      const effectBIsActive = selectedPlayerEffectIDs.has(effectB)
      if (effectAIsActive !== effectBIsActive) {
        return effectAIsActive ? -1 : 1
      }

      const fallbackPriority = Number.MAX_SAFE_INTEGER
      const effectAPriority = defaultEffectPriorityByID[effectA] ?? fallbackPriority
      const effectBPriority = defaultEffectPriorityByID[effectB] ?? fallbackPriority
      const effectAIsDefault = effectAPriority !== fallbackPriority
      const effectBIsDefault = effectBPriority !== fallbackPriority
      if (effectAIsDefault !== effectBIsDefault) {
        return effectAIsDefault ? -1 : 1
      }
      if (effectAPriority !== effectBPriority) {
        return effectAPriority - effectBPriority
      }

      const durationDiff = durationSortOrder(availableEffects[effectA].duration) - durationSortOrder(availableEffects[effectB].duration)
      if (durationDiff !== 0) {
        return durationDiff
      }
      return availableEffects[effectA].name.localeCompare(availableEffects[effectB].name, "de")
    })
  ), [availableEffects, selectedPlayerEffectIDs, defaultEffectPriorityByID])

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

  const narratorOrderPriorityByID = React.useMemo(() => {
    const mappedPriority: { [roleID: string]: number } = {}
    NARRATOR_NIGHT_ORDER_PREFERENCE.forEach((roleID, index) => {
      mappedPriority[roleID] = index
    })
    return mappedPriority
  }, [])

  const tonightOrder = React.useMemo(() => {
    if (phase.mode !== "night") return []
    return Array.from(wakingRoleIDsTonight).sort((roleA, roleB) => {
      const fallbackPriority = Number.MAX_SAFE_INTEGER
      const roleAPriority = narratorOrderPriorityByID[roleA] ?? fallbackPriority
      const roleBPriority = narratorOrderPriorityByID[roleB] ?? fallbackPriority
      if (roleAPriority !== roleBPriority) {
        return roleAPriority - roleBPriority
      }
      return (availableRoles[roleA] || roleA).localeCompare(availableRoles[roleB] || roleB, "de")
    })
  }, [phase.mode, wakingRoleIDsTonight, narratorOrderPriorityByID, availableRoles])

  const currentNightRoleID = tonightOrder[currentNightStepIndex] || null

  const endGameOk = () => {
    setEndAlertIsOpen(false)
    try {
      localStorage.removeItem(PLAYER_NAME_STORAGE_KEY)
    } catch {
      // ignore storage errors
    }
    setPlayerNames({})
    setDoneSteps(new Set())
    setCurrentNightStepIndex(0)
    fullReset()
    navTo('prepare')
  }

  const closeConfirmationDialog = () => {
    setConfirmationState({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null,
    })
  }

  const requestConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmationState({
      isOpen: true,
      title,
      message,
      onConfirm,
    })
  }

  const confirmDialogOk = () => {
    const pendingAction = confirmationState.onConfirm
    closeConfirmationDialog()
    if (pendingAction) {
      pendingAction()
    }
  }

  const toggleStep = (roleID: string) => {
    const nextDone = new Set(doneSteps)
    if (nextDone.has(roleID)) {
      nextDone.delete(roleID)
    } else {
      nextDone.add(roleID)
    }
    setDoneSteps(nextDone)

    if (currentNightRoleID === roleID) {
      setCurrentNightStepIndex((previousIndex) => {
        if (tonightOrder.length <= 0) {
          return 0
        }
        return Math.min(previousIndex + 1, tonightOrder.length - 1)
      })
    }
  }

  React.useEffect(() => {
    setDoneSteps(new Set())
    setCurrentNightStepIndex(0)
  }, [phase.mode, phase.nightCount])

  React.useEffect(() => {
    if (tonightOrder.length <= 0) {
      setDoneSteps(new Set())
      setCurrentNightStepIndex(0)
      return
    }

    setDoneSteps((previousDoneSteps) => {
      const nextDoneSteps = new Set<string>()
      previousDoneSteps.forEach((roleID) => {
        if (tonightOrder.includes(roleID)) {
          nextDoneSteps.add(roleID)
        }
      })
      return nextDoneSteps
    })
    setCurrentNightStepIndex((previousIndex) => Math.min(previousIndex, tonightOrder.length - 1))
  }, [tonightOrder])

  React.useEffect(() => {
    try {
      const rawPlayerNames = localStorage.getItem(PLAYER_NAME_STORAGE_KEY)
      if (!rawPlayerNames) {
        return
      }
      const parsedPlayerNames = JSON.parse(rawPlayerNames)
      if (!parsedPlayerNames || typeof parsedPlayerNames !== "object" || Array.isArray(parsedPlayerNames)) {
        return
      }

      const normalizedNames: { [playerID: number]: string } = {}
      Object.entries(parsedPlayerNames).forEach(([rawPlayerID, rawPlayerName]) => {
        const playerID = Number(rawPlayerID)
        if (!Number.isInteger(playerID) || playerID < 0) {
          return
        }
        if (typeof rawPlayerName !== "string") {
          return
        }
        const normalizedName = rawPlayerName.trim()
        if (normalizedName.length <= 0) {
          return
        }
        normalizedNames[playerID] = normalizedName
      })
      setPlayerNames(normalizedNames)
    } catch {
      // ignore malformed persisted names
    }
  }, [])

  React.useEffect(() => {
    try {
      localStorage.setItem(PLAYER_NAME_STORAGE_KEY, JSON.stringify(playerNames))
    } catch {
      // ignore storage write errors
    }
  }, [playerNames])

  const closeNewEffectForm = () => {
    setNewEffectFormIsOpen(false)
    setEffectFormError("")
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
      setEffectFormError(`Effekt "${effectName}" existiert bereits.`)
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

  const jumpNightStep = (direction: "previous" | "next") => {
    setCurrentNightStepIndex((previousIndex) => {
      if (tonightOrder.length <= 0) {
        return 0
      }
      if (direction === "previous") {
        return Math.max(0, previousIndex - 1)
      }
      return Math.min(tonightOrder.length - 1, previousIndex + 1)
    })
  }

  const advancePhase = () => {
    if (phase.mode === "night") {
      const confirmText = phase.nightCount === 0
        ? "Nacht 0 beenden und zu Nacht 1 wechseln?"
        : `Nacht ${phase.nightCount} beenden und zum Tag wechseln?`
      requestConfirmation("Phase wechseln?", confirmText, () => {
        if (phase.nightCount === 0) {
          advanceNightZero()
        } else {
          advanceToDay()
        }
      })
      return
    }

    requestConfirmation(
      "Phase wechseln?",
      `Tag ${phase.dayCount} beenden und zur nächsten Nacht wechseln?`,
      () => advanceToNight(),
    )
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
                onClick={() => {
                  if (!isDead) {
                    requestConfirmation(
                      "Spieler eliminieren?",
                      `Spieler ${playerID + 1} wirklich eliminieren?`,
                      () => togglePlayerAlive(playerID),
                    )
                    return
                  }
                  togglePlayerAlive(playerID)
                }}
                title={isDead ? "Wiederbeleben" : "Eliminieren"}
                aria-label={isDead ? `Spieler ${playerID + 1} wiederbeleben` : `Spieler ${playerID + 1} eliminieren`}
              >
                <Icon icon={isDead ? 'medkit' : 'skull-crossbones'} />
              </button>
              <button 
                className={styles.actionButton}
                onClick={() => { setPlayerDetailsAreOpen(true); setSelectedPlayer(playerID) }}
                title="Details & Effekte"
                aria-label={`Details und Effekte für Spieler ${playerID + 1} öffnen`}
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
          <Fab position="bottom left" onClick={() => setEndAlertIsOpen(true)} aria-label="Spiel beenden und zur Vorbereitung zurückkehren">
            <Icon icon='fa-undo' />
          </Fab>
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
            onClick={advancePhase}
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
          <div className={styles.narratorControls}>
            <button
              type="button"
              className={styles.narratorControlButton}
              onClick={() => jumpNightStep("previous")}
              disabled={currentNightStepIndex <= 0}
              aria-label="Vorheriger Nachtschritt"
            >
              Zurück
            </button>
            <span className={styles.narratorProgress}>
              Schritt {tonightOrder.length > 0 ? currentNightStepIndex + 1 : 0} / {tonightOrder.length}
            </span>
            <button
              type="button"
              className={styles.narratorControlButton}
              onClick={() => jumpNightStep("next")}
              disabled={currentNightStepIndex >= tonightOrder.length - 1}
              aria-label="Nächster Nachtschritt"
            >
              Weiter
            </button>
          </div>
          <div className={styles.narratorList}>
            {tonightOrder.map((roleID, index) => (
              <button
                type="button"
                key={roleID} 
                className={`${styles.narratorItemButton} ${doneSteps.has(roleID) ? styles.narratorItemDone : ''} ${currentNightRoleID === roleID ? styles.narratorItemActive : ''}`}
                onClick={() => toggleStep(roleID)}
                aria-pressed={doneSteps.has(roleID)}
                aria-label={`${availableRoles[roleID]} aufwecken ${doneSteps.has(roleID) ? "erledigt" : "offen"}`}
              >
                <div className={styles.narratorStepNumber}>{index + 1}</div>
                <span>{availableRoles[roleID]} aufwecken</span>
              </button>
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

      <AlertDialog isOpen={confirmationState.isOpen} isCancelable={true} onCancel={closeConfirmationDialog}>
        <div className="alert-dialog-title">{confirmationState.title || "Bitte bestätigen"}</div>
        <div className="alert-dialog-content">{confirmationState.message}</div>
        <div className="alert-dialog-footer flex">
          <Button onClick={confirmDialogOk} className="alert-dialog-button">Ja</Button>
          <Button onClick={closeConfirmationDialog} className="alert-dialog-button">Nein</Button>
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
                <button
                  className="right button--dialog"
                  onClick={(e) => {
                    e.stopPropagation()
                    requestConfirmation(
                      "Effekt löschen?",
                      `Effekt "${effect.name}" wirklich löschen?`,
                      () => deleteEffect(effectID),
                    )
                  }}
                  aria-label={`Effekt ${effect.name} löschen`}
                >
                  <Icon icon="trash" />
                </button>
              </ListItem>
            )
          })}
        </List>
        <p className={styles.effectPickerHint}>{effectPickerHint}</p>
        <Button onClick={() => { setEffectFormError(""); setPlayerDetailsAreOpen(false); setNewEffectFormIsOpen(true) }} className="alert-dialog-button">Neuer Effekt</Button>
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
            {effectFormError.length > 0 && (
              <p className={styles.effectFormError}>{effectFormError}</p>
            )}
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
