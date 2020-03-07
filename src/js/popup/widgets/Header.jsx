import React from 'react'
import HeaderLabel from '../components/HeaderLabel'

export default function ({ title, ...props }) {
    return <div className='header' {...props}>
        <HeaderLabel>{title}</HeaderLabel>
    </div>
}