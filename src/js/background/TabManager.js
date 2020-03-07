import {
    getActiveTab,
    getInactiveDiscardableTabs,
    getInactiveDiscardableAudibleTabs,
    getTabById,
    discardTabs,
    discardTabsById,
} from '../tab-utils'
import { m2ms, getTime } from '../utils'
import settingsManager from '../settings-manager'

export default class TabManager {
    constructor(windowId) {
        this.windowId = windowId
        this.lastActiveTabId = null
        this.tabsWithExpiration = []
        this.tabDiscarderTimeout = null
        this.recentTabs = []
        this.settings = settingsManager.state
    }

    init = async () => {
        const [
            [{ id: activeTabId }],
            expirableTabs,
        ] = await Promise.all([
            getActiveTab(this.windowId),
            getInactiveDiscardableTabs(this.windowId, this.settings),
        ])

        this.lastActiveTabId = activeTabId
        this.setExpiryTimeForTabs(expirableTabs)
        this.attachEventListeners()
    }

    setExpiryTimeForTabs = (expirableTabs, expiaryTime = 0) => {
        if (!expirableTabs.length) return

        const expires = getTime(m2ms(expiaryTime || this.settings.discardDelayMinutes))
        const transformed = expirableTabs.map(({ id: tabId }) => ({ tabId, expires }))

        this.tabsWithExpiration = [...this.tabsWithExpiration, ...transformed]

        if (!this.tabDiscarderTimeout) {
            this.startTabDiscarder()
        }
    }

    startTabDiscarder = () => {
        const [firstDiscardableTab] = this.tabsWithExpiration

        if (!firstDiscardableTab) return

        const nextDiscardInMS = Math.abs(getTime(-firstDiscardableTab.expires))

        this.tabDiscarderTimeout = setTimeout(async () => {
            const now = getTime()
            const expiredTabs = this.tabsWithExpiration.filter(
                ({ expires }) => expires <= now
            )

            this.tabsWithExpiration.splice(0, expiredTabs.length)

            await discardTabs(expiredTabs)

            if (this.tabsWithExpiration.length)
                this.startTabDiscarder()
            else this.stopTabDiscarder()
        }, nextDiscardInMS)
    }

    stopTabDiscarder = () => {
        clearTimeout(this.tabDiscarderTimeout)
        this.tabDiscarderTimeout = null
    }

    restartTabDiscarder = () => {
        this.stopTabDiscarder()
        this.startTabDiscarder()
    }

    attachEventListeners = () => {
        chrome.tabs.onActivated.addListener(this.onTabActivated)
        chrome.tabs.onRemoved.addListener(this.onTabRemoved)
        settingsManager.subscribe(this.onSettingsUpdated)
    }

    onSettingsUpdated = newSettings => {
        this.stopTabDiscarder()

        if (!newSettings.keepRecent) {
            if (this.recentTabs.length) {
                discardTabsById(this.recentTabs)
                this.recentTabs = []
            }
        } else {
            if (newSettings.keepRecentNum !== this.settings.keepRecentNum) {
                if (newSettings.keepRecentNum < this.settings.keepRecentNum) {
                    // remove first recents
                    const removedRecentsNum = this.settings.keepRecentNum - newSettings.keepRecentNum
                    const removedRecents = this.recentTabs.splice(0, removedRecentsNum)

                    // add remodev recents to expiary
                    discardTabsById(removedRecents)
                } else {
                    // add last expiary items to recents
                    const removedExpiaryItemsNum = newSettings.keepRecentNum - this.settings.keepRecentNum
                    const removedExpiaryItems = this.tabsWithExpiration.splice(this.tabsWithExpiration.length - removedExpiaryItemsNum)

                    this.recentTabs = [
                        ...this.recentTabs,
                        ...removedExpiaryItems
                    ]
                }
            }
        }

        if (newSettings.discardDelayMinutes !== this.settings.discardDelayMinutes) {
            // remove expired
            const newDiscardTimeMS = getTime(m2ms(newSettings.discardDelayMinutes))
            const currentDiscardTimeMS = getTime(m2ms(this.settings.discardDelayMinutes))

            const discardTimeDeltaMS = newDiscardTimeMS - currentDiscardTimeMS


            if (discardTimeDeltaMS < 1) {
                const firstValidTab = this.tabsWithExpiration.find(
                    ({ expiration }) =>
                        expiration > newDiscardTimeMS
                )

                const firstValidTabIndex = this.tabsWithExpiration.indexOf(firstValidTab)
                const expiredTabs = this.tabsWithExpiration.splice(0, firstValidTabIndex)

                discardTabs(expiredTabs)
            }

            this.tabsWithExpiration = this.tabsWithExpiration.map(({ tabId, expiration }) => ({
                tabId,
                expiration: expiration - discardTimeDeltaMS
            }))

        }

        if (newSettings.discardAudible !== this.settings.discardAudible) {
            const audibleTabs = getInactiveDiscardableAudibleTabs(this.windowId)

            if (newSettings.discardAudible) {
                // add to expiary
                this.setExpiryTimeForTabs(audibleTabs, newSettings.discardDelayMinutes)
            } else {
                // remove audible tabs from expiary
                audibleTabs.forEach(({ id: audibleTabId }) => {
                    const removedTab = this.tabsWithExpiration.find(({ tabId }) => tabId === audibleTabId)
                    const removedTabIndex = this.tabsWithExpiration.indexOf(removedTab)
                    this.tabsWithExpiration.splice(removedTabIndex, 1)
                })
            }

        }

        this.settings = newSettings
        if (this.tabsWithExpiration.length) this.startTabDiscarder()
    }

    onTabActivated = async ({ tabId: activeTabId, windowId }) => {
        if (this.windowId !== windowId) return

        const previouslyActiveTabId = this.lastActiveTabId
        let tabToDiscard = previouslyActiveTabId

        if (activeTabId !== previouslyActiveTabId) {
            if (this.settings.keepRecent) {
                if (!this.recentTabs.includes(previouslyActiveTabId)) {
                    this.recentTabs.push(previouslyActiveTabId)
                }
                if (this.recentTabs.includes(activeTabId)) {
                    const removedIdIndex = this.recentTabs.indexOf(activeTabId)
                    this.recentTabs.splice(removedIdIndex, 1)
                }

                if (this.recentTabs.length > this.settings.keepRecentNum) {
                    tabToDiscard = this.recentTabs.shift()
                } else {
                    tabToDiscard = null
                }
            }

            const activeTabExpiry = this.tabsWithExpiration.find(
                ({ tabId }) => tabId === activeTabId
            )

            const removedIndex = this.tabsWithExpiration.indexOf(activeTabExpiry)

            if (removedIndex > -1) {
                this.tabsWithExpiration.splice(removedIndex, 1)
            }

            if (tabToDiscard && tabToDiscard !== activeTabId) {
                const tab = await getTabById(tabToDiscard)
                if (tab) this.setExpiryTimeForTabs([tab])
            }

            this.lastActiveTabId = activeTabId
        }
    }

    onTabRemoved = (removedTabId, { windowId }) => {
        if (this.windowId !== windowId) return

        const removedTab = this.tabsWithExpiration.find(({ tabId }) => tabId === removedTabId)
        const removedIndex = this.tabsWithExpiration.indexOf(removedTab)

        if (removedIndex > -1) {
            this.tabsWithExpiration.splice(removedIndex, 1)

            if (!this.tabsWithExpiration.length)
                this.stopTabDiscarder()

            else if (removedIndex === 0)
                this.restartTabDiscarder()
        }

        const recentsIndex = this.recentTabs.indexOf(removedTabId)

        if (recentsIndex > -1) {
            this.recentTabs.splice(recentsIndex, 1)
        }
    }

    removeEventListeners = () => {
        chrome.tabs.onActivated.removeListener(this.onTabActivated)
        chrome.tabs.onRemoved.removeListener(this.onTabRemoved)
    }

    destroy = () => {
        this.removeEventListeners()
    }
}