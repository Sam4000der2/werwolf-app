import React from 'react'
import { Toolbar as OnsenToolbar, ToolbarButton, Icon, Dialog, Checkbox, Button } from 'react-onsenui'
import { connect, ConnectedProps } from 'react-redux'
import { setThemeMode, setFeatureFlag, resetFeatureFlags } from '../reducers/ui'
import styles from './Toolbar.module.css'

const connector = connect(
    (state: RootState) => ({
        currentPage: state.ui.currentPage,
        themeMode: state.ui.themeMode,
        featureFlags: state.ui.featureFlags,
    }),
    { setThemeMode, setFeatureFlag, resetFeatureFlags },
)

const Toolbar = ({ currentPage, themeMode, featureFlags, setThemeMode, setFeatureFlag, resetFeatureFlags }: ConnectedProps<typeof connector>) => {
    const [settingsAreOpen, setSettingsAreOpen] = React.useState(false)

    const featureFlagMeta: Array<{ id: AppFeatureFlagID, title: string, description: string }> = [
        {
            id: "confirmDialogs",
            title: "Zusatzdialoge",
            description: "Zusätzliche Bestätigungsfenster vor kritischen Aktionen.",
        },
        {
            id: "deckBackups",
            title: "Decks & Backups",
            description: "Deckverwaltung und Rollen-/Deck-Import und -Export in der Vorbereitung.",
        },
        {
            id: "defaultStatusEffects",
            title: "Default-Statuseffekte",
            description: "Vordefinierte Statuseffekte in der Effektbibliothek.",
        },
        {
            id: "advancedNightAssistant",
            title: "Nacht-Assistent & Fraktionen/Nachtschemata",
            description: "Erzähler-Assistent, Tag/Nacht-Wechsel, Fraktionen und Zusatz-Aufwachen.",
        },
        {
            id: "categorizedRoleSorting",
            title: "Rollen-Kategorien",
            description: "Rollen in Dorf/Werwölfe/Spezial/Eigene gruppieren und suchen.",
        },
    ]

    return (
        <OnsenToolbar>
            <div className="center">{toolbarText(currentPage)}</div>
            <div className={`right ${styles.themeSwitch}`}>
                <>
                    <ToolbarButton
                        className={themeMode === "system" ? styles.themeActive : ""}
                        onClick={() => setThemeMode("system")}
                        title="Systemmodus"
                        aria-label="Systemmodus aktivieren"
                    >
                        <Icon icon="fa-adjust" />
                    </ToolbarButton>
                    <ToolbarButton
                        className={themeMode === "light" ? styles.themeActive : ""}
                        onClick={() => setThemeMode("light")}
                        title="Tagmodus"
                        aria-label="Tagmodus aktivieren"
                    >
                        <Icon icon="fa-sun" />
                    </ToolbarButton>
                    <ToolbarButton
                        className={themeMode === "dark" ? styles.themeActive : ""}
                        onClick={() => setThemeMode("dark")}
                        title="Nachtmodus"
                        aria-label="Nachtmodus aktivieren"
                    >
                        <Icon icon="fa-moon" />
                    </ToolbarButton>
                </>
                <ToolbarButton
                    onClick={() => setSettingsAreOpen(true)}
                    title="Einstellungen"
                    aria-label="Funktions-Einstellungen öffnen"
                >
                    <Icon icon="fa-cog" />
                </ToolbarButton>
            </div>

            <Dialog isOpen={settingsAreOpen} isCancelable={true} onCancel={() => setSettingsAreOpen(false)}>
                <div className={styles.settingsDialog}>
                    <h3 className={styles.settingsTitle}>Funktions-Einstellungen</h3>
                    <p className={styles.settingsHint}>
                        Hier kannst du Fork-Funktionen gezielt ein- oder ausschalten.
                    </p>
                    <div className={styles.settingsList}>
                        {featureFlagMeta.map((featureFlag) => (
                            <label key={featureFlag.id} className={styles.settingsRow}>
                                <span className={styles.settingsText}>
                                    <span className={styles.settingsName}>{featureFlag.title}</span>
                                    <span className={styles.settingsDescription}>{featureFlag.description}</span>
                                </span>
                                <Checkbox
                                    checked={featureFlags[featureFlag.id]}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        const enabled = event.currentTarget.checked
                                        setFeatureFlag({ flagID: featureFlag.id, enabled })
                                    }}
                                />
                            </label>
                        ))}
                    </div>
                    <div className={styles.settingsActions}>
                        <Button modifier="quiet" onClick={resetFeatureFlags}>Config-Defaults</Button>
                        <Button onClick={() => setSettingsAreOpen(false)}>Schließen</Button>
                    </div>
                </div>
            </Dialog>
        </OnsenToolbar>
    )
}

export default connector(Toolbar)


function toolbarText(currentPage: Page): string {
    switch (currentPage) {
        case 'prepare':
            return "Das Dorf zusammenstellen"
        case 'deal':
            return "Rollen austeilen"
        case 'play':
            return "Spiel leiten"
        default:
            return "Not implemented"
    }
}
