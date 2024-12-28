import { flexRender, type Table as TanstackTable } from '@tanstack/react-table'

import { ExpandedData } from './ExpandedData'
import styles from './Table.module.css'
import classNames from 'classnames'

interface Props {
    data: any[]
    table: TanstackTable<any>
    title: string
}

export const Table = ({ table, title }: Props) => {
    return (
        <div className={styles.tableContainer}>
            <div className={styles.tableTitleContainer}>
                <h2 className={styles.tableTitle}>{title}</h2>
            </div>
            <table className={styles.webbaDataTable}>
                <thead className={styles.tableHead}>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className={styles.tableHeader}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <>
                            <tr
                                key={row.id}
                                className={classNames(styles.tableRow, {
                                    [styles.tableRowExpanded]:
                                        row.getIsExpanded(),
                                })}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td className={styles.tableCell}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                            {row.getIsExpanded() && (
                                <tr className={styles.tableRowExpanded}>
                                    <td
                                        className={styles.expandedData}
                                        colSpan={row.getVisibleCells().length}
                                    >
                                        <ExpandedData row={row} />
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                </tbody>
                <tfoot>
                    {table.getFooterGroups().map((footerGroup) => (
                        <tr key={footerGroup.id}>
                            {footerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.footer,
                                              header.getContext()
                                          )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </tfoot>
            </table>
        </div>
    )
}
