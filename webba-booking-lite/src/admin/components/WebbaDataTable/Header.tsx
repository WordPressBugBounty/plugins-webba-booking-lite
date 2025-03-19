import { flexRender, Header as HeaderType } from '@tanstack/react-table'
import styles from './Table.module.scss'

export interface HeaderProps {
    header: HeaderType<any, any>
}

export const Header = ({ header }: HeaderProps) => {
    const cellContent = flexRender(
        header.column.columnDef.header,
        header.getContext()
    )

    const sortLabel =
        {
            asc: ' 🔼',
            desc: ' 🔽',
        }[header.column.getIsSorted() as string] ?? null

    const element = (
        <>
            {cellContent} {sortLabel}
        </>
    )

    return (
        <th
            key={header.id}
            className={styles.tableHeader}
            onClick={header.column.getToggleSortingHandler()}
        >
            {header.isPlaceholder ? null : element}
        </th>
    )
}
