import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'

import { defaultRoles, defaultRoleTimings, defaultEffects, defaultFactionNames, defaultNightWakeRules } from '../config'
import { defaultExampleDeckTemplates } from '../data/example-decks'
import { witchRoleID, witchPoisonEffectID, witchHealEffectID, abilitySpentEffectID } from '../data/game-constants'

const CUSTOM_ROLES_STORAGE_KEY = "customRoles"
const SAVED_DECKS_STORAGE_KEY = "savedDecks"
const ROLE_TIMINGS_STORAGE_KEY = "roleTimings"
const ROLE_NIGHT_WAKE_RULES_STORAGE_KEY = "roleNightWakeRules"
const FACTIONS_STORAGE_KEY = "factions"
const EFFECT_LIBRARY_STORAGE_KEY = "effectLibrary"
const MAX_LABEL_LENGTH = 80
const MAX_ICON_LENGTH = 48
const RESERVED_OBJECT_KEYS = new Set(["__proto__", "prototype", "constructor"])

const isPlainObject = (value: unknown): value is { [key: string]: unknown } => (
    typeof value === "object" && value !== null && !Array.isArray(value)
)

const normalizeDictionaryID = (value: string): string => {
    const normalizedID = value.replaceAll(/[^\w]/g, "").toLowerCase()
    if (normalizedID.length <= 0 || RESERVED_OBJECT_KEYS.has(normalizedID)) {
        return ""
    }
    return normalizedID
}

const normalizeRoleID = (value: string): string => normalizeDictionaryID(value)
const normalizeFactionID = (value: string): string => normalizeDictionaryID(value)

const normalizeLabel = (value: unknown): string => {
    if (typeof value !== "string") {
        return ""
    }
    return value.trim().slice(0, MAX_LABEL_LENGTH)
}

const normalizeIconID = (value: unknown): string => {
    if (typeof value !== "string") {
        return "fa-star"
    }
    const iconID = value.trim().slice(0, MAX_ICON_LENGTH)
    if (!/^[a-zA-Z0-9-]+$/.test(iconID)) {
        return "fa-star"
    }
    return iconID.length > 0 ? iconID : "fa-star"
}

const normalizeDeckID = (rawDeckID: unknown): string => {
    if (typeof rawDeckID !== "string") {
        return ""
    }

    const deckID = rawDeckID.trim()
    if (deckID.length <= 0 || deckID.length > 120 || !/^[a-zA-Z0-9_-]+$/.test(deckID)) {
        return ""
    }

    return RESERVED_OBJECT_KEYS.has(deckID.toLowerCase()) ? "" : deckID
}

const safeLocalStorageGetItem = (key: string): string | null => {
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

const safeLocalStorageSetItem = (key: string, value: string): void => {
    try {
        localStorage.setItem(key, value)
    } catch {
        // ignore storage write errors (quota/blocked storage)
    }
}

const parseJSON = (rawValue: string, fallback: unknown): unknown => {
    try {
        return JSON.parse(rawValue)
    } catch {
        return fallback
    }
}
const defaultRoleIDsNormalized = new Set(Object.keys(defaultRoles).map(normalizeRoleID))
const normalizedDefaultRoleTimings = Object.entries(defaultRoleTimings).reduce((mappedRoleTimings, [roleID, roleTiming]) => {
    mappedRoleTimings[normalizeRoleID(roleID)] = roleTiming
    return mappedRoleTimings
}, {} as { [key: string]: RoleTiming })
const normalizedDefaultNightWakeRules = Object.entries(defaultNightWakeRules).reduce((mappedWakeRules, [roleID, wakeRule]) => {
    mappedWakeRules[normalizeRoleID(roleID)] = wakeRule
    return mappedWakeRules
}, {} as { [key: string]: RoleNightWakeRule })

const normalizeRoleTiming = (rawTiming: unknown): RoleTiming => {
    if (rawTiming === "night" || rawTiming === "both") {
        return "night"
    }
    return "day"
}

const normalizeRoleNightSchedule = (rawSchedule: unknown): RoleNightSchedule | undefined => {
    if (rawSchedule === "every_night") {
        return "from_night_one"
    }

    if (
        rawSchedule === "night_zero_only"
        || rawSchedule === "from_night_one"
        || rawSchedule === "every_even_night_from_two"
        || rawSchedule === "every_odd_night_from_one"
    ) {
        return rawSchedule
    }
    return undefined
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

const normalizeRoleNightWakeRule = (rawWakeRule: unknown, fallbackWakeRule: RoleNightWakeRule = {}): RoleNightWakeRule => {
    const candidateWakeRule = isPlainObject(rawWakeRule) ? rawWakeRule : {}
    const normalizedWakeRule: RoleNightWakeRule = { ...fallbackWakeRule }

    const schedule = normalizeRoleNightSchedule(candidateWakeRule.schedule)
    if (schedule) {
        normalizedWakeRule.schedule = schedule
    }

    const factionSchedule = normalizeRoleNightSchedule(candidateWakeRule.factionSchedule)
    if (factionSchedule) {
        normalizedWakeRule.factionSchedule = factionSchedule
    }

    const additionalRoleSchedule = normalizeRoleNightSchedule(candidateWakeRule.additionalRoleSchedule)
    if (additionalRoleSchedule) {
        normalizedWakeRule.additionalRoleSchedule = additionalRoleSchedule
    }

    if (typeof candidateWakeRule.factionID === "string") {
        const factionID = normalizeFactionID(candidateWakeRule.factionID)
        if (factionID.length > 0) {
            normalizedWakeRule.factionID = factionID
        }
    }

    if (typeof candidateWakeRule.wakeAsFaction === "boolean") {
        normalizedWakeRule.wakeAsFaction = candidateWakeRule.wakeAsFaction
    }

    if (typeof candidateWakeRule.hasAdditionalRoleWake === "boolean") {
        normalizedWakeRule.hasAdditionalRoleWake = candidateWakeRule.hasAdditionalRoleWake
    }

    return normalizedWakeRule
}

const normalizeEffectDuration = (rawDuration: unknown): EffectDuration => {
    if (rawDuration === "night" || rawDuration === "next_day") {
        return rawDuration
    }
    return "permanent"
}

const normalizeCustomRoles = (rawRoles: unknown): GameState["customRoles"] => {
    if (!isPlainObject(rawRoles)) {
        return {}
    }

    let customRoles: GameState["customRoles"] = {}
    Object.entries(rawRoles).forEach(([roleID, roleName]) => {
        const normalizedRoleName = normalizeLabel(roleName)
        if (normalizedRoleName.length === 0) {
            return
        }
        const normalizedRoleID = normalizeRoleID(roleID || normalizedRoleName)
        if (normalizedRoleName.length === 0 || normalizedRoleID.length === 0 || defaultRoleIDsNormalized.has(normalizedRoleID)) {
            return
        }
        customRoles[normalizedRoleID] = normalizedRoleName
    })

    return customRoles
}

const normalizeFactions = (rawFactions: unknown): GameState["availableFactions"] => {
    const candidateFactions = isPlainObject(rawFactions) ? rawFactions : {}
    let normalizedFactions: GameState["availableFactions"] = { ...defaultFactionNames }

    Object.entries(candidateFactions).forEach(([factionID, factionName]) => {
        const normalizedName = normalizeLabel(factionName)
        if (normalizedName.length <= 0) {
            return
        }

        const normalizedID = normalizeFactionID(factionID || normalizedName)
        if (normalizedID.length <= 0) {
            return
        }

        normalizedFactions[normalizedID] = normalizedName
    })

    return normalizedFactions
}

const normalizeRoleTimings = (
    rawRoleTimings: unknown,
    availableRoles: GameState["availableRoles"],
): GameState["roleTimings"] => {
    const candidateTimings = isPlainObject(rawRoleTimings) ? rawRoleTimings : {}
    let roleTimings: GameState["roleTimings"] = {}

    Object.keys(availableRoles).forEach(roleID => {
        const normalizedRoleID = normalizeRoleID(roleID)
        const candidateTiming = candidateTimings[roleID] ?? candidateTimings[normalizedRoleID] ?? defaultRoleTimings[roleID] ?? normalizedDefaultRoleTimings[normalizedRoleID]
        roleTimings[roleID] = normalizeRoleTiming(candidateTiming)
    })

    return roleTimings
}

const normalizeRoleNightWakeRules = (
    rawRoleNightWakeRules: unknown,
    availableRoles: GameState["availableRoles"],
): GameState["roleNightWakeRules"] => {
    const candidateWakeRules = isPlainObject(rawRoleNightWakeRules) ? rawRoleNightWakeRules : {}
    let roleNightWakeRules: GameState["roleNightWakeRules"] = {}

    Object.keys(availableRoles).forEach(roleID => {
        const normalizedRoleID = normalizeRoleID(roleID)
        const defaultWakeRule = defaultNightWakeRules[roleID] ?? normalizedDefaultNightWakeRules[normalizedRoleID] ?? {}
        const candidateWakeRule = candidateWakeRules[roleID] ?? candidateWakeRules[normalizedRoleID]
        roleNightWakeRules[roleID] = normalizeRoleNightWakeRule(candidateWakeRule, defaultWakeRule)
    })

    return roleNightWakeRules
}

const normalizePickedRoles = (rawPickedRoles: unknown): SavedDeck["pickedRoles"] => {
    if (!isPlainObject(rawPickedRoles)) {
        return {}
    }

    let pickedRoles: SavedDeck["pickedRoles"] = {}
    Object.entries(rawPickedRoles).forEach(([roleID, rawCount]) => {
        const normalizedRoleID = normalizeRoleID(roleID)
        const count = typeof rawCount === "number" ? rawCount : Number(rawCount)
        const normalizedCount = Math.floor(count)
        if (!Number.isFinite(normalizedCount) || normalizedCount <= 0 || normalizedRoleID.length === 0) {
            return
        }
        pickedRoles[normalizedRoleID] = normalizedCount
    })

    return pickedRoles
}

const normalizeEffects = (rawEffects: unknown): GameState["availableEffects"] => {
    if (!isPlainObject(rawEffects)) {
        return { ...defaultEffects }
    }

    let effects: GameState["availableEffects"] = {}
    Object.entries(rawEffects).forEach(([effectID, rawEffect]) => {
        if (!isPlainObject(rawEffect)) {
            return
        }

        const effectName = normalizeLabel(rawEffect.name)
        const normalizedName = effectName.length > 0 ? effectName : effectID
        const normalizedID = normalizeRoleID(effectID || normalizedName)
        if (normalizedID.length === 0) {
            return
        }

        effects[normalizedID] = {
            name: normalizedName,
            icon: normalizeIconID(rawEffect.icon),
            duration: normalizeEffectDuration(rawEffect.duration),
        }
    })

    if (Object.keys(effects).length <= 0) {
        return { ...defaultEffects }
    }

    return effects
}

const normalizeDeckName = (rawName: unknown, fallback: string): string => {
    const normalizedName = normalizeLabel(rawName)
    if (normalizedName.length <= 0) {
        return fallback
    }
    return normalizedName
}

const normalizeTimestamp = (rawValue: unknown, fallback: string): string => {
    if (typeof rawValue !== "string") {
        return fallback
    }
    const timestamp = Date.parse(rawValue)
    if (Number.isNaN(timestamp)) {
        return fallback
    }
    return new Date(timestamp).toISOString()
}

const createDeckID = (): string => `deck_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const normalizeSavedDeck = (rawDeck: unknown, deckIdx: number): SavedDeck | null => {
    if (!isPlainObject(rawDeck)) {
        return null
    }

    const fallbackDeckName = `Deck ${deckIdx + 1}`
    const now = new Date().toISOString()
    const deckID = normalizeDeckID(rawDeck.id) || createDeckID()
    const customRoles = normalizeCustomRoles(rawDeck.customRoles)
    const availableFactions = normalizeFactions(rawDeck.availableFactions)
    const deckAvailableRoles = { ...defaultRoles, ...customRoles }

    const createdAt = normalizeTimestamp(rawDeck.createdAt, now)
    const updatedAt = normalizeTimestamp(rawDeck.updatedAt, createdAt)

    return {
        id: deckID,
        name: normalizeDeckName(rawDeck.name, fallbackDeckName),
        pickedRoles: normalizePickedRoles(rawDeck.pickedRoles),
        customRoles,
        availableFactions,
        roleTimings: normalizeRoleTimings(rawDeck.roleTimings, deckAvailableRoles),
        roleNightWakeRules: normalizeRoleNightWakeRules(rawDeck.roleNightWakeRules, deckAvailableRoles),
        createdAt,
        updatedAt,
    }
}

const sortDecksByRecentUpdates = (savedDecks: SavedDeck[]): SavedDeck[] => (
    [...savedDecks].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
)

const normalizeSavedDecks = (rawDecks: unknown): SavedDeck[] => {
    if (!Array.isArray(rawDecks)) {
        return []
    }

    const normalizedDecks = rawDecks
        .map((rawDeck, idx) => normalizeSavedDeck(rawDeck, idx))
        .filter((deck): deck is SavedDeck => deck !== null)

    const uniqueDecksByID = new Map<string, SavedDeck>()
    normalizedDecks.forEach(deck => uniqueDecksByID.set(deck.id, deck))

    return sortDecksByRecentUpdates(Array.from(uniqueDecksByID.values()))
}

const loadDefaultExampleDecks = (): SavedDeck[] => {
    const now = new Date().toISOString()

    const normalizedDecks = defaultExampleDeckTemplates
        .map((deckTemplate, deckIdx) => normalizeSavedDeck({
            id: deckTemplate.id,
            name: deckTemplate.name,
            pickedRoles: deckTemplate.pickedRoles,
            customRoles: deckTemplate.customRoles || {},
            availableFactions: deckTemplate.availableFactions || {},
            roleTimings: deckTemplate.roleTimings || {},
            roleNightWakeRules: deckTemplate.roleNightWakeRules || {},
            createdAt: now,
            updatedAt: now,
        }, deckIdx))
        .filter((deck): deck is SavedDeck => deck !== null)

    return sortDecksByRecentUpdates(normalizedDecks)
}

const mergeCustomRoles = (customRolesA: GameState["customRoles"], customRolesB: GameState["customRoles"]): GameState["customRoles"] => {
    return normalizeCustomRoles({ ...customRolesA, ...customRolesB })
}

const mergeFactions = (
    factionsA: GameState["availableFactions"],
    factionsB: GameState["availableFactions"] | undefined,
): GameState["availableFactions"] => {
    return normalizeFactions({ ...factionsA, ...(factionsB || {}) })
}

const mergeRoleTimings = (
    roleTimingsA: GameState["roleTimings"],
    roleTimingsB: GameState["roleTimings"],
    availableRoles: GameState["availableRoles"],
): GameState["roleTimings"] => {
    return normalizeRoleTimings({ ...roleTimingsA, ...roleTimingsB }, availableRoles)
}

const mergeRoleNightWakeRules = (
    roleNightWakeRulesA: GameState["roleNightWakeRules"],
    roleNightWakeRulesB: GameState["roleNightWakeRules"],
    availableRoles: GameState["availableRoles"],
): GameState["roleNightWakeRules"] => {
    return normalizeRoleNightWakeRules({ ...roleNightWakeRulesA, ...roleNightWakeRulesB }, availableRoles)
}

const removeEffectsByDuration = (
    players: Player[],
    availableEffects: GameState["availableEffects"],
    duration: EffectDuration,
): Player[] => {
    return players.map(player => ({
        ...player,
        effects: player.effects.filter(effectID => availableEffects[effectID]?.duration !== duration),
    }))
}

const applyPoisonDeaths = (players: Player[]): Player[] => (
    players.map(player => (
        player.effects.includes(witchPoisonEffectID)
            ? { ...player, alive: false }
            : player
    ))
)

const toggleEffectOnRolePlayers = (
    players: Player[],
    roleID: string,
    effectID: string,
    enabled: boolean,
): Player[] => {
    let hasChanges = false
    const updatedPlayers = players.map(player => {
        if (normalizeRoleID(player.role) !== roleID) {
            return player
        }

        const hasEffect = player.effects.includes(effectID)
        if (enabled && !hasEffect) {
            hasChanges = true
            return { ...player, effects: [...player.effects, effectID] }
        }
        if (!enabled && hasEffect) {
            hasChanges = true
            return { ...player, effects: player.effects.filter(effect => effect !== effectID) }
        }
        return player
    })

    return hasChanges ? updatedPlayers : players
}

const persistCustomRoles = (customRoles: GameState["customRoles"]) => {
    safeLocalStorageSetItem(CUSTOM_ROLES_STORAGE_KEY, JSON.stringify(customRoles))
}

const persistRoleTimings = (roleTimings: GameState["roleTimings"]) => {
    safeLocalStorageSetItem(ROLE_TIMINGS_STORAGE_KEY, JSON.stringify(roleTimings))
}

const persistRoleNightWakeRules = (roleNightWakeRules: GameState["roleNightWakeRules"]) => {
    safeLocalStorageSetItem(ROLE_NIGHT_WAKE_RULES_STORAGE_KEY, JSON.stringify(roleNightWakeRules))
}

const persistFactions = (availableFactions: GameState["availableFactions"]) => {
    safeLocalStorageSetItem(FACTIONS_STORAGE_KEY, JSON.stringify(availableFactions))
}

const persistSavedDecks = (savedDecks: SavedDeck[]) => {
    safeLocalStorageSetItem(SAVED_DECKS_STORAGE_KEY, JSON.stringify(savedDecks))
}

const persistEffects = (effects: GameState["availableEffects"]) => {
    safeLocalStorageSetItem(EFFECT_LIBRARY_STORAGE_KEY, JSON.stringify(effects))
}

const defaultEffectIDs = new Set(Object.keys(defaultEffects).map(normalizeRoleID))

const loadSavedCustomRoles = (): GameState["customRoles"] => {
    const rawCustomRoles = safeLocalStorageGetItem(CUSTOM_ROLES_STORAGE_KEY)
    return normalizeCustomRoles(parseJSON(rawCustomRoles || "{}", {}))
}

const loadSavedRoleTimings = (availableRoles: GameState["availableRoles"]): GameState["roleTimings"] => {
    const rawRoleTimings = safeLocalStorageGetItem(ROLE_TIMINGS_STORAGE_KEY)
    return normalizeRoleTimings(parseJSON(rawRoleTimings || "{}", {}), availableRoles)
}

const loadSavedRoleNightWakeRules = (availableRoles: GameState["availableRoles"]): GameState["roleNightWakeRules"] => {
    const rawRoleNightWakeRules = safeLocalStorageGetItem(ROLE_NIGHT_WAKE_RULES_STORAGE_KEY)
    return normalizeRoleNightWakeRules(parseJSON(rawRoleNightWakeRules || "{}", {}), availableRoles)
}

const loadSavedFactions = (): GameState["availableFactions"] => {
    const rawFactions = safeLocalStorageGetItem(FACTIONS_STORAGE_KEY)
    return normalizeFactions(parseJSON(rawFactions || "{}", {}))
}

const loadSavedDecks = (): SavedDeck[] => {
    const rawSavedDecks = safeLocalStorageGetItem(SAVED_DECKS_STORAGE_KEY)
    const savedDecks = normalizeSavedDecks(parseJSON(rawSavedDecks || "[]", []))
    if (savedDecks.length > 0) {
        return savedDecks
    }
    return loadDefaultExampleDecks()
}

const loadSavedEffects = (): GameState["availableEffects"] => {
    const rawEffectLibrary = safeLocalStorageGetItem(EFFECT_LIBRARY_STORAGE_KEY)
    if (!rawEffectLibrary) {
        return { ...defaultEffects }
    }
    const savedEffects = normalizeEffects(parseJSON(rawEffectLibrary, {}))
    const mergedEffects = { ...defaultEffects, ...savedEffects }
    if (mergedEffects[witchPoisonEffectID]) {
        mergedEffects[witchPoisonEffectID] = {
            ...mergedEffects[witchPoisonEffectID],
            duration: defaultEffects[witchPoisonEffectID]?.duration || "night",
        }
    }
    if (mergedEffects[witchHealEffectID]) {
        mergedEffects[witchHealEffectID] = {
            ...mergedEffects[witchHealEffectID],
            duration: defaultEffects[witchHealEffectID]?.duration || "night",
        }
    }
    return mergedEffects
}

const _resetPickedRoles = (availableRoles: { [key: string]: string }): GameState["pickedRoles"] => {
    let pickedRoles: GameState["pickedRoles"] = {}
    Object.keys(availableRoles).forEach(roleKey => pickedRoles[roleKey] = 0)
    return pickedRoles
}

const resetRolesR: CaseReducer<GameState> = (state) => {
    return { ...state, pickedRoles: _resetPickedRoles(state.availableRoles) }
}

const dealRolesR: CaseReducer<GameState> = (state) => {
    let players: Player[] = []

    for (let roleKey in state.pickedRoles) {
        for (let i = 0; i < state.pickedRoles[roleKey]; i++) {
            players.push({ role: roleKey, alive: true, effects: [] })
        }
    }

    for (let i = players.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        ;[players[i], players[j]] = [players[j], players[i]]
    }

    const hasNightZeroCall = Object.entries(state.pickedRoles).some(([roleID, count]) => {
        if (count <= 0 || state.roleTimings[roleID] !== "night") {
            return false
        }

        const wakeRule = state.roleNightWakeRules[roleID] || {}
        const fallbackSchedule = wakeRule.schedule
        const factionSchedule = wakeRule.factionSchedule || fallbackSchedule
        const additionalRoleSchedule = wakeRule.additionalRoleSchedule || fallbackSchedule
        const wakesAsFaction = Boolean(wakeRule.wakeAsFaction && wakeRule.factionID)
        const wakesAsFactionTonight = wakesAsFaction && wakesOnNight(factionSchedule, 0)
        const wakesAsRoleTonight = (!wakesAsFaction && wakesOnNight(fallbackSchedule, 0))
            || (Boolean(wakeRule.hasAdditionalRoleWake) && wakesOnNight(additionalRoleSchedule, 0))

        return wakesAsFactionTonight || wakesAsRoleTonight
    })

    return {
        ...state,
        players,
        phase: { mode: "night", nightCount: hasNightZeroCall ? 0 : 1, dayCount: 0 },
        deal: initialState.deal,
        witchPotions: {
            poisonUsed: false,
            healUsed: false,
        },
    }
}

let savedCustomRoles = loadSavedCustomRoles()
const initialRoles = { ...defaultRoles, ...savedCustomRoles }
let savedFactions = loadSavedFactions()
let savedRoleTimings = loadSavedRoleTimings(initialRoles)
let savedRoleNightWakeRules = loadSavedRoleNightWakeRules(initialRoles)
let savedDecks = loadSavedDecks()
let savedEffects = loadSavedEffects()

const initialState: GameState = function () {
    return {
        availableRoles: { ...initialRoles },
        availableFactions: { ...savedFactions },
        roleTimings: { ...savedRoleTimings },
        roleNightWakeRules: { ...savedRoleNightWakeRules },
        customRoles: { ...savedCustomRoles },
        pickedRoles: _resetPickedRoles(initialRoles),
        savedDecks: [...savedDecks],
        availableEffects: { ...savedEffects },
        witchPotions: {
            poisonUsed: false,
            healUsed: false,
        },
        players: [
            // { role: 'dorfbewohner', alive: false, effects: [] },
            // { role: 'werwolf', alive: true, effects: [] },
        ],
        phase: {
            mode: "night",
            nightCount: 0,
            dayCount: 0,
        },
        deal: {
            activeRoleIdx: 0,
            roleWasVisible: false,
            roleIsVisible: false,
        }
    }
}()

export const generateEffectID = (effectName: string): string => {
    return normalizeRoleID(effectName)
}

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        addRole(state, action: PayloadAction<string>): GameState {
            const roleKey = action.payload
            if (!(roleKey in state.pickedRoles)) {
                return state
            }
            let count = state.pickedRoles[roleKey]
            if (!Number.isFinite(count)) {
                return state
            }
            let pickedRoles = { ...state.pickedRoles }
            pickedRoles[roleKey] = count + 1
            return { ...state, pickedRoles }
        },

        removeRole(state, action: PayloadAction<string>): GameState {
            const roleKey = action.payload
            if (!(roleKey in state.pickedRoles)) {
                return state
            }
            let count = state.pickedRoles[roleKey]
            if (!Number.isFinite(count) || count <= 0) {
                return state
            }
            let pickedRoles = { ...state.pickedRoles }
            pickedRoles[roleKey] = count - 1
            return { ...state, pickedRoles }
        },

        setRoleTiming(state, action: PayloadAction<{ roleID: string, timing: RoleTiming }>): GameState {
            const { roleID, timing } = action.payload
            if (!(roleID in state.availableRoles)) {
                return state
            }

            const roleTimings = { ...state.roleTimings, [roleID]: normalizeRoleTiming(timing) }
            persistRoleTimings(roleTimings)

            return { ...state, roleTimings }
        },

        setRoleNightSchedule(state, action: PayloadAction<{ roleID: string, schedule: RoleNightSchedule }>): GameState {
            const { roleID, schedule } = action.payload
            if (!(roleID in state.availableRoles)) {
                return state
            }

            const currentWakeRule = state.roleNightWakeRules[roleID] || {}
            const roleNightWakeRules = { ...state.roleNightWakeRules }
            if (currentWakeRule.wakeAsFaction && currentWakeRule.hasAdditionalRoleWake) {
                roleNightWakeRules[roleID] = { ...currentWakeRule, additionalRoleSchedule: schedule }
            } else {
                roleNightWakeRules[roleID] = { ...currentWakeRule, schedule }
            }

            persistRoleNightWakeRules(roleNightWakeRules)

            return { ...state, roleNightWakeRules }
        },

        createFaction(state, action: PayloadAction<string>): GameState {
            const newFactionName = normalizeLabel(action.payload)
            if (newFactionName.length <= 0) {
                return state
            }

            const newFactionID = normalizeFactionID(newFactionName)
            if (newFactionID.length <= 0 || newFactionID in state.availableFactions) {
                return state
            }

            const availableFactions = { ...state.availableFactions, [newFactionID]: newFactionName }
            persistFactions(availableFactions)
            return { ...state, availableFactions }
        },

        setRoleFaction(state, action: PayloadAction<{ roleID: string, factionID: string }>): GameState {
            const { roleID, factionID } = action.payload
            if (!(roleID in state.availableRoles)) {
                return state
            }

            const normalizedFactionID = normalizeFactionID(factionID)
            const currentWakeRule = state.roleNightWakeRules[roleID] || {}
            const roleNightWakeRules = { ...state.roleNightWakeRules }

            if (normalizedFactionID.length > 0 && normalizedFactionID in state.availableFactions) {
                roleNightWakeRules[roleID] = {
                    ...currentWakeRule,
                    factionID: normalizedFactionID,
                    wakeAsFaction: true,
                }
            } else {
                const updatedWakeRule = { ...currentWakeRule }
                delete updatedWakeRule.factionID
                delete updatedWakeRule.wakeAsFaction
                delete updatedWakeRule.hasAdditionalRoleWake
                delete updatedWakeRule.additionalRoleSchedule
                roleNightWakeRules[roleID] = updatedWakeRule
            }

            persistRoleNightWakeRules(roleNightWakeRules)
            return { ...state, roleNightWakeRules }
        },

        setRoleAdditionalWake(state, action: PayloadAction<{ roleID: string, enabled: boolean }>): GameState {
            const { roleID, enabled } = action.payload
            if (!(roleID in state.availableRoles)) {
                return state
            }

            const currentWakeRule = state.roleNightWakeRules[roleID] || {}
            const hasFaction = Boolean(currentWakeRule.factionID)
            const roleNightWakeRules = { ...state.roleNightWakeRules }

            if (enabled && hasFaction) {
                roleNightWakeRules[roleID] = {
                    ...currentWakeRule,
                    wakeAsFaction: true,
                    hasAdditionalRoleWake: true,
                }
            } else {
                roleNightWakeRules[roleID] = {
                    ...currentWakeRule,
                    hasAdditionalRoleWake: false,
                }
            }

            persistRoleNightWakeRules(roleNightWakeRules)
            return { ...state, roleNightWakeRules }
        },

        createCustomRole(state, action: PayloadAction<string>): GameState {
            const newRoleName = normalizeLabel(action.payload)
            const newRoleID = normalizeRoleID(newRoleName)
            if (newRoleID.length <= 0) {
                return state
            }

            if (newRoleID in state.availableRoles) {
                return state
            }

            let customRoles = { ...state.customRoles, [newRoleID]: newRoleName }
            let roleTimings = { ...state.roleTimings, [newRoleID]: "day" as RoleTiming }
            let roleNightWakeRules = { ...state.roleNightWakeRules, [newRoleID]: {} }

            persistCustomRoles(customRoles)
            persistRoleTimings(roleTimings)
            persistRoleNightWakeRules(roleNightWakeRules)

            return {
                ...state,
                availableRoles: {
                    ...state.availableRoles,
                    [newRoleID]: newRoleName,
                },
                roleTimings: { ...roleTimings },
                roleNightWakeRules: { ...roleNightWakeRules },
                customRoles: { ...customRoles },
                pickedRoles: {
                    ...state.pickedRoles,
                    [newRoleID]: 0,
                },
            }
        },

        deleteCustomRole(state, action: PayloadAction<string>): GameState {
            const roleID = normalizeRoleID(action.payload)
            if (roleID.length <= 0 || roleID in defaultRoles || !(roleID in state.availableRoles)) {
                return state
            }
            let customRoles = { ...state.customRoles }
            delete customRoles[roleID]

            let availableRoles = { ...state.availableRoles }
            delete availableRoles[roleID]

            let pickedRoles = { ...state.pickedRoles }
            delete pickedRoles[roleID]

            let roleTimings = { ...state.roleTimings }
            delete roleTimings[roleID]

            let roleNightWakeRules = { ...state.roleNightWakeRules }
            delete roleNightWakeRules[roleID]

            persistCustomRoles(customRoles)
            persistRoleTimings(roleTimings)
            persistRoleNightWakeRules(roleNightWakeRules)

            return {
                ...state,
                availableRoles: { ...availableRoles },
                roleTimings: { ...roleTimings },
                roleNightWakeRules: { ...roleNightWakeRules },
                customRoles: { ...customRoles },
                pickedRoles: { ...pickedRoles },
            }
        },

        restoreCustomRoles(state, action: PayloadAction<{ [key: string]: string }>): GameState {
            const customRoles = normalizeCustomRoles(action.payload)
            const availableRoles = { ...defaultRoles, ...customRoles }
            const pickedRoles = _resetPickedRoles(availableRoles)
            const roleTimings = normalizeRoleTimings(state.roleTimings, availableRoles)
            const roleNightWakeRules = normalizeRoleNightWakeRules(state.roleNightWakeRules, availableRoles)

            Object.keys(pickedRoles).forEach(roleID => {
                pickedRoles[roleID] = state.pickedRoles[roleID] || 0
            })

            persistCustomRoles(customRoles)
            persistRoleTimings(roleTimings)
            persistRoleNightWakeRules(roleNightWakeRules)

            return {
                ...state,
                availableRoles: { ...availableRoles },
                roleTimings: { ...roleTimings },
                roleNightWakeRules: { ...roleNightWakeRules },
                customRoles: { ...customRoles },
                pickedRoles: { ...pickedRoles },
            }
        },

        saveCurrentDeck(state, action: PayloadAction<{ name?: string } | undefined>): GameState {
            const requestedDeckName = normalizeLabel(action.payload?.name)
            const now = new Date().toISOString()
            const newDeck: SavedDeck = {
                id: createDeckID(),
                name: requestedDeckName.length > 0 ? requestedDeckName : `Deck ${state.savedDecks.length + 1}`,
                pickedRoles: normalizePickedRoles(state.pickedRoles),
                customRoles: { ...state.customRoles },
                availableFactions: { ...state.availableFactions },
                roleTimings: normalizeRoleTimings(state.roleTimings, state.availableRoles),
                roleNightWakeRules: normalizeRoleNightWakeRules(state.roleNightWakeRules, state.availableRoles),
                createdAt: now,
                updatedAt: now,
            }

            const savedDecks = sortDecksByRecentUpdates([newDeck, ...state.savedDecks])
            persistSavedDecks(savedDecks)

            return { ...state, savedDecks }
        },

        overwriteSavedDeck(state, action: PayloadAction<{ deckID: string, name?: string }>): GameState {
            const deckID = action.payload.deckID
            const deckToUpdate = state.savedDecks.find(deck => deck.id === deckID)
            if (!deckToUpdate) {
                return state
            }

            const requestedDeckName = normalizeLabel(action.payload.name)
            const updatedDeck: SavedDeck = {
                ...deckToUpdate,
                name: requestedDeckName.length > 0 ? requestedDeckName : deckToUpdate.name,
                pickedRoles: normalizePickedRoles(state.pickedRoles),
                customRoles: { ...state.customRoles },
                availableFactions: { ...state.availableFactions },
                roleTimings: normalizeRoleTimings(state.roleTimings, state.availableRoles),
                roleNightWakeRules: normalizeRoleNightWakeRules(state.roleNightWakeRules, state.availableRoles),
                updatedAt: new Date().toISOString(),
            }

            const savedDecks = sortDecksByRecentUpdates(
                state.savedDecks.map(deck => deck.id === deckID ? updatedDeck : deck)
            )
            persistSavedDecks(savedDecks)

            return { ...state, savedDecks }
        },

        deleteSavedDeck(state, action: PayloadAction<string>): GameState {
            const deckID = action.payload
            const savedDecks = state.savedDecks.filter(deck => deck.id !== deckID)
            persistSavedDecks(savedDecks)
            return { ...state, savedDecks }
        },

        loadSavedDeck(state, action: PayloadAction<string>): GameState {
            const deckID = action.payload
            const savedDeck = state.savedDecks.find(deck => deck.id === deckID)
            if (!savedDeck) {
                return state
            }

            const customRoles = mergeCustomRoles(state.customRoles, savedDeck.customRoles)
            const availableFactions = mergeFactions(state.availableFactions, savedDeck.availableFactions)
            const availableRoles = { ...defaultRoles, ...customRoles }
            const pickedRoles = _resetPickedRoles(availableRoles)
            const roleTimings = mergeRoleTimings(state.roleTimings, savedDeck.roleTimings, availableRoles)
            const roleNightWakeRules = mergeRoleNightWakeRules(state.roleNightWakeRules, savedDeck.roleNightWakeRules || {}, availableRoles)
            const roleIDByNormalizedID = Object.keys(availableRoles).reduce((roleIDMapping, roleID) => {
                roleIDMapping[normalizeRoleID(roleID)] = roleID
                return roleIDMapping
            }, {} as { [key: string]: string })

            Object.entries(savedDeck.pickedRoles).forEach(([roleID, count]) => {
                const mappedRoleID = roleIDByNormalizedID[normalizeRoleID(roleID)] || roleID
                if (mappedRoleID in pickedRoles) {
                    pickedRoles[mappedRoleID] = count
                }
            })

            persistCustomRoles(customRoles)
            persistFactions(availableFactions)
            persistRoleTimings(roleTimings)
            persistRoleNightWakeRules(roleNightWakeRules)

            return {
                ...state,
                availableRoles: { ...availableRoles },
                availableFactions: { ...availableFactions },
                roleTimings: { ...roleTimings },
                roleNightWakeRules: { ...roleNightWakeRules },
                customRoles: { ...customRoles },
                pickedRoles: { ...pickedRoles },
            }
        },

        importSavedDecks(state, action: PayloadAction<unknown>): GameState {
            const importedDecks = normalizeSavedDecks(action.payload)
            if (importedDecks.length === 0) {
                return state
            }

            const mergedDecksByID = new Map<string, SavedDeck>()
            state.savedDecks.forEach(deck => mergedDecksByID.set(deck.id, deck))
            importedDecks.forEach(deck => mergedDecksByID.set(deck.id, deck))

            const savedDecks = sortDecksByRecentUpdates(Array.from(mergedDecksByID.values()))
            const availableFactions = importedDecks.reduce((factions, deck) => (
                mergeFactions(factions, deck.availableFactions)
            ), state.availableFactions)

            persistSavedDecks(savedDecks)
            persistFactions(availableFactions)

            return { ...state, savedDecks, availableFactions }
        },

        resetRoles: resetRolesR,
        dealRoles: dealRolesR,

        currentRoleToggleVisibility(state): GameState {
            return {
                ...state,
                deal: {
                    ...state.deal,
                    roleIsVisible: !state.deal.roleIsVisible,
                    roleWasVisible: true,
                }
            }
        },

        dealNextRole(state): GameState {
            if (state.deal.activeRoleIdx + 1 >= state.players.length) {
                return state
            }
            return {
                ...state,
                deal: {
                    activeRoleIdx: state.deal.activeRoleIdx + 1,
                    roleIsVisible: false,
                    roleWasVisible: false,
                }
            }
        },

        advanceToDay(state): GameState {
            if (state.phase.mode === "day") {
                return state
            }

            const playersWithPoisonDeaths = applyPoisonDeaths(state.players)
            const players = removeEffectsByDuration(playersWithPoisonDeaths, state.availableEffects, "night")

            return {
                ...state,
                players,
                phase: {
                    ...state.phase,
                    mode: "day",
                    dayCount: state.phase.dayCount + 1,
                },
            }
        },

        advanceNightZero(state): GameState {
            if (state.phase.mode !== "night" || state.phase.nightCount !== 0) {
                return state
            }

            const players = removeEffectsByDuration(state.players, state.availableEffects, "night")

            return {
                ...state,
                players,
                phase: {
                    ...state.phase,
                    mode: "night",
                    nightCount: 1,
                },
            }
        },

        advanceToNight(state): GameState {
            if (state.phase.mode === "night") {
                return state
            }

            const players = removeEffectsByDuration(state.players, state.availableEffects, "next_day")
            return {
                ...state,
                players,
                phase: {
                    mode: "night",
                    nightCount: state.phase.nightCount + 1,
                    dayCount: state.phase.dayCount,
                },
            }
        },

        forceDayPhase(state): GameState {
            if (state.phase.mode === "day" && state.phase.dayCount >= 1) {
                return state
            }

            if (state.phase.mode === "night") {
                const playersWithPoisonDeaths = applyPoisonDeaths(state.players)
                const players = removeEffectsByDuration(playersWithPoisonDeaths, state.availableEffects, "night")

                return {
                    ...state,
                    players,
                    phase: {
                        ...state.phase,
                        mode: "day",
                        dayCount: state.phase.dayCount + 1,
                    },
                }
            }

            return {
                ...state,
                phase: {
                    ...state.phase,
                    mode: "day",
                    dayCount: Math.max(1, state.phase.dayCount),
                },
            }
        },

        togglePlayerAlive(state, action: PayloadAction<number>): GameState {
            let playerID = action.payload
            if (!Number.isInteger(playerID) || playerID < 0 || playerID >= state.players.length) {
                return state
            }
            state.players[playerID].alive = !state.players[playerID].alive
            return state
        },

        createEffect(state, action: PayloadAction<{ newEffect: Effect }>): GameState {
            const newEffectName = normalizeLabel(action.payload.newEffect.name)
            const newEffectID = generateEffectID(newEffectName)
            if (newEffectID.length === 0 || newEffectID in state.availableEffects) {
                return state
            }

            const availableEffects = {
                ...state.availableEffects,
                [newEffectID]: {
                    name: newEffectName,
                    icon: normalizeIconID(action.payload.newEffect.icon),
                    duration: normalizeEffectDuration(action.payload.newEffect.duration),
                }
            }
            persistEffects(availableEffects)
            return { ...state, availableEffects }
        },

        setDefaultEffectsEnabled(state, action: PayloadAction<boolean>): GameState {
            const enabled = action.payload
            if (enabled) {
                let hasChanges = false
                const availableEffects = { ...state.availableEffects }
                Object.entries(defaultEffects).forEach(([effectID, effect]) => {
                    const normalizedEffectID = normalizeRoleID(effectID)
                    if (normalizedEffectID.length <= 0) {
                        return
                    }

                    const normalizedDefaultEffect: Effect = {
                        name: effect.name,
                        icon: effect.icon,
                        duration: effect.duration,
                    }
                    const existingEffect = availableEffects[normalizedEffectID]
                    const differsFromDefault = !existingEffect
                        || existingEffect.name !== normalizedDefaultEffect.name
                        || existingEffect.icon !== normalizedDefaultEffect.icon
                        || existingEffect.duration !== normalizedDefaultEffect.duration

                    if (!differsFromDefault) {
                        return
                    }

                    hasChanges = true
                    availableEffects[normalizedEffectID] = normalizedDefaultEffect
                })
                const shouldHaveAbilitySpent = state.witchPotions.poisonUsed && state.witchPotions.healUsed
                const players = toggleEffectOnRolePlayers(state.players, witchRoleID, abilitySpentEffectID, shouldHaveAbilitySpent)
                if (!hasChanges && players === state.players) {
                    return state
                }
                persistEffects(availableEffects)
                return { ...state, availableEffects, players }
            }

            let effectsChanged = false
            const availableEffects = Object.entries(state.availableEffects).reduce((mappedEffects, [effectID, effect]) => {
                if (defaultEffectIDs.has(normalizeRoleID(effectID))) {
                    effectsChanged = true
                } else {
                    mappedEffects[effectID] = effect
                }
                return mappedEffects
            }, {} as GameState["availableEffects"])

            let playersChanged = false
            const players = state.players.map(player => {
                const nextEffects = player.effects.filter(effectID => !defaultEffectIDs.has(normalizeRoleID(effectID)))
                if (nextEffects.length !== player.effects.length) {
                    playersChanged = true
                    return { ...player, effects: nextEffects }
                }
                return player
            })

            if (!effectsChanged && !playersChanged) {
                return state
            }

            persistEffects(effectsChanged ? availableEffects : state.availableEffects)

            return {
                ...state,
                availableEffects: effectsChanged ? availableEffects : state.availableEffects,
                players: playersChanged ? players : state.players,
            }
        },

        deleteEffect(state, action: PayloadAction<string>): GameState {
            const effectID = normalizeRoleID(action.payload)
            if (effectID.length <= 0 || !(effectID in state.availableEffects)) {
                return state
            }
            const availableEffects = { ...state.availableEffects }
            delete availableEffects[effectID]

            const players = state.players.map(player => ({
                ...player,
                effects: player.effects.filter(effect => effect !== effectID),
            }))

            persistEffects(availableEffects)

            return {
                ...state,
                players,
                availableEffects,
            }
        },

        togglePlayerEffect(state, action: PayloadAction<{ playerID: number, effectID: string }>): GameState {
            const playerID = action.payload.playerID
            const effectID = normalizeRoleID(action.payload.effectID)
            if (!Number.isInteger(playerID) || playerID < 0 || playerID >= state.players.length || !(effectID in state.availableEffects)) {
                return state
            }

            const effects = state.players[playerID].effects
            const effectActive = effects.includes(effectID)
            const isWitchPoison = effectID === witchPoisonEffectID
            const isWitchHeal = effectID === witchHealEffectID
            const isWitchPotion = isWitchPoison || isWitchHeal
            if (!effectActive && isWitchPoison && state.witchPotions.poisonUsed) {
                return state
            }
            if (!effectActive && isWitchHeal && state.witchPotions.healUsed) {
                return state
            }

            state.players[playerID].effects = effectActive ? [...effects.filter(effect => effect !== effectID)] : [...effects, effectID]

            if (!effectActive && isWitchPotion) {
                if (isWitchPoison) {
                    state.witchPotions.poisonUsed = true
                }
                if (isWitchHeal) {
                    state.witchPotions.healUsed = true
                }
            }

            if (
                state.witchPotions.poisonUsed
                && state.witchPotions.healUsed
                && abilitySpentEffectID in state.availableEffects
            ) {
                state.players = toggleEffectOnRolePlayers(state.players, witchRoleID, abilitySpentEffectID, true)
            }
            return state
        },

        fullReset(state): GameState {
            return {
                ...initialState,
                availableRoles: state.availableRoles,
                availableFactions: state.availableFactions,
                roleTimings: state.roleTimings,
                roleNightWakeRules: state.roleNightWakeRules,
                customRoles: state.customRoles,
                pickedRoles: state.pickedRoles,
                savedDecks: state.savedDecks,
                availableEffects: state.availableEffects,
            }
        },
    }
})

const { actions, reducer } = gameSlice
export const {
    addRole,
    removeRole,
    setRoleTiming,
    setRoleNightSchedule,
    createFaction,
    setRoleFaction,
    setRoleAdditionalWake,
    createCustomRole,
    deleteCustomRole,
    restoreCustomRoles,
    saveCurrentDeck,
    overwriteSavedDeck,
    deleteSavedDeck,
    loadSavedDeck,
    importSavedDecks,
    resetRoles,
    dealRoles,
    currentRoleToggleVisibility,
    dealNextRole,
    advanceNightZero,
    advanceToDay,
    advanceToNight,
    forceDayPhase,
    togglePlayerAlive,
    fullReset,
    createEffect,
    setDefaultEffectsEnabled,
    deleteEffect,
    togglePlayerEffect,
} = actions
export default reducer
