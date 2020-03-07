import React from 'react'
import Label from '../components/Label'
import Checkbox from '../controlls/Checkbox'
import NumberInput from '../controlls/NumberInput'

export default ({ label, value, onValueInput, checked, onChecked }) =>
    <div className='settings-list-item'>
        <Checkbox checked={checked} onChange={onChecked} dummy={!onChecked} />
        <Label>{label}</Label>
        {onValueInput && <NumberInput
            value={value}
            onChange={onValueInput}
            disabled={onChecked && !checked}
        />}
    </div>