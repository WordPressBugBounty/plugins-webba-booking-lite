import { flexRender, Header as HeaderType } from '@tanstack/react-table'
import styles from './Table.module.scss'
import iconSortNull from '../../../../public/images/sort-null.png'
import iconSortAsc from '../../../../public/images/sort-asc.png'
import iconSortDesc from '../../../../public/images/sort-desc.png'

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
            asc: <img src={iconSortAsc} />,
            desc: <img src={iconSortDesc} />,
        }[header.column.getIsSorted() as string] ??
        ((header.column.getCanSort() && <img src={iconSortNull} />) || null)

    const element = (
        <div className={styles.tableHeaderContent}>
            {cellContent} {sortLabel}
        </div>
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
