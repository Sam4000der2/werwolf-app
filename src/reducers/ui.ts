import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { defaultFeatureFlags } from '../config'

const THEME_MODE_STORAGE_KEY = "uiThemeMode"
const FEATURE_FLAGS_STORAGE_KEY = "uiFeatureFlags"

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

const normalizeFeatureFlags = (value: unknown): AppFeatureFlags => {
    const candidateFlags = (typeof value === "object" && value !== null && !Array.isArray(value))
        ? (value as { [key: string]: unknown })
        : {}

    return {
        confirmDialogs: typeof candidateFlags.confirmDialogs === "boolean"
            ? candidateFlags.confirmDialogs
            : defaultFeatureFlags.confirmDialogs,
        narratorAssistant: typeof candidateFlags.narratorAssistant === "boolean"
            ? candidateFlags.narratorAssistant
            : defaultFeatureFlags.narratorAssistant,
        persistentPlayerNames: typeof candidateFlags.persistentPlayerNames === "boolean"
            ? candidateFlags.persistentPlayerNames
            : defaultFeatureFlags.persistentPlayerNames,
        prioritizeStatusEffects: typeof candidateFlags.prioritizeStatusEffects === "boolean"
            ? candidateFlags.prioritizeStatusEffects
            : defaultFeatureFlags.prioritizeStatusEffects,
    }
}

const readInitialFeatureFlags = (): AppFeatureFlags => {
    try {
        const rawFeatureFlags = localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY)
        if (!rawFeatureFlags) {
            return { ...defaultFeatureFlags }
        }
        return normalizeFeatureFlags(JSON.parse(rawFeatureFlags))
    } catch {
        return { ...defaultFeatureFlags }
    }
}

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        menuIsOpen: false,
        currentPage: 'prepare',
        themeMode: readInitialThemeMode(),
        featureFlags: readInitialFeatureFlags(),
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
        },
        setFeatureFlag(state, action: PayloadAction<{ flagID: AppFeatureFlagID, enabled: boolean }>): UIState {
            const { flagID, enabled } = action.payload
            if (!(flagID in state.featureFlags)) {
                return state
            }
            const featureFlags = { ...state.featureFlags, [flagID]: enabled }
            try {
                localStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(featureFlags))
            } catch {
                // ignore storage write issues and still apply flags for current session
            }
            return { ...state, featureFlags }
        },
        resetFeatureFlags(state): UIState {
            try {
                localStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(defaultFeatureFlags))
            } catch {
                // ignore storage write issues and still apply defaults for current session
            }
            return { ...state, featureFlags: { ...defaultFeatureFlags } }
        }
    },
})

const { actions, reducer } = uiSlice
export const { navTo, setThemeMode, setFeatureFlag, resetFeatureFlags } = actions
export default reducer
