export function getTabsAsync(queryOptions) {
    return new Promise(resolve => {
        chrome.tabs.query(queryOptions, resolve)
    })
}

export async function getInactiveDiscardableTabs(windowId, settings) {
    const queryOptions = {
        windowId,
        active: false,
        discarded: false,
        autoDiscardable: true,
    }

    if (!settings.discardAudible)
        queryOptions.audible = false

    return getTabsAsync(queryOptions)
}

export async function getInactiveDiscardableAudibleTabs(windowId) {
    const queryOptions = {
        windowId,
        active: false,
        discarded: false,
        autoDiscardable: true,
        audible: true
    }

    return getTabsAsync(queryOptions)
}

export async function getActiveTab(windowId) {
    const queryOptions = {
        windowId,
        active: true,
        autoDiscardable: true,
    }

    return getTabsAsync(queryOptions)
}


export function discardTabs(tabs) {
    return new Promise(async resolve => {
        for (const tab of tabs)
            await discardTab(tab.tabId)

        resolve()
    })
}

export function discardTabsById(tabsById) {
    const tabs = tabsById.map(tabId => ({ tabId }))
    discardTabs(tabs)
}

export function discardTab(tabId) {
    return new Promise(async resolve => {
        const tab = await getTabById(tabId)
        if (tab) chrome.tabs.discard(tabId, resolve)
    })
}

export function getTabById(tabId) {
    console.log('get tab', tabId)
    return new Promise(resolve => {
        chrome.tabs.get(tabId, tab => {
            if (chrome.runtime.lastError) {
                console.warn(chrome.runtime.lastError.message)
            }
            resolve(tab)
        })
    })
}