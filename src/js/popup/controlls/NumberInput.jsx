import React from 'react'
import { buildClassName } from '../style-utils'

export default function ({ value, onChange, disabled, ...props }) {
    return <input
        {...props}
        className={buildClassName([
            'value-input',
            disabled && 'value-input-disabled',
        ])}
        type='number'
        min={0}
        max={99}
        disabled={disabled}
        value={value}
        onChange={e => onChange(e.target.value)}
    />
}