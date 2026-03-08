describe('ui reducer feature flag migration', () => {
    const featureFlagsStorageKey = "uiFeatureFlags"

    afterEach(() => {
        localStorage.removeItem(featureFlagsStorageKey)
        jest.resetModules()
    })

    test('maps legacy narratorAssistant key to advancedNightAssistant', async () => {
        localStorage.setItem(featureFlagsStorageKey, JSON.stringify({
            confirmDialogs: true,
            narratorAssistant: false,
        }))

        jest.resetModules()
        const uiModule = await import('./ui')
        const state = uiModule.default(undefined, { type: '@@INIT' })

        expect(state.featureFlags.confirmDialogs).toBe(true)
        expect(state.featureFlags.advancedNightAssistant).toBe(false)
        expect(state.featureFlags.darkMode).toBe(true)
    })

    test('forces prioritizeStatusEffects to true from legacy storage', async () => {
        localStorage.setItem(featureFlagsStorageKey, JSON.stringify({
            prioritizeStatusEffects: false,
        }))

        jest.resetModules()
        const uiModule = await import('./ui')
        const state = uiModule.default(undefined, { type: '@@INIT' })

        expect(state.featureFlags.prioritizeStatusEffects).toBe(true)
    })

    test('forces persistentPlayerNames and darkMode to true from legacy storage', async () => {
        localStorage.setItem(featureFlagsStorageKey, JSON.stringify({
            persistentPlayerNames: false,
            darkMode: false,
        }))

        jest.resetModules()
        const uiModule = await import('./ui')
        const state = uiModule.default(undefined, { type: '@@INIT' })

        expect(state.featureFlags.persistentPlayerNames).toBe(true)
        expect(state.featureFlags.darkMode).toBe(true)
    })
})

export {}
