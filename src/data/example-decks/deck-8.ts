import { ExampleDeckTemplate } from './types'

// Basis nach häufig genutzten Online-Empfehlungen für kleine Runden.
// Quellen: https://www.partyspiele.org/werwolf/ und https://www.spielregeln.de/werwolf/
export const exampleDeck8: ExampleDeckTemplate = {
    id: "example_8_players_online",
    name: "Beispieldeck 8 Spieler",
    pickedRoles: {
        werwolf: 2,
        dorfbewohner: 2,
        seherin: 1,
        hexe: 1,
        jaeger: 1,
        armor: 1,
    },
}
