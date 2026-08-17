import { useEffect, useRef } from 'react'
import './Settings.scss'
import {
    buildSettingsSections,
    useOpenSettingsSection,
} from './utils/utils'
import { SettingSupportCard } from './SettingSupportCard'
import { SettingResetAllCard } from './SettingResetAllCard'
import { useSelect } from '@wordpress/data'
import { store } from '../../../store/backend'
import { Loading } from '../Loading/Loading'
import { SuccessMessage } from '../SuccessMessage/SuccessMessage'
import { FailedMessage } from '../FailedMessage/FailedMessage'
import { usePreset } from '../../hooks/usePreset'

export const Settings = () => {
    const sections = buildSettingsSections()
    const openSettingsSection = useOpenSettingsSection()
    const hasOpenedFromUrl = useRef(false)
    const { plan_map } = usePreset()
    const isLoading = useSelect(
        (select) => select(store).getLoadingState('options'),
        []
    )
    const options = useSelect((select) => select(store).getOptions(), [])

    useEffect(() => {
        if (isLoading || hasOpenedFromUrl.current) {
            return
        }

        if (!plan_map || typeof plan_map !== 'object') {
            return
        }

        const params = new URLSearchParams(window.location.search)
        const openSection = params.get('open_section')
        const openTab = params.get('open_tab') || undefined
        const mailer = params.get('wbk_mailer')

        if (!openSection) {
            return
        }

        if (!options?.[openSection]) {
            return
        }

        const fieldOverrides: Record<string, string> = {}
        if (mailer) {
            fieldOverrides.wbk_mailer = mailer
        }

        hasOpenedFromUrl.current = true
        openSettingsSection(
            openSection,
            openTab,
            Object.keys(fieldOverrides).length ? fieldOverrides : undefined
        )

        params.delete('open_section')
        params.delete('open_tab')
        params.delete('wbk_mailer')
        const nextSearch = params.toString()
        const nextUrl =
            window.location.pathname +
            (nextSearch ? `?${nextSearch}` : '') +
            window.location.hash
        window.history.replaceState({}, '', nextUrl)
    }, [isLoading, options, openSettingsSection, plan_map])

    if (isLoading) {
        return <Loading minHeight="calc(100vh - 230px)" />
    }

    return (
        <>
            <div className="wbk_settings__wrapper">
                {sections}
                <SettingResetAllCard />
                <SettingSupportCard />
            </div>
            <SuccessMessage />
            <FailedMessage />
        </>
    )
}
