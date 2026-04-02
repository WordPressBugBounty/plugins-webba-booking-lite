import { CellContext } from '@tanstack/react-table'
import { Toggle } from '../../../Toggle/Toggle'
import { useCallback } from 'react'
import './EmailStatus.scss'
import { useDispatch } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'

export const EmailStatus = ({ cell, getValue }: CellContext<any, any>) => {
    const { setItem } = useDispatch(store_name)

    const updateStatus = useCallback(
        async (value: 'yes' | '') => {
            await setItem('email_templates', {
                ...cell.row.original,
                enabled: value,
            })
        },
        [cell, getValue]
    )

    return (
        <div className="wbk_emailStatus__wrapper">
            <Toggle
                name="status"
                value={getValue() || ''}
                onChange={(value) => {
                    updateStatus(value ? 'yes' : '')
                }}
            />
        </div>
    )
}
