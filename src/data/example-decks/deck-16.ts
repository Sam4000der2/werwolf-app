import { ExampleDeckTemplate } from './types'

export const exampleDeck16: ExampleDeckTemplate = {
    id: "deck-16-classic",
    name: "16 Spieler (Erweitert)",
    pickedRoles: {
        werwolf: 3,
        urwolf: 1,
        seherin: 1,
        hexe: 1,
        amor: 1,
        jaeger: 1,
        heiler: 1,
        dorfdepp: 1,
        dorfbewohner: 6
    },
    customRoles: {
        urwolf: "Urwolf",
        dorfdepp: "Dorfdepp"
    },
    availableFactions: {},
    roleTimings: {
        urwolf: "night",
        dorfdepp: "day"
    },
    roleNightWakeRules: {
        urwolf: { factionID: "wolfpack", wakeAsFaction: true }
    }
}
