import { useEffect, useReducer } from 'react'
import { filterObjectByKeys, mergeAB } from './utils'

export default function (store, filters = []) {
    const initialState = filters.length
        ? filterObjectByKeys(store.state, filters)
        : store.state

    const [state, update] = useReducer(mergeAB, initialState)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => store.subscribe(update, filters), [])

    return [state, store.updateState]
}
