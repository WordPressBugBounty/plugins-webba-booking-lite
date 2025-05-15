import { flexRender, type Table as TanstackTable } from '@tanstack/react-table'
import classNames from 'classnames'
import { ExpandedData } from './ExpandedData'
import styles from './Table.module.scss'
import { Header } from './Header'
import { CellProvider } from './context/CellProvider'
import { TableProvider } from './context/TableProvider'
import { Button } from '../Button/Button'
import { __ } from '@wordpress/i18n'
import { Pagination } from './Pagination'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { ErrorMessage } from '../ErrorMessage/ErrorMessage'
import { BulkActions } from './BulkActions'
import { useMemo } from 'react'
import { TableMobile } from './TableMobile'

interface Props {
    table: TanstackTable<any>
    title: string
    addButtonTitle?: string
    className?: string
    loading?: boolean
    onDeleteSelected?: () => void
    onAdd?: () => void
    filter?: JSX.Element
    search?: JSX.Element
    exportButton?: JSX.Element
    noItemsImageUrl: string
    isItemsForbidden?: boolean
    forcePermission?: boolean
    horizontalOverflow?: boolean
    collectionName?: string
}

export const Table = ({
    table,
    title,
    addButtonTitle,
    className = '',
    loading = false,
    onDeleteSelected,
    onAdd,
    filter,
    search,
    noItemsImageUrl,
    isItemsForbidden,
    exportButton,
    forcePermission,
    horizontalOverflow,
    collectionName,
}: Props) => {
    const isEmpty = !table.getRowCount()
    const { settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

    const isMobile = useMemo(() => window.innerWidth < 768, [window.innerWidth])

    return (
        <TableProvider table={table}>
            <div className={styles.tableContainer}>
                <div className={styles.tableTitleContainer}>
                    <h2 className={styles.tableTitle}>{title}</h2>
                    <div className={styles.toolPanel}>
                        {exportButton && settings?.is_admin && exportButton}
                        {search && search}
                        {(forcePermission || settings?.is_admin) &&
                            addButtonTitle &&
                            onAdd && (
                                <Button
                                    onClick={onAdd}
                                    className="button-wb"
                                    actionType="button"
                                >
                                    {addButtonTitle} +
                                </Button>
                            )}
                    </div>
                </div>
                {filter && filter}
                {loading && <div>Loading...</div>}
                {isEmpty && !isItemsForbidden && !loading && (
                    <div
                        style={{
                            textAlign: 'center',
                        }}
                    >
                        <img
                            style={{
                                display: 'block',
                                margin: '0px auto',
                            }}
                            src={noItemsImageUrl}
                        />
                        <div>
                            {__(
                                'There is nothing here...',
                                'webba-booking-lite'
                            )}
                        </div>
                    </div>
                )}
                {isItemsForbidden && !loading && (
                    <ErrorMessage
                        message={__(
                            'You do not have the necessary permissions to view this data.',
                            'webba-booking-lite'
                        )}
                        code="rest_forbidden"
                    />
                )}
                {!loading && !isEmpty && (
                    <>
                        {!isEmpty && !isItemsForbidden && (
                            <div
                                className={classNames(styles.tableWrapper, {
                                    [styles.horizontalOverflow]:
                                        horizontalOverflow,
                                })}
                            >
                                {isMobile && <TableMobile table={table} />}
                                {!isMobile && (
                                    <table
                                        className={classNames(
                                            styles.webbaDataTable,
                                            className
                                        )}
                                    >
                                        <thead className={styles.tableHead}>
                                            {table
                                                .getHeaderGroups()
                                                .map((headerGroup) => (
                                                    <tr key={headerGroup.id}>
                                                        {headerGroup.headers.map(
                                                            (header) => (
                                                                <Header
                                                                    header={
                                                                        header
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </tr>
                                                ))}
                                        </thead>
                                        <tbody>
                                            {table
                                                .getRowModel()
                                                .rows.map((row) => (
                                                    <>
                                                        <tr
                                                            key={row.id}
                                                            className={
                                                                styles.tableRow
                                                            }
                                                        >
                                                            {row
                                                                .getVisibleCells()
                                                                .map((cell) => (
                                                                    <CellProvider
                                                                        cell={
                                                                            cell
                                                                        }
                                                                    >
                                                                        <td
                                                                            className={
                                                                                styles.tableCell
                                                                            }
                                                                            data-column-name={
                                                                                cell
                                                                                    .column
                                                                                    .id
                                                                            }
                                                                            style={{
                                                                                gridArea:
                                                                                    cell
                                                                                        .column
                                                                                        .id,
                                                                            }}
                                                                        >
                                                                            {flexRender(
                                                                                cell
                                                                                    .column
                                                                                    .columnDef
                                                                                    .cell,
                                                                                cell.getContext()
                                                                            )}
                                                                        </td>
                                                                    </CellProvider>
                                                                ))}
                                                        </tr>
                                                        {row.getIsExpanded() && (
                                                            <tr
                                                                className={
                                                                    styles.tableRowExpanded
                                                                }
                                                            >
                                                                <td
                                                                    className={
                                                                        styles.expandedData
                                                                    }
                                                                    colSpan={
                                                                        row.getVisibleCells()
                                                                            .length
                                                                    }
                                                                >
                                                                    <ExpandedData
                                                                        row={
                                                                            row
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </>
                                                ))}
                                        </tbody>
                                        <tfoot>
                                            {table
                                                .getFooterGroups()
                                                .map((footerGroup) => (
                                                    <tr key={footerGroup.id}>
                                                        {footerGroup.headers.map(
                                                            (header) => (
                                                                <th
                                                                    key={
                                                                        header.id
                                                                    }
                                                                >
                                                                    {header.isPlaceholder
                                                                        ? null
                                                                        : flexRender(
                                                                              header
                                                                                  .column
                                                                                  .columnDef
                                                                                  .footer,
                                                                              header.getContext()
                                                                          )}
                                                                </th>
                                                            )
                                                        )}
                                                    </tr>
                                                ))}
                                        </tfoot>
                                    </table>
                                )}
                            </div>
                        )}
                    </>
                )}
                <Pagination table={table} />
            </div>
            {!!table.getSelectedRowModel().rows.length && (
                <BulkActions
                    onDeleteSelected={onDeleteSelected}
                    collectionName={collectionName}
                />
            )}
        </TableProvider>
    )
}
