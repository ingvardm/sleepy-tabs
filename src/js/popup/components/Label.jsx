import React from 'react'
import { buildClassName } from '../style-utils'

export default function ({ className, ...props }) {
    return <p className={buildClassName([
        'label',
        className,
    ])} {...props} />
}