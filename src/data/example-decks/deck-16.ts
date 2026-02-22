import { ExampleDeckTemplate } from './types'

// Größere Runde mit zusätzlicher Wolfs-Info-Rolle und Nullnacht-Rolle.
// Quellen: https://www.partyspiele.org/werwolf/ und https://www.spielregeln.de/werwolf/
export const exampleDeck16: ExampleDeckTemplate = {
    id: "example_16_players_online",
    name: "Beispieldeck 16 Spieler",
    pickedRoles: {
        werwolf: 3,
        dorfbewohner: 4,
        seherin: 1,
        hexe: 1,
        jaeger: 1,
        heiler: 1,
        prinz: 1,
        armor: 1,
        priest: 1,
        wolfsjunges: 1,
        traumwolf: 1,
    },
}
