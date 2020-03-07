import Subscriber from './Subscriber'
import { updateSubscribers, mergeAB } from './utils'

export default class Store {
    _subscribers = []

    constructor(initialState = {}) {
        this._state = initialState
    }

    get state() {
        return this._state
    }

    updateState = delta => {
        const newState = mergeAB(this._state, delta)

        this.replaceState(newState)
    }

    replaceState = newState => {
        this._state = newState

        updateSubscribers(this._subscribers, this._state)
    }

    subscribe = (callback, filters) => {
        const subscriber = new Subscriber(callback, filters)

        this._subscribers.push(subscriber)

        return () => {
            const index = this._subscribers.indexOf(subscriber)
            if (index > -1) this._subscribers.splice(index, 1)
        }
    }
}
