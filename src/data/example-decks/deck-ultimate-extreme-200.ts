import { ExampleDeckTemplate } from './types'
import { DeckRoleDefinition, buildRoleLibrary } from './role-library-utils'

const ultimateExtremeRoles: DeckRoleDefinition[] = [
    // --- CLASSIC VILLAGE ---
    { id: "seer", name: "Seer (Seherin)", timing: "night" },
    { id: "witch", name: "Witch (Hexe)", timing: "night" },
    { id: "hunter", name: "Hunter (Jäger)", timing: "day" },
    { id: "cupid", name: "Cupid (Amor)", timing: "night", wakeRule: { schedule: "night_zero_only" } },
    { id: "bodyguard", name: "Bodyguard (Heiler)", timing: "night" },
    { id: "mayor", name: "Mayor (Bürgermeister)", timing: "day" },
    { id: "prince", name: "Prince (Prinz)", timing: "day" },
    { id: "villager", name: "Villager (Dorfbewohner)", timing: "day" },
    { id: "mason", name: "Mason (Freimaurer)", timing: "night", wakeRule: { schedule: "night_zero_only" } },
    { id: "lycan", name: "Lycan (Lykanthrop)", timing: "day" },
    { id: "cursed", name: "Cursed (Verfluchter)", timing: "day" },
    { id: "old_man", name: "Old Man (Alter Mann)", timing: "day" },
    { id: "idiot", name: "Village Idiot (Dorfdepp)", timing: "day" },
    { id: "apprentice_seer", name: "Apprentice Seer (Seherlehrling)", timing: "night" },
    { id: "insomniac", name: "Insomniac (Schlafwandler)", timing: "night" },

    // --- WOLFPACK ---
    { id: "werewolf", name: "Werewolf", timing: "night", wakeRule: { factionID: "wolfpack", wakeAsFaction: true } },
    { id: "alpha_wolf", name: "Alpha Wolf", timing: "night", wakeRule: { factionID: "wolfpack", wakeAsFaction: true } },
    { id: "mystic_wolf", name: "Mystic Wolf", timing: "night", wakeRule: { factionID: "wolfpack", wakeAsFaction: true, hasAdditionalRoleWake: true } },
    { id: "wolf_cub", name: "Wolf Cub (Wolfsjunges)", timing: "night", wakeRule: { factionID: "wolfpack", wakeAsFaction: true } },
    { id: "dream_wolf", name: "Dream Wolf (Traumwolf)", timing: "night", wakeRule: { factionID: "wolfpack", wakeAsFaction: true } },
    { id: "lone_wolf", name: "Lone Wolf (Einsamer Wolf)", timing: "night", wakeRule: { factionID: "wolfpack", wakeAsFaction: true, hasAdditionalRoleWake: true, additionalRoleSchedule: "every_even_night_from_two" } },
    { id: "sorcerer", name: "Sorcerer (Hexenmeister)", timing: "night" },

    // --- VAMPIRES ---
    { id: "vampire", name: "Vampire", timing: "night", wakeRule: { factionID: "vampires", wakeAsFaction: true } },
    { id: "count", name: "The Count", timing: "night", wakeRule: { factionID: "vampires", wakeAsFaction: true, hasAdditionalRoleWake: true } },

    // --- THIRD PARTIES / OTHERS ---
    { id: "tanner", name: "Tanner (Gerber)", timing: "day" },
    { id: "pied_piper", name: "Pied Piper (Flötenspieler)", timing: "night" },
    { id: "doppelganger", name: "Doppelgänger", timing: "night", wakeRule: { schedule: "night_zero_only" } },
    { id: "wild_child", name: "Wild Child (Wildes Kind)", timing: "night", wakeRule: { schedule: "night_zero_only" } },
    { id: "cult_leader", name: "Cult Leader", timing: "night", wakeRule: { factionID: "cult", wakeAsFaction: true } },
    { id: "hoodlum", name: "Hoodlum (Strolch)", timing: "night", wakeRule: { schedule: "night_zero_only" } },
    { id: "arsonist", name: "Arsonist (Brandstifter)", timing: "night" },
    { id: "serial_killer", name: "Serial Killer", timing: "night" },
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
