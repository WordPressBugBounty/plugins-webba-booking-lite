import { Table } from '@tanstack/react-table'
import './Table.scss'
import classNames from 'classnames'
import { usePagination } from './hooks/usePagination'
import { __ } from '@wordpress/i18n'
import { useCallback, useEffect, useLayoutEffect } from 'react'
import iconArrowLeft from '../../../../public/images/icon-arrow-left.svg'
import iconArrowRight from '../../../../public/images/icon-arrow-right.svg'

interface PaginationProps {
    table: Table<any>
}

// const ref = (table: any) => (
//     <div>
//         <button
//             onClick={() => table.firstPage()}
//             disabled={!table.getCanPreviousPage()}
//         >
//             {'<<'}
//         </button>
//         <button
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}
//         >
//             {'<'}
//         </button>
//         <button
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}
//         >
//             {'>'}
//         </button>
//         <button
//             onClick={() => table.lastPage()}
//             disabled={!table.getCanNextPage()}
//         >
//             {'>>'}
//         </button>
//         <select
//             value={table.getState().pagination.pageSize}
//             onChange={(e) => {
//                 table.setPageSize(Number(e.target.value))
//             }}
//         >
//             {[10, 20, 30, 40, 50].map((pageSize) => (
//                 <option key={pageSize} value={pageSize}>
//                     {pageSize}
//                 </option>
//             ))}
//         </select>
//     </div>
// )

export const Pagination = ({ table }: PaginationProps) => {
    useLayoutEffect(() => {
        table.setPageSize(15)
    }, [])
    const pageCount = table.getPageCount()
    const currentPageIndex = table.getState().pagination.pageIndex
    const pagination = usePagination({
        total: pageCount,
        page: currentPageIndex + 1,
        onChange: (page) => table.setPageIndex(page - 1),
    })
    const scrollTop = useCallback(
        () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        []
    )

    // useEffect(() => {
    //     window.scrollTo({ top: 0, behavior: 'smooth' })
    // }, [table.getPaginationRowModel()])

    return (
        <div className="wbk_table__paginationContainer">
            <div className="wbk_table__itemCountWrapper">
                <p>{__('Show', 'webba-booking-lite')}</p>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                        table.setPageSize(Number(e.target.value))
                    }}
                >
                    {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            {pageSize}
                        </option>
                    ))}
                </select>
                <p>{__('entries', 'webba-booking-lite')}</p>
            </div>
            {pageCount >= 2 && (
                <div className="wbk_table__paginationTools">
                    <button
                        onClick={() => {
                            table.previousPage()
                            scrollTop()
                        }}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span>{__('Previous', 'webba-booking-lite')}</span>
                        <img
                            src={iconArrowLeft}
                            alt={__('Previous page', 'webba-booking-lite')}
                        />
                    </button>
                    <div className="wbk_table__pagination">
                        {pagination.range.map((page) => {
                            if (page === 'dots') {
                                return (
                                    <div className="wbk_table__paginationBtn">
                                        ...
                                    </div>
                                )
                            }

                            const index = page - 1

                            return (
                                <button
                                    className={classNames(
                                        'wbk_table__paginationBtn',
                                        {
                                            'wbk_table__paginationBtn--active':
                                                index === currentPageIndex,
                                        }
                                    )}
                                    onClick={() => {
                                        table.setPageIndex(index)
                                        scrollTop()
                                    }}
                                >
                                    {page}
                                </button>
                            )
                        })}
                    </div>
                    <button
                        onClick={() => {
                            table.nextPage()
                            scrollTop()
                        }}
                        disabled={!table.getCanNextPage()}
                    >
                        <span>{__('Next', 'webba-booking-lite')}</span>
                        <img
                            src={iconArrowRight}
                            alt={__('Next page', 'webba-booking-lite')}
                        />
                    </button>
                </div>
            )}
        </div>
    )
}
