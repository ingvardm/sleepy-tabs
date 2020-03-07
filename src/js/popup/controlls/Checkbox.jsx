import React from 'react'
import { buildClassName } from '../style-utils'

export default function ({ checked, onChange, dummy }) {
    return <div
        className={buildClassName([
            'checkbox',
            checked && 'checkbox-checked',
            dummy && 'checkbox-dummy',
        ])}
        onClick={() => onChange(!checked)}
    />
}