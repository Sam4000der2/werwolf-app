import reducer, { advanceToDay, togglePlayerEffect } from './game'

const createNightState = (): GameState => {
    const baseState = reducer(undefined, { type: '@@INIT' })
    return {
        ...baseState,
        players: [
            { role: "hexe", alive: true, effects: [] },
            { role: "dorfbewohner", alive: true, effects: [] },
            { role: "dorfbewohner", alive: true, effects: [] },
        ],
        phase: {
            mode: "night",
            nightCount: 1,
            dayCount: 0,
        },
        witchPotions: {
            poisonUsed: false,
            healUsed: false,
        },
    }
}

describe('game reducer witch potions', () => {
    test('uses each witch potion only once and grants ability spent when both are used', () => {
        const initialState = createNightState()

        const afterPoison = reducer(initialState, togglePlayerEffect({ playerID: 1, effectID: "vergiftet" }))
        expect(afterPoison.players[1].effects).toContain("vergiftet")
        expect(afterPoison.witchPotions.poisonUsed).toBe(true)

        const afterSecondPoisonAttempt = reducer(afterPoison, togglePlayerEffect({ playerID: 2, effectID: "vergiftet" }))
        expect(afterSecondPoisonAttempt.players[2].effects).not.toContain("vergiftet")
        expect(afterSecondPoisonAttempt.witchPotions.poisonUsed).toBe(true)

        const afterHeal = reducer(afterSecondPoisonAttempt, togglePlayerEffect({ playerID: 1, effectID: "geheilt" }))
        expect(afterHeal.witchPotions.healUsed).toBe(true)
        expect(afterHeal.players[0].effects).toContain("faehigkeit_weg")
    })

    test('kills poisoned players at day start', () => {
        const initialState = createNightState()
        const poisonedState: GameState = {
            ...initialState,
            players: initialState.players.map((player, idx) => (
                idx === 1 ? { ...player, effects: [...player.effects, "vergiftet"] } : player
            )),
        }

        const afterDayStart = reducer(poisonedState, advanceToDay())

        expect(afterDayStart.phase.mode).toBe("day")
        expect(afterDayStart.players[1].alive).toBe(false)
        expect(afterDayStart.players[1].effects).not.toContain("vergiftet")
    })
})
