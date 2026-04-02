import { CellContext } from '@tanstack/react-table'
import './Priority.scss'
import classNames from 'classnames'

type TPriority = 1 | 10 | 20

const priorityTitles: Record<TPriority, string> = {
    1: 'Low',
    10: 'Medium',
    20: 'High',
}

export const PriorityCell = ({ getValue }: CellContext<any, any>) => {
    const value =getValue() as TPriority

    return (
        <div
            className={classNames(
                'wbk_priority__priority',
                `wbk_priority__priority--${priorityTitles[value].toString().toLowerCase()}`
            )}
        >
            {priorityTitles[value]}
        </div>
    )
}
