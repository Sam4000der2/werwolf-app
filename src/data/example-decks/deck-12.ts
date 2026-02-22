import { ExampleDeckTemplate } from './types'

// Mittelgroße Runde mit klassischem Kern und zwei Startnacht-Rollen.
// Quellen: https://www.partyspiele.org/werwolf/ und https://www.spielregeln.de/werwolf/
export const exampleDeck12: ExampleDeckTemplate = {
    id: "example_12_players_online",
    name: "Beispieldeck 12 Spieler",
    pickedRoles: {
        werwolf: 3,
        dorfbewohner: 3,
        seherin: 1,
        hexe: 1,
        jaeger: 1,
        heiler: 1,
        prinz: 1,
        cupido: 1,
    },
}
