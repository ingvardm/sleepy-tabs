export function get(keys) {
    return new Promise(resolve => {
        chrome.storage.sync.get(keys, result => {
            resolve(keys.map(key => result[key]))
        })
    })
}

export function set(keyValuePairs) {
    return new Promise(resolve => {
        chrome.storage.sync.set(keyValuePairs, resolve)
    })
}

export const KEYS = {
    settings: 'settings',
}
