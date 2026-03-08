
declare interface GameState {
    availableRoles: { [key: string]: string }
    availableFactions: { [key: string]: string }
    roleTimings: { [key: string]: RoleTiming }
    roleNightWakeRules: { [key: string]: RoleNightWakeRule }
    customRoles: { [key: string]: string }
    pickedRoles: { [key: string]: number }
    savedDecks: SavedDeck[]
    availableEffects: { [key: string]: Effect }
    players: Player[]
    witchPotions: {
        poisonUsed: boolean
        healUsed: boolean
    }
    phase: {
        mode: GamePhase
        nightCount: number
        dayCount: number
    }
    deal: {
        activeRoleIdx: number
        roleWasVisible: boolean
        roleIsVisible: boolean
    }
}

declare type Effect = {
    name: string
    icon: string
    duration: EffectDuration
}

declare type EffectDuration = "permanent" | "night" | "next_day"
declare type RoleTiming = "day" | "night"
declare type GamePhase = "day" | "night"
declare type RoleNightSchedule = "night_zero_only" | "from_night_one" | "every_even_night_from_two" | "every_odd_night_from_one"
declare type RoleNightWakeRule = {
    schedule?: RoleNightSchedule
    factionID?: string
    wakeAsFaction?: boolean
    factionSchedule?: RoleNightSchedule
    hasAdditionalRoleWake?: boolean
    additionalRoleSchedule?: RoleNightSchedule
}

declare type Player = {
    role: string
    alive: boolean
    effects: string[]
}

declare type SavedDeck = {
    id: string
    name: string
    pickedRoles: { [key: string]: number }
    customRoles: { [key: string]: string }
    availableFactions?: { [key: string]: string }
    roleTimings: { [key: string]: RoleTiming }
    roleNightWakeRules?: { [key: string]: RoleNightWakeRule }
    createdAt: string
    updatedAt: string
}

declare type Page = "prepare" | "deal" | "play" | "about"
declare type ThemeMode = "system" | "light" | "dark"

declare interface UIState {
    menuIsOpen: boolean
    currentPage: Page
    themeMode: ThemeMode
    featureFlags: AppFeatureFlags
}

declare interface RootState {
    ui: UIState
    game: GameState
}

declare type AppFeatureFlags = {
    confirmDialogs: boolean
    deckBackups: boolean
    defaultStatusEffects: boolean
    advancedNightAssistant: boolean
    categorizedRoleSorting: boolean
    darkMode: boolean
    persistentPlayerNames: boolean
    prioritizeStatusEffects: boolean
}

declare type AppFeatureFlagID = keyof AppFeatureFlags
