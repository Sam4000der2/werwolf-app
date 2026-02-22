import React from 'react'
import { Button, Fab, Icon, List, ListItem, Page } from 'react-onsenui';
import { connect, ConnectedProps } from 'react-redux'

import RolePicker from './RolePicker';
import {
  resetRoles,
  dealRoles,
  restoreCustomRoles,
  saveCurrentDeck,
  overwriteSavedDeck,
  deleteSavedDeck,
  loadSavedDeck,
  importSavedDecks,
} from '../reducers/game'
import { navTo } from '../reducers/ui'
import Toolbar from './Toolbar';
import styles from './Preparation.module.css';


function mapStateToProps(state: RootState) {
  return {
    roleCount: totalNumberOfRolesInGame(state.game.pickedRoles),
    customRoles: state.game.customRoles,
    savedDecks: state.game.savedDecks,
  }
}

const mapDispatch = {
  resetRoles,
  dealRoles,
  restoreCustomRoles,
  saveCurrentDeck,
  overwriteSavedDeck,
  deleteSavedDeck,
  loadSavedDeck,
  importSavedDecks,
  navTo,
}
const connector = connect(mapStateToProps, mapDispatch)


const hiddenInputStyle: React.CSSProperties = {
  display: 'none',
};
const MAX_BACKUP_FILE_SIZE_BYTES = 2 * 1024 * 1024

type PreparationProps = ConnectedProps<typeof connector>

type RolesBackup = {
  version: number
  exportedAt: string
  customRoles: { [key: string]: string }
}

type DecksBackup = {
  version: number
  exportedAt: string
  customRoles: { [key: string]: string }
  decks: SavedDeck[]
}

const isPlainObject = (value: unknown): value is { [key: string]: unknown } => (
  typeof value === "object" && value !== null && !Array.isArray(value)
)

const extractCustomRoles = (value: unknown): { [key: string]: string } => {
  if (!isPlainObject(value)) {
    throw new Error("Ungültiges Backup-Format")
  }

  if ("customRoles" in value) {
    const customRoles = value.customRoles
    if (!isPlainObject(customRoles)) {
      throw new Error("Ungültiges Backup-Format")
    }
    return customRoles as { [key: string]: string }
  }

  return value as { [key: string]: string }
}

const extractDeckList = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value
  }

  if (!isPlainObject(value)) {
    return []
  }

  if ("decks" in value) {
    return value.decks
  }

  if ("savedDecks" in value) {
    return value.savedDecks
  }

  return []
}

const extractOptionalCustomRoles = (value: unknown): { [key: string]: string } => {
  if (!isPlainObject(value) || !("customRoles" in value)) {
    return {}
  }

  const customRoles = value.customRoles
  if (!isPlainObject(customRoles)) {
    return {}
  }

  return customRoles as { [key: string]: string }
}

const downloadJSON = (jsonValue: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(jsonValue, null, 2)], { type: "application/json" })
  const downloadURL = URL.createObjectURL(blob)
  const downloadLink = document.createElement("a")
  downloadLink.href = downloadURL
  downloadLink.download = filename
  downloadLink.rel = "noopener"
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
  URL.revokeObjectURL(downloadURL)
}

const totalRolesInDeck = (pickedRoles: SavedDeck["pickedRoles"]): number => (
  Object.values(pickedRoles).reduce((sum, roleCount) => sum + roleCount, 0)
)

const formatTimestamp = (rawTimestamp: string): string => {
  const timestamp = Date.parse(rawTimestamp)
  if (Number.isNaN(timestamp)) {
    return "unbekannt"
  }
  return new Date(timestamp).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })
}

const Preparation = ({
  roleCount,
  customRoles,
  savedDecks,
  resetRoles,
  dealRoles,
  restoreCustomRoles,
  saveCurrentDeck,
  overwriteSavedDeck,
  deleteSavedDeck,
  loadSavedDeck,
  importSavedDecks,
  navTo,
}: PreparationProps) => {
  const roleFileInputRef = React.useRef<HTMLInputElement>(null)
  const deckFileInputRef = React.useRef<HTMLInputElement>(null)
  const [deckName, setDeckName] = React.useState("")
  const [statusText, setStatusText] = React.useState("")

  const downloadRolesBackup = () => {
    const backup: RolesBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      customRoles: { ...customRoles },
    }

    downloadJSON(backup, `werwolf-rollen-backup-${backup.exportedAt.replaceAll(/[:.]/g, "-")}.json`)
  }

  const requestRoleRestore = () => {
    roleFileInputRef.current?.click()
  }

  const restoreRolesFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const backupFile = input.files?.[0]
    if (!backupFile) {
      return
    }
    if (backupFile.size > MAX_BACKUP_FILE_SIZE_BYTES) {
      alert("Backup-Datei ist zu groß.")
      input.value = ""
      return
    }

    try {
      const backupText = await backupFile.text()
      const parsedBackup = JSON.parse(backupText)
      const restoredCustomRoles = extractCustomRoles(parsedBackup)
      restoreCustomRoles(restoredCustomRoles)
      setStatusText("Rollen wurden wiederhergestellt.")
    } catch {
      alert("Backup konnte nicht gelesen werden. Bitte eine gültige JSON-Datei auswählen.")
    }

    input.value = ""
  }

  const saveDeck = () => {
    if (roleCount <= 0) {
      return
    }
    saveCurrentDeck({ name: deckName })
    setDeckName("")
    setStatusText("Deck gespeichert.")
  }

  const exportDecks = () => {
    const backup: DecksBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      customRoles: { ...customRoles },
      decks: [...savedDecks],
    }

    downloadJSON(backup, `werwolf-decks-${backup.exportedAt.replaceAll(/[:.]/g, "-")}.json`)
  }

  const requestDeckImport = () => {
    deckFileInputRef.current?.click()
  }

  const importDecksFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const backupFile = input.files?.[0]
    if (!backupFile) {
      return
    }
    if (backupFile.size > MAX_BACKUP_FILE_SIZE_BYTES) {
      alert("Deck-Backup ist zu groß.")
      input.value = ""
      return
    }

    try {
      const backupText = await backupFile.text()
      const parsedBackup = JSON.parse(backupText)
      const importedDecks = extractDeckList(parsedBackup)
      const importedCustomRoles = extractOptionalCustomRoles(parsedBackup)

      const hasDecks = Array.isArray(importedDecks) && importedDecks.length > 0
      const hasCustomRoles = Object.keys(importedCustomRoles).length > 0
      if (!hasDecks && !hasCustomRoles) {
        throw new Error("Ungültiges Backup")
      }

      if (hasCustomRoles) {
        restoreCustomRoles({ ...customRoles, ...importedCustomRoles })
      }
      if (hasDecks) {
        importSavedDecks(importedDecks)
      }

      setStatusText("Deck-Backup importiert.")
    } catch {
      alert("Deck-Backup konnte nicht gelesen werden. Bitte eine gültige JSON-Datei auswählen.")
    }

    input.value = ""
  }

  const renderSavedDeck = (deck: SavedDeck) => (
    <ListItem key={deck.id}>
      <div className="center">
        <div className={styles.deckName}>{deck.name}</div>
        <div className={styles.deckMeta}>
          {totalRolesInDeck(deck.pickedRoles)} Rollen · {formatTimestamp(deck.updatedAt)}
        </div>
      </div>
      <div className="right">
        <div className={styles.deckRowActions}>
          <Button modifier="quiet" onClick={() => { loadSavedDeck(deck.id); setStatusText(`Deck "${deck.name}" geladen.`) }}>Laden</Button>
          <Button modifier="quiet" onClick={() => { overwriteSavedDeck({ deckID: deck.id }); setStatusText(`Deck "${deck.name}" aktualisiert.`) }}>Akt.</Button>
          <Button modifier="quiet" onClick={() => { deleteSavedDeck(deck.id); setStatusText(`Deck "${deck.name}" gelöscht.`) }}><Icon icon='trash' /></Button>
        </div>
      </div>
    </ListItem>
  )

  return (
    <Page
      renderToolbar={() => (<Toolbar />)}
      renderFixed={() =>
        <div>
          <Fab position="bottom left" onClick={() => resetRoles()}><Icon icon='fa-undo' /></Fab>
          <Fab position="bottom right" onClick={() => { dealRoles(); navTo('deal') }} disabled={roleCount === 0}><Icon icon='fa-play' /></Fab>
        </div>
      }
    >
      <div className={styles.preparationLayout}>
        <section className={styles.villageCard}>
          <p className={styles.villageLabel}>Dein Dorf hat</p>
          <p className={styles.villageCount}><span id="total_cnt">{roleCount}</span> Einwohner</p>
        </section>

        <details className={styles.deckPanel}>
          <summary className={styles.deckSummary}>
            <span>Decks & Backups</span>
            <span className={styles.deckSummaryMeta}>{savedDecks.length} gespeichert</span>
          </summary>
          <div className={styles.deckPanelContent}>
            <div className={styles.deckPanelHeader}>
              <h2 className={styles.deckPanelTitle}>Deckverwaltung</h2>
              <div className={styles.deckHeaderActions}>
                <Button modifier="quiet" onClick={exportDecks} disabled={savedDecks.length === 0}>Export</Button>
                <Button modifier="quiet" onClick={requestDeckImport}>Import</Button>
              </div>
            </div>
            <div className={styles.deckSaveRow}>
              <input
                type="text"
                value={deckName}
                className={styles.deckNameInput}
                onChange={event => setDeckName(event.currentTarget.value)}
                placeholder="Deckname (optional)"
              />
              <Button onClick={saveDeck} disabled={roleCount === 0}>Speichern</Button>
            </div>
            {statusText.length > 0 && <p className={styles.statusText}>{statusText}</p>}
            {savedDecks.length === 0 ? (
              <p className={styles.deckHint}>Noch kein Deck gespeichert.</p>
            ) : (
              <div className={styles.deckList}>
                <List>
                  {savedDecks.map(renderSavedDeck)}
                </List>
              </div>
            )}
            <div className={styles.secondaryBackup}>
              <span>Rollen-Backup</span>
              <div className={styles.secondaryBackupActions}>
                <Button modifier="quiet" onClick={downloadRolesBackup}>Export</Button>
                <Button modifier="quiet" onClick={requestRoleRestore}>Import</Button>
              </div>
            </div>
          </div>
        </details>

        <p className={styles.roleTimingHint}>
          Nachtoptionen: Tag/passive Rollen, jede Nacht (∞), einmalig nachts (1x), gerade Nächte (2n), ungerade Nächte (2n+1).
        </p>
        <section className={styles.rolePickerSection}>
          <div className="scrollable_content"><RolePicker /></div>
        </section>
        <input ref={deckFileInputRef} type="file" accept=".json,application/json" style={hiddenInputStyle} onChange={importDecksFromFile} />
        <input ref={roleFileInputRef} type="file" accept=".json,application/json" style={hiddenInputStyle} onChange={restoreRolesFromFile} />
        </div>
    </Page>
  )
}

export default connector(Preparation);

const totalNumberOfRolesInGame = (pickedRoles: GameState["pickedRoles"]) => Object.values(pickedRoles).reduce((a, c) => a + c)
