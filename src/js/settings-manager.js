import Store from './re-store'
import * as storage from './synced-storage'
import { mergeAB } from './re-store/utils'

const initialState = {
    keepRecent: true,
    keepRecentNum: 4,
    discardExpired: true,
    discardDelayMinutes: 15,
    discardAudible: false,
}

const settingsManager = new Store(initialState)

async function* hydrationGenerator() {
    const [hydratedValues] = await storage.get([storage.KEYS.settings])

    while (true) yield hydratedValues
}

const hydrationGen = hydrationGenerator()

export async function hydrate() {
    const { value: storedSettings } = await hydrationGen.next()

    if (storedSettings) {
        settingsManager.replaceState(mergeAB(
            initialState,
            storedSettings
        ))
    } else {
        storage.set({ [storage.KEYS.settings]: initialState })
    }

    return storedSettings
}

export async function update(updatedSettings) {
    await storage.set({
        [storage.KEYS.settings]: mergeAB(
            settingsManager.state,
            updatedSettings,
        )
    })
}

export function init() {
    attachStorageListeners()
}

function attachStorageListeners() {
    chrome.storage.onChanged.addListener(({ settings }) => {
        if (settings) settingsManager.replaceState(settings.newValue)
    })
}

export default settingsManager