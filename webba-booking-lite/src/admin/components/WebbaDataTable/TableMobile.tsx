import { useCallback, useMemo } from 'react'
import './TableMobile.scss'
import { ITableMobileProps } from './types'
import { flexRender, type Cell } from '@tanstack/react-table'
import { CellProvider } from './context/CellProvider'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { ExpandedData } from './ExpandedData'

export const ignoreMappingCells = ['name', 'id', 'menu', 'select']
export const customActionCells = ['status', 'test']

export const TableMobile = ({ table }: ITableMobileProps) => {
    const columns = table.getAllColumns().map((col) => col.columnDef.id)
    const rows = useMemo(
        () => table.getRowModel().rows,
        [table.getRowModel().rows]
    )

    const getSpecificCell = useCallback(
        (row: any, cellName: string) =>
            row
                .getVisibleCells()
                .find((cell: any) => cell.column.id === cellName),
        [rows, columns]
    )

    const getCustomActionCells = useCallback(
        (row: any) =>
            row
                .getVisibleCells()
                .filter((cell: any) =>
                    customActionCells.includes(cell.column.id)
                ),
        [rows, columns]
    )

    return (
        <div className="wbk_tableMobile__wrapper">
            {rows.map((row: any) => (
                <div className="wbk_tableMobile__card" key={row.id}>
                    <div
                        className={classNames(
                            'wbk_tableMobile__rowItem',
                            'wbk_tableMobile__firstStage'
                        )}
                    >
                        {/* Render ID and name of the model item */}
                        <div className="wbk_tableMobile__cellItem">
                            {columns.includes('id') && (
                                <div className="wbk_tableMobile__rowItemTitle">
                                    #{row.original.id}
                                </div>
                            )}
                            <div className="wbk_tableMobile__rowItemContent">
                                {flexRender(
                                    getSpecificCell(row, 'name').column
                                        .columnDef.cell,
                                    getSpecificCell(row, 'name')?.getContext()
                                )}
                            </div>
                        </div>
                        {/* Render custom actions cells if it matches with pre defined */}
                        {getCustomActionCells(row).length > 0 && (
                            <div className="wbk_tableMobile__cellItem">
                                {getCustomActionCells(row).map((cell: any) =>
                                    flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )
                                )}
                            </div>
                        )}
                    </div>
                    <div
                        className={classNames(
                            'wbk_tableMobile__rowItem',
                            'wbk_tableMobile__mappedItems'
                        )}
                    >
                        {row
                            .getVisibleCells()
                            .filter(
                                (cell: any) =>
                                    !ignoreMappingCells.includes(
                                        cell.column.columnDef.id
                                    ) &&
                                    !customActionCells.includes(
                                        cell.column.columnDef.id
                                    )
                            )
                            .slice(
                                0,
                                row.getCanExpand()
                                    ? 4
                                    : row.getVisibleCells().length
                            )
                            .map((cell: any) => (
                                <div className="wbk_tableMobile__cellItem" key={cell.id}>
                                    <CellProvider cell={cell}>
                                        <div className="wbk_tableMobile__rowItemTitle">
                                            {cell.column.columnDef.header}
                                        </div>
                                        <div className="wbk_tableMobile__rowItemContent">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </div>
                                    </CellProvider>
                                </div>
                            ))}
                    </div>
                    {row.getIsExpanded() && (
                        <div className="wbk_tableMobile__rowItem">
                            <ExpandedData row={row} />
                        </div>
                    )}
                    <div
                        className={classNames(
                            'wbk_tableMobile__rowItem',
                            'wbk_tableMobile__toolPanel',
                            {
                                'wbk_tableMobile__toolPanel--expandable': row.getCanExpand(),
                            }
                        )}
                    >
                        {row.getCanExpand() && (
                            <div
                                className={classNames('wbk_tableMobile__expandButton', {
                                    'wbk_tableMobile__expandButton--expanded': row.getIsExpanded(),
                                })}
                                onClick={() => row.toggleExpanded()}
                            >
                                {!row.getIsExpanded() &&
                                    __('More details', 'webba-booking-lite')}
                                {row.getIsExpanded() &&
                                    __('Hide details', 'webba-booking-lite')}
                            </div>
                        )}
                        <div>
                            <CellProvider cell={getSpecificCell(row, 'menu')}>
                                {flexRender(
                                    getSpecificCell(row, 'menu').column
                                        .columnDef.cell,
                                    getSpecificCell(row, 'menu').getContext()
                                )}
                            </CellProvider>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
