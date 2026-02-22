import { Toolbar as OnsenToolbar, ToolbarButton, Icon } from 'react-onsenui'
import { connect, ConnectedProps } from 'react-redux'
import { setThemeMode } from '../reducers/ui'
import styles from './Toolbar.module.css'

const connector = connect(
    (state: RootState) => ({
        currentPage: state.ui.currentPage,
        themeMode: state.ui.themeMode,
    }),
    { setThemeMode },
)

const Toolbar = ({ currentPage, themeMode, setThemeMode }: ConnectedProps<typeof connector>) => (
    <OnsenToolbar>
        <div className="center">{toolbarText(currentPage)}</div>
        <div className={`right ${styles.themeSwitch}`}>
            <ToolbarButton
                className={themeMode === "system" ? styles.themeActive : ""}
                onClick={() => setThemeMode("system")}
                title="Systemmodus"
            >
                <Icon icon="fa-adjust" />
            </ToolbarButton>
            <ToolbarButton
                className={themeMode === "light" ? styles.themeActive : ""}
                onClick={() => setThemeMode("light")}
                title="Tagmodus"
            >
                <Icon icon="fa-sun" />
            </ToolbarButton>
            <ToolbarButton
                className={themeMode === "dark" ? styles.themeActive : ""}
                onClick={() => setThemeMode("dark")}
                title="Nachtmodus"
            >
                <Icon icon="fa-moon" />
            </ToolbarButton>
        </div>
    </OnsenToolbar>
)

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
