describe('game reducer effect migrations', () => {
    const effectLibraryStorageKey = "effectLibrary"

    afterEach(() => {
        localStorage.removeItem(effectLibraryStorageKey)
        jest.resetModules()
    })

    test('migrates old saved witch effect durations to night', async () => {
        localStorage.setItem(effectLibraryStorageKey, JSON.stringify({
            vergiftet: { name: "Vergiftet (Hexe)", icon: "fa-vials", duration: "permanent" },
            geheilt: { name: "Geheilt (Hexe)", icon: "fa-heartbeat", duration: "permanent" },
        }))

        jest.resetModules()
        const gameModule = await import('./game')
        const state = gameModule.default(undefined, { type: '@@INIT' })

        expect(state.availableEffects.vergiftet.duration).toBe("night")
        expect(state.availableEffects.geheilt.duration).toBe("night")
    })
})

export {}
