import { useEffect } from 'react'
import { ShortcodeAttributeFields } from '../../admin/components/ShortcodeBuilder/ShortcodeAttributeFields'
import { useShortcodeAttributeFilters } from '../../admin/components/ShortcodeBuilder/useShortcodeAttributeFilters'
import { TBookingFormFilterAttribute } from './types'
import './NavMenuBookingForm.scss'

const FILTER_ATTRIBUTE_KEYS: TBookingFormFilterAttribute[] = [
    'service',
    'category',
    'location',
    'staff',
    'units',
]

export const NavMenuBookingForm = () => {
    const filters = useShortcodeAttributeFilters()

    useEffect(() => {
        const container = document.getElementById('wbk_nav_menu_booking')
        if (!container) {
            return
        }

        FILTER_ATTRIBUTE_KEYS.forEach((key) => {
            const value = filters.dataAttrs[key]
            if (value) {
                container.setAttribute(`data-${key}`, value)
                return
            }

            container.removeAttribute(`data-${key}`)
        })
    }, [filters.dataAttrs])

    return (
        <div className="wbk_nav_menu_booking">
            <ShortcodeAttributeFields filters={filters} />
        </div>
    )
}
