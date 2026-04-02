import { __ } from '@wordpress/i18n'
import { useCallback, useEffect, useState } from 'react'
import { useSidebar } from '../../../components/Sidebar/SidebarContext'
import { FilterForm } from '../../../components/Filter/FilterForm'
import { Button } from '../../../components/Button/Button'
import { TAllowedFilterValue } from '../../../components/Filter/types'
import apiFetch from '@wordpress/api-fetch'
import closeIcon from '../../../../../public/images/icon-close.svg'
import iconDownload from '../../../../../public/images/icon-download.svg'
import iconFilter from '../../../../../public/images/icon-filter.svg'
import { ExportCSVProps } from './types'
import './ExportCSV.scss'
import classNames from 'classnames'

const convertFiltersToApiFormat = (
    filters: TAllowedFilterValue<any>[]
): { name: string; value: string | number | (string | number)[] }[] => {
    return filters.map((f: any) => ({
        name: f.name,
        value: Array.isArray(f.value) ? f.value : f.value,
    }))
}

export const ExportCSV = ({
    selectedIds,
    filterFields,
    onClose,
}: ExportCSVProps) => {
    const sidebar = useSidebar()
    const [filterQuery, setFilterQuery] = useState<
        TAllowedFilterValue<any>[] | null
    >(null)
    const [exportSelectedLoading, setExportSelectedLoading] = useState(false)
    const [filterExportLoading, setFilterExportLoading] = useState(false)

    const handleClose = useCallback(() => {
        onClose?.()
        sidebar.close()
    }, [onClose, sidebar])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [handleClose])

    const handleExportSelected = useCallback(async () => {
        if (!selectedIds.length) return
        setExportSelectedLoading(true)
        try {
            const filters = { id: selectedIds }
            const { url }: { url: string } = await apiFetch({
                path: 'wbk/v1/csv-export/',
                method: 'POST',
                data: { filters, export_type: 'selected' },
            })
            if (url) {
                const link = document.createElement('a')
                link.href = url
                const fileName = url.substring(url.lastIndexOf('/') + 1) || 'export.csv'
                link.download = fileName
                link.click()
                handleClose()
            }
        } catch (e) {
            console.error('Export failed', e)
        } finally {
            setExportSelectedLoading(false)
        }
    }, [selectedIds, handleClose])

    const handleFilterExport = useCallback(async () => {
        if (!filterQuery || !filterQuery.length) return
        setFilterExportLoading(true)
        try {
            const filters = convertFiltersToApiFormat(filterQuery)
            const { url }: { url: string } = await apiFetch({
                path: 'wbk/v1/csv-export/',
                method: 'POST',
                data: { filters, export_type: 'filtered' },
            })
            if (url) {
                const link = document.createElement('a')
                link.href = url
                const fileName = url.substring(url.lastIndexOf('/') + 1) || 'export.csv'
                link.download = fileName
                link.click()
                handleClose()
            }
        } catch (e) {
            console.error('Export failed', e)
        } finally {
            setFilterExportLoading(false)
        }
    }, [filterQuery, handleClose])

    return (
        <div className="wbk_exportCSV__container">
            <div className="wbk_exportCSV__header">
                <h2 className="wbk_exportCSV__title">
                    {__('Export Bookings to CSV', 'webba-booking-lite')}
                </h2>
                <button
                    type="button"
                    onClick={handleClose}
                    className="wbk_exportCSV__closeBtn"
                    aria-label={__('Close', 'webba-booking-lite')}
                >
                    <img src={closeIcon} alt="" />
                </button>
            </div>
            <div className="wbk_exportCSV__content">
                <section className={classNames('wbk_exportCSV__section', 'wbk_exportCSV__selectedExportSection')}>
                    <div>
                        <h3 className="wbk_exportCSV__sectionTitle">
                            {__('Export Selected Bookings', 'webba-booking-lite')}
                        </h3>
                        <p className="wbk_exportCSV__sectionDescription">
                            {__(
                                'Export the currently selected bookings ({{count}} items)',
                                'webba-booking-lite'
                            ).replace('{{count}}', String(selectedIds.length))}
                        </p>
                    </div>
                    <Button
                        type="primary"
                        onClick={handleExportSelected}
                        isLoading={exportSelectedLoading}
                        disabled={!selectedIds.length}
                        className="wbk_exportCSV__exportButton"
                    >
                        <img src={iconDownload} alt="" />
                        {__('Export Selected', 'webba-booking-lite')}
                    </Button>
                </section>
                <section className="wbk_exportCSV__section">
                    <h3 className="wbk_exportCSV__sectionTitle">
                        {__('Filter & Export', 'webba-booking-lite')}
                    </h3>
                    <p className="wbk_exportCSV__sectionDescription">
                        {__(
                            'Apply filters and export matching bookings',
                            'webba-booking-lite'
                        )}
                    </p>
                    <div className="wbk_exportCSV__filterFormWrapper">
                        <FilterForm
                            fields={filterFields}
                            model="appointments"
                            columnCount={2}
                            preventFilterDispatch={true}
                            setCustomQuery={setFilterQuery}
                            classes="wbk_exportCSV__filterFormCompact"
                        />
                    </div>
                    <div className="wbk_exportCSV__actionItems">
                        <Button
                            type="primary"
                            onClick={handleFilterExport}
                            isLoading={filterExportLoading}
                            disabled={
                                !filterQuery ||
                                filterQuery.length === 0 ||
                                filterQuery.every(
                                    (f: any) =>
                                        f.value == null ||
                                        f.value === '' ||
                                        (Array.isArray(f.value) &&
                                            f.value.length === 0)
                                )
                            }
                            className="wbk_exportCSV__exportButton"
                        >
                            <img src={iconFilter} alt="" />
                            {__('Filter & Export', 'webba-booking-lite')}
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    )
}
