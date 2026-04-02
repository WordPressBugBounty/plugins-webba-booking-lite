import { CellContext } from '@tanstack/react-table'
import { useSelect } from '@wordpress/data'
import { store } from '../../../../../store/backend'

export const UserName = ({ cell }: CellContext<any, any>) => {
    const users = useSelect(
        (select) =>
            select(store).getFieldOptions('gg_calendars', 'user_id', []),
        []
    )

    return (
        <div>
            {(users && users.loading !== true && users[cell.getValue()]) ||
                cell.getValue()}
        </div>
    )
}
