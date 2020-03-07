import React, { useState, useEffect } from 'react'
import SettingsFragment from '../fragments/Settings'
import settingsManager, { hydrate, init as initSettingsManager } from '../../settings-manager'

export default props => {
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        initSettingsManager()
        hydrate().then(() => setLoaded(true))
        return () => { }
    }, [])

    console.log('render options', settingsManager.state)

    if (loaded) {
        return <div className='page'>
            <SettingsFragment />
        </div>
    }

    return null
}
