export function filterObjectByKeys(obj, keys) {
    let filtered = {}

    for (const key of keys)
        filtered[key] = obj[key]

    return filtered
}

export function updateSubscribers(subscribers, state) {
    for (const subscriber of subscribers)
        subscriber.update(state)
}

export function mergeAB(a, b) {
    return { ...a, ...b }
}