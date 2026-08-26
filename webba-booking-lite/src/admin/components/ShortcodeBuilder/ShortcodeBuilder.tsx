import { useEffect, useMemo, useState } from 'react'
import { __ } from '@wordpress/i18n'
import './ShortcodeBuilder.scss'
import { ReactComponent as CloseIcon } from '../../../../public/images/icon-close.svg'
import { ReactComponent as ClipboardIcon } from '../../../../public/images/icon-clipboard.svg'
import { ReactComponent as CheckIcon } from '../../../../public/images/icon-check-nobg.svg'
import { useSidebar } from '../Sidebar/SidebarContext'
import { ShortcodeAttributeFields } from './ShortcodeAttributeFields'
import { useShortcodeAttributeFilters } from './useShortcodeAttributeFilters'

export const ShortcodeBuilder = () => {
    const sidebar = useSidebar()
    const filters = useShortcodeAttributeFilters()
    const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
    const { isDailyServiceType, serviceId, categoryIds, locationIds, staffIds } =
        filters

    const shortcode = useMemo(() => {
        const args: string[] = []
        if (isDailyServiceType) {
            args.push('units=yes')
        }
        if (serviceId != null && serviceId !== '') {
            args.push(`service=${serviceId}`)
        }
        if (categoryIds.length > 0) {
            args.push(`category=${categoryIds.join(',')}`)
        }
        if (locationIds.length > 0) {
            args.push(`location=${locationIds.join(',')}`)
        }
        if (!isDailyServiceType && staffIds.length > 0) {
            args.push(`staff=${staffIds.join(',')}`)
        }
        return `[webbabooking ${args.join(' ')}]`
    }, [
        isDailyServiceType,
        serviceId,
        categoryIds.join(','),
        locationIds.join(','),
        staffIds.join(','),
    ])

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shortcode)
            setCopyState('copied')
        } catch {}
    }

    useEffect(() => {
        if (copyState !== 'copied') return
        const t = window.setTimeout(() => setCopyState('idle'), 1200)
        return () => window.clearTimeout(t)
    }, [copyState])

    return (
        <div className="wbk_shortcode_builder">
            <div className="wbk_shortcode_builder__header">
                <div>
                    <h3 className="wbk_shortcode_builder__title">
                        {__('Shortcode builder', 'webba-booking-lite')}
                    </h3>
                    <p className="wbk_shortcode_builder__subtitle">
                        {__(
                            'Select the attributes below to generate your custom booking shortcode.',
                            'webba-booking-lite'
                        )}
                    </p>
                </div>
                <button
                    type="button"
                    className="wbk_shortcode_builder__close"
                    onClick={() => sidebar.close()}
                    aria-label={__('Close', 'webba-booking-lite')}
                >
                    <CloseIcon />
                </button>
            </div>

            <div className="wbk_shortcode_builder__body">
                <ShortcodeAttributeFields filters={filters} />

                <div className="wbk_shortcode_builder__output">
                    <label>
                        {__('Generated Shortcode', 'webba-booking-lite')}
                    </label>
                    <div className="wbk_shortcode_builder__codebar">
                        <code>{shortcode}</code>
                        <div className="wbk_shortcode_builder__actions">
                            <button
                                type="button"
                                onClick={copyToClipboard}
                                aria-label={__('Copy', 'webba-booking-lite')}
                                title={__('Copy', 'webba-booking-lite')}
                                className="wbk_shortcode_builder__copyButton"
                            >
                                {copyState === 'copied' ? (
                                    <CheckIcon aria-hidden="true" />
                                ) : (
                                    <ClipboardIcon aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
