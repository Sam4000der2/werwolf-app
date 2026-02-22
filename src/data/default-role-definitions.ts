export const defaultRoles = {
    werwolf: "Werwolf",
    dorfbewohner: "Dorfbewohner",
    seherin: "Seherin",
    hexe: "Hexe",
    jaeger: "Jäger",
    armor: "Armor",
    heiler: "Heiler",
    prinz: "Prinz",

    AlterMann: "Alter Mann",
    depp: "Dorfdepp",
    drache: "Drache (Joker)",
    bursche: "Harter Bursche",
    lykanthrophin: "Lykanthrophin",
    post: "Postbote (Joker)",
    priest: "Priester",
    lehrling: "Seherlehrling",
    traumwolf: "Traumwolf (Joker)",
    wolfsjunges: "Wolfsjunges",
    zahnarzt: "Zahnarzt",
    putzfrau: "Putzfrau",
    bodyguard: "Bodyguard",
    vampir: "Vampir",
    einsamerwerwolf: "Einsamer Werwolf",
}

export const defaultRoleTimings: { [key: string]: RoleTiming } = {
    werwolf: "night",
    dorfbewohner: "day",
    seherin: "night",
    hexe: "night",
    jaeger: "day",
    armor: "night",
    heiler: "night",
    prinz: "day",

    AlterMann: "day",
    depp: "day",
    drache: "day",
    bursche: "day",
    lykanthrophin: "day",
    post: "day",
    priest: "night",
    lehrling: "night",
    traumwolf: "night",
    wolfsjunges: "night",
    zahnarzt: "night",

    putzfrau: "night",
    bodyguard: "night",
    vampir: "night",
    einsamerwerwolf: "night",
}

export const defaultFactionNames: { [key: string]: string } = {
    wolfpack: "Werwölfe",
    vampires: "Vampire",
}

export const defaultNightWakeRules: { [key: string]: RoleNightWakeRule } = {
    armor: { schedule: "night_zero_only" },
    priest: { schedule: "night_zero_only" },

    werwolf: { factionID: "wolfpack", wakeAsFaction: true },
    traumwolf: { factionID: "wolfpack", wakeAsFaction: true },
    wolfsjunges: { factionID: "wolfpack", wakeAsFaction: true },
    einsamerwerwolf: {
        factionID: "wolfpack",
        wakeAsFaction: true,
        hasAdditionalRoleWake: true,
        additionalRoleSchedule: "every_even_night_from_two",
    },

    vampir: { factionID: "vampires", wakeAsFaction: true },
}
