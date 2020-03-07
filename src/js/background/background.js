import '../../img/icon-128.png'
import '../../img/icon-48.png'

import { getAllWindows } from '../window-utils'
import TabManager from './TabManager'
import {
    hydrate as hydrateSettings,
    init as initSettingsManager,
} from '../settings-manager'

let tabManagers = {}

async function init() {
    await hydrateSettings()
    initSettingsManager()

    const windows = await getAllWindows()

    for (const { id: windowId } of windows) {
        const tabManager = new TabManager(windowId)
        tabManager.init()
        tabManagers[windowId] = tabManager
    }

    attachEventListeners()
}

function attachEventListeners() {
    chrome.windows.onRemoved.addListener(onWindowRemoved)
}

function onWindowRemoved(windowId) {
    const removedTabManager = tabManagers[windowId]
    if (removedTabManager) {
        removedTabManager.destroy()
        delete tabManagers[windowId]
    }
}

init()
