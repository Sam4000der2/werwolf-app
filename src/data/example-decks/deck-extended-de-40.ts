import { ExampleDeckTemplate } from './types'
import { DeckRoleDefinition, buildRoleLibrary } from './role-library-utils'

// Klassische Rollen aus "Die Werwölfe von Düsterwald" und Erweiterungen (Neumond, Die Gemeinde, Charaktere)
const classicGermanRoles: DeckRoleDefinition[] = [
    { id: "dieb", name: "Dieb", timing: "night", wakeRule: { schedule: "night_zero_only" } },
    { id: "maedchen", name: "Das kleine Mädchen", timing: "day" },
    { id: "suendenbock", name: "Sündenbock", timing: "day" },
    { id: "floetenspieler", name: "Flötenspieler", timing: "night" },
    { id: "wolfshund", name: "Wolfshund", timing: "night", wakeRule: { schedule: "night_zero_only" } },
    { id: "wildes_kind", name: "Wildes Kind", timing: "night", wakeRule: { schedule: "night_zero_only" } },
    {
        id: "weisser_werwolf",
        name: "Weißer Werwolf",
        timing: "night",
        wakeRule: {
            factionID: "wolfpack",
            wakeAsFaction: true,
            hasAdditionalRoleWake: true,
            additionalRoleSchedule: "every_even_night_from_two",
        },
    },
    { id: "urwolf", name: "Der Urwolf", timing: "night", wakeRule: { factionID: "wolfpack", wakeAsFaction: true } },
    { id: "gros_boeser_wolf", name: "Der Große Böse Wolf", timing: "night", wakeRule: { factionID: "wolfpack", wakeAsFaction: true } },
    { id: "zwei_schwestern", name: "Die zwei Schwestern", timing: "night" },
    { id: "drei_brueder", name: "Die drei Brüder", timing: "night" },
    { id: "engel", name: "Engel", timing: "day" },
    { id: "richter", name: "Stotternder Richter", timing: "night", wakeRule: { schedule: "night_zero_only" } },
    { id: "schauspieler", name: "Schauspieler", timing: "night" },
    { id: "fuchs", name: "Fuchs", timing: "night" },
    { id: "baerenfuehrer", name: "Bärenführer", timing: "day" },
    { id: "ritter", name: "Ritter der rostigen Klinge", timing: "day" },
    { id: "diener", name: "Ergebener Diener", timing: "day" },
    { id: "zigeunerin", name: "Zigeunerin", timing: "night" },
    { id: "brandstifter", name: "Brandstifter", timing: "night" },
    { id: "rabe", name: "Rabe", timing: "night" },
    { id: "hauptmann", name: "Hauptmann (Bürgermeister)", timing: "day" },
    { id: "günstling", name: "Günstling", timing: "day" },
    { id: "dorfwaechter", name: "Dorfwächter", timing: "night" },
    { id: "wolfsseherin", name: "Wolfsseherin", timing: "night", wakeRule: { factionID: "wolfpack", wakeAsFaction: true } },
]

const { customRoles, roleTimings, roleNightWakeRules } = buildRoleLibrary(classicGermanRoles)

export const exampleDeckExtendedGerman40: ExampleDeckTemplate = {
    id: "extended_de_classic_all_roles",
    name: "Alle klassischen Rollen (Düsterwald)",
    pickedRoles: {},
    customRoles,
    availableFactions: {},
    roleTimings,
    roleNightWakeRules,
}

