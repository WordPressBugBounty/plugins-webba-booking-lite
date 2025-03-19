import { Table } from '@tanstack/react-table'
import styles from './Table.module.scss'
import classNames from 'classnames'
import { usePagination } from './hooks/usePagination'

interface PaginationProps {
    table: Table<any>
}

const ref = (table: any) => (
    <div>
        <button
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
        >
            {'<<'}
        </button>
        <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
        >
            {'<'}
        </button>
        <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
        >
            {'>'}
        </button>
        <button
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
        >
            {'>>'}
        </button>
        <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
                table.setPageSize(Number(e.target.value))
            }}
        >
            {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                    {pageSize}
                </option>
            ))}
        </select>
    </div>
)

export const Pagination = ({ table }: PaginationProps) => {
    const pageCount = table.getPageCount()

    if (pageCount < 2) {
        return null
    }

    const currentPageIndex = table.getState().pagination.pageIndex
    const pagination = usePagination({
        total: pageCount,
        page: currentPageIndex + 1,
        onChange: (page) => table.setPageIndex(page - 1),
    })

    return (
        <div className={styles.paginationContainer}>
            <div className={styles.pagination}>
                {pagination.range.map((page) => {
                    if (page === 'dots') {
                        return (
                            <div className={styles.paginationButton}>...</div>
                        )
                    }

                    const index = page - 1

                    return (
                        <button
                            className={classNames(styles.paginationButton, {
                                [styles.active]: index === currentPageIndex,
                            })}
                            onClick={() => {
                                table.setPageIndex(index)
                            }}
                        >
                            {page}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
