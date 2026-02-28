import { ExampleDeckTemplate } from './types'
import { DeckRoleDefinition, buildRoleLibrary } from './role-library-utils'

const ultimateExtremeRoles: DeckRoleDefinition[] = [
    // --- SPECIAL VILLAGE ---
    { id: "mason", name: "Mason (Freimaurer)", timing: "night", wakeRule: { schedule: "night_zero_only" } },
    { id: "cursed", name: "Cursed (Verfluchter)", timing: "day" },
    { id: "insomniac", name: "Insomniac (Schlafwandler)", timing: "night" },
    { id: "mason_detective", name: "Mason Detective", timing: "night" },
    { id: "ghost", name: "Ghost (Geist)", timing: "night" },
    { id: "oracle", name: "Oracle (Orakel)", timing: "night" },

    // --- WOLFPACK ---
    { id: "alpha_wolf", name: "Alpha Wolf", timing: "night", wakeRule: { factionID: "wolfpack", wakeAsFaction: true } },
    { id: "mystic_wolf", name: "Mystic Wolf", timing: "night", wakeRule: { factionID: "wolfpack", wakeAsFaction: true, hasAdditionalRoleWake: true } },
    { id: "sorcerer", name: "Sorcerer (Hexenmeister)", timing: "night" },
    { id: "wolf_hound_uw", name: "Wolf Hound (Ultimate)", timing: "night", wakeRule: { factionID: "wolfpack", wakeAsFaction: true } },

    // --- VAMPIRES ---
    { id: "count", name: "The Count", timing: "night", wakeRule: { factionID: "vampires", wakeAsFaction: true, hasAdditionalRoleWake: true } },

    // --- THIRD PARTIES / OTHERS ---
    { id: "tanner", name: "Tanner (Gerber)", timing: "day" },
    { id: "doppelganger", name: "Doppelgänger", timing: "night", wakeRule: { schedule: "night_zero_only" } },
    { id: "cult_leader", name: "Cult Leader", timing: "night", wakeRule: { factionID: "cult", wakeAsFaction: true } },
    { id: "hoodlum", name: "Hoodlum (Strolch)", timing: "night", wakeRule: { schedule: "night_zero_only" } },
    { id: "serial_killer", name: "Serial Killer", timing: "night" },
    { id: "zombie", name: "Zombie", timing: "night" },
    { id: "troublemaker", name: "Troublemaker (Anstifter)", timing: "day" },
    { id: "drunk", name: "Drunk (Trunkenbold)", timing: "day" },
]

const { customRoles, roleTimings, roleNightWakeRules } = buildRoleLibrary(ultimateExtremeRoles)

export const exampleDeckUltimateExtreme200: ExampleDeckTemplate = {
    id: "ultimate-extreme-true",
    name: "Ultimate Werewolf Extreme (Authentisch)",
    pickedRoles: {},
    customRoles,
    availableFactions: {
        wolfpack: "Wolfpack",
        vampires: "Vampires",
        cult: "Cult",
    },
    roleTimings,
    roleNightWakeRules,
}
