import React from 'react'
import settingsManager, { update } from '../../settings-manager'
import useStore from '../../re-store/useStore'
import SettingsItem from '../widgets/SettingsItem'
import Header from '../widgets/Header'

export default props => {
    const [settings] = useStore(settingsManager)

    return <div id='settings_fragment'>
        <Header title='Sleepy tabs settings' />
        <SettingsItem
            label='Keep recent tabs'
            value={settings.keepRecentNum}
            onValueInput={val => update({ keepRecentNum: val })}
            checked={settings.keepRecent}
            onChecked={val => update({ keepRecent: val })}
        />
        <SettingsItem
            label='Discard tabs after'
            value={settings.discardDelayMinutes}
            onValueInput={val => update({ discardDelayMinutes: val })}
        />
        <SettingsItem
            label='Discard audible tabs'
            checked={settings.discardExpired}
            onChecked={val => update({ discardExpired: val })}
        />
    </div>
}