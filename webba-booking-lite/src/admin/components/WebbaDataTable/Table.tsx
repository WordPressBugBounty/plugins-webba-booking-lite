import { flexRender, type Table as TanstackTable } from '@tanstack/react-table'
import classNames from 'classnames'
import { ExpandedData } from './ExpandedData'
import './Table.scss'
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
import { Loading } from '../Loading/Loading'

interface Props {
    table: TanstackTable<any>
    title: string
    description?: string
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
    description,
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
            <div className="wbk_table__container">
                <div className="wbk_table__titleContainer">
                    <div className='wbk_table__titleDescription'>
                        <h2 className="wbk_table__title">{title}</h2>
                        {description && <p className="wbk_table__description">{description}</p>}
                    </div>
                    <div className="wbk_table__toolPanel">
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
                {loading && <Loading minHeight="100%" transparent />}
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
                                className={classNames('wbk_table__wrapper', {
                                    'wbk_table__wrapper--horizontalOverflow':
                                        horizontalOverflow,
                                })}
                            >
                                {isMobile && <TableMobile table={table} />}
                                {!isMobile && (
                                    <table
                                        className={classNames(
                                            'wbk_table__dataTable',
                                            className
                                        )}
                                    >
                                        <thead className="wbk_table__head">
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
                                                            className="wbk_table__row"
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
                                                                            className="wbk_table__cell"
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
                                                                className="wbk_table__rowExpanded"
                                                            >
                                                                <td
                                                                    className="wbk_table__expandedData"
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
