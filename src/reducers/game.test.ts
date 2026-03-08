import reducer, { advanceToDay, createEffect, forceDayPhase, setDefaultEffectsEnabled, togglePlayerEffect } from './game'

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

describe('game reducer default effects feature toggle', () => {
    test('disabling default effects removes them from library and players but keeps witch potion state', () => {
        const initialState = createNightState()
        const stateWithDefaultEffects: GameState = {
            ...initialState,
            players: [
                { role: "hexe", alive: true, effects: ["faehigkeit_weg"] },
                { role: "dorfbewohner", alive: true, effects: ["vergiftet"] },
                { role: "dorfbewohner", alive: true, effects: ["geheilt"] },
            ],
            witchPotions: {
                poisonUsed: true,
                healUsed: true,
            },
        }

        const disabledState = reducer(stateWithDefaultEffects, setDefaultEffectsEnabled(false))

        expect(disabledState.availableEffects.vergiftet).toBeUndefined()
        expect(disabledState.availableEffects.geheilt).toBeUndefined()
        expect(disabledState.availableEffects.faehigkeit_weg).toBeUndefined()
        expect(disabledState.players[0].effects).toEqual([])
        expect(disabledState.players[1].effects).toEqual([])
        expect(disabledState.players[2].effects).toEqual([])
        expect(disabledState.witchPotions.poisonUsed).toBe(true)
        expect(disabledState.witchPotions.healUsed).toBe(true)
    })

    test('enabling default effects restores missing defaults', () => {
        const initialState = createNightState()
        const disabledState = reducer(initialState, setDefaultEffectsEnabled(false))

        const reenabledState = reducer(disabledState, setDefaultEffectsEnabled(true))

        expect(reenabledState.availableEffects.vergiftet).toBeDefined()
        expect(reenabledState.availableEffects.geheilt).toBeDefined()
        expect(reenabledState.availableEffects.faehigkeit_weg).toBeDefined()
    })

    test('enabling default effects normalizes collisions on default IDs', () => {
        const initialState = createNightState()
        const disabledState = reducer(initialState, setDefaultEffectsEnabled(false))
        const stateWithCollision = reducer(disabledState, createEffect({
            newEffect: {
                name: "Vergiftet",
                icon: "fa-skull",
                duration: "permanent",
            }
        }))

        const reenabledState = reducer(stateWithCollision, setDefaultEffectsEnabled(true))

        expect(reenabledState.availableEffects.vergiftet.duration).toBe("night")
        expect(reenabledState.availableEffects.vergiftet.icon).toBe("fa-vials")
        expect(reenabledState.availableEffects.vergiftet.name).toBe("Vergiftet (Hexe)")
    })

    test('toggle off/on keeps witch potion usage and restores ability spent marker', () => {
        const initialState = createNightState()
        const usedPotionsState: GameState = {
            ...initialState,
            players: [
                { role: "hexe", alive: true, effects: ["faehigkeit_weg"] },
                { role: "dorfbewohner", alive: true, effects: [] },
                { role: "dorfbewohner", alive: true, effects: [] },
            ],
            witchPotions: {
                poisonUsed: true,
                healUsed: true,
            },
        }

        const disabledState = reducer(usedPotionsState, setDefaultEffectsEnabled(false))
        expect(disabledState.witchPotions.poisonUsed).toBe(true)
        expect(disabledState.witchPotions.healUsed).toBe(true)
        expect(disabledState.players[0].effects).not.toContain("faehigkeit_weg")

        const reenabledState = reducer(disabledState, setDefaultEffectsEnabled(true))
        expect(reenabledState.witchPotions.poisonUsed).toBe(true)
        expect(reenabledState.witchPotions.healUsed).toBe(true)
        expect(reenabledState.players[0].effects).toContain("faehigkeit_weg")
    })
})

describe('game reducer permanent day mode', () => {
    test('forceDayPhase switches from night to day 1 and keeps state stable on repeat', () => {
        const initialState = createNightState()
        const forcedDayState = reducer(initialState, forceDayPhase())
        const forcedDayStateAgain = reducer(forcedDayState, forceDayPhase())

        expect(forcedDayState.phase.mode).toBe("day")
        expect(forcedDayState.phase.dayCount).toBe(1)
        expect(forcedDayState.phase.nightCount).toBe(initialState.phase.nightCount)
        expect(forcedDayStateAgain).toBe(forcedDayState)
    })

    test('forceDayPhase resolves poison deaths and clears night effects', () => {
        const initialState = createNightState()
        const stateWithNightEffects: GameState = {
            ...initialState,
            players: [
                { role: "hexe", alive: true, effects: [] },
                { role: "dorfbewohner", alive: true, effects: ["vergiftet", "geheilt"] },
                { role: "dorfbewohner", alive: true, effects: ["geschuetzt"] },
            ],
        }

        const forcedDayState = reducer(stateWithNightEffects, forceDayPhase())

        expect(forcedDayState.phase.mode).toBe("day")
        expect(forcedDayState.players[1].alive).toBe(false)
        expect(forcedDayState.players[1].effects).not.toContain("vergiftet")
        expect(forcedDayState.players[1].effects).not.toContain("geheilt")
        expect(forcedDayState.players[2].effects).not.toContain("geschuetzt")
    })
})
