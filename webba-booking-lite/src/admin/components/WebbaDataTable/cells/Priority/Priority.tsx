import { CellContext } from '@tanstack/react-table'
import styles from './/Priority.module.scss'
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
                styles.priority,
                styles[priorityTitles[value].toString().toLocaleLowerCase()]
            )}
        >
            {priorityTitles[value]}
        </div>
    )
}
