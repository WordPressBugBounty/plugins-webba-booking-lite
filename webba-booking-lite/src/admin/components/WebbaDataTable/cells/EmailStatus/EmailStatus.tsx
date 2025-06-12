import { CellContext } from '@tanstack/react-table'
import { Toggle } from '../../../Form/Fields/Toggle/Toggle'
import { useCallback } from 'react'
import styles from './EmailStatus.module.scss'
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
        <div className={styles.wrapper}>
            <Toggle
                name="status"
                initialValue={getValue() || ''}
                valueOn="yes"
                valueOff=""
                onChange={(value) => {
                    updateStatus(value)
                }}
            />
        </div>
    )
}
