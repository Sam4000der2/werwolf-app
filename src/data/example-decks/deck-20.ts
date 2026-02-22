import { ExampleDeckTemplate } from './types'

// Große Runde mit konkurrierenden Nachtfraktionen und Zusatzfähigkeit.
// Quellen: https://www.partyspiele.org/werwolf/ und https://wiki.werwolf-online.com/index.php/White_Wolf
export const exampleDeck20: ExampleDeckTemplate = {
    id: "example_20_players_online",
    name: "Beispieldeck 20 Spieler",
    pickedRoles: {
        werwolf: 4,
        dorfbewohner: 4,
        seherin: 1,
        hexe: 1,
        jaeger: 1,
        heiler: 1,
        prinz: 1,
        cupido: 1,
        priest: 1,
        wolfsjunges: 1,
        wolfsseher: 1,
        whiteWolf: 1,
        vampir: 1,
        einsamerwerwolf: 1,
    },
}
