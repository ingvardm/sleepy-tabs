export const m2ms = m => m * 60 * 1000
export const getTime = (offset = 0) => Date.now() + offset

export const filterObject = (obj, keys) => keys.reduce((acc, key) => {
    acc[key] = obj[key]
    return acc
}, {})
