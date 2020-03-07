export default class Subscriber {
    constructor(callback, filters = []) {
        this._callback = callback
        this._filters = filters
        this._noFilters = !filters.length
    }

    update = updates => {
        let delta = {}
        let updated = false

        if (this._noFilters) this._callback(updates)

        for (const key of this._filters) {
            if (typeof updates[key] !== 'undefined') {
                updated = true
                delta[key] = updates[key]
            }
        }

        if (updated) this._callback(delta)
    }
}
