import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const THEME_MODE_STORAGE_KEY = "uiThemeMode"

const readInitialThemeMode = (): ThemeMode => {
    try {
        const rawThemeMode = localStorage.getItem(THEME_MODE_STORAGE_KEY)
        if (rawThemeMode === "light" || rawThemeMode === "dark") {
            return rawThemeMode
        }
    } catch {
        // ignore storage read issues and fall back to system mode
    }
    return "system"
}

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        menuIsOpen: false,
        currentPage: 'prepare',
        themeMode: readInitialThemeMode(),
        // currentPage: 'play',
    } as UIState,
    reducers: {
        navTo(state, action: PayloadAction<Page>): UIState {
            return { ...state, currentPage: action.payload }
        },
        setThemeMode(state, action: PayloadAction<ThemeMode>): UIState {
            const themeMode = action.payload
            if (themeMode !== "system" && themeMode !== "light" && themeMode !== "dark") {
                return state
            }
            try {
                localStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode)
            } catch {
                // ignore storage write issues and still apply mode for current session
            }
            return { ...state, themeMode }
        }
    },
})

const { actions, reducer } = uiSlice
export const { navTo, setThemeMode } = actions
export default reducer
