import './Settings.scss'
import { buildSettingsSections } from './utils/utils'
import { SettingSupportCard } from './SettingSupportCard'
import { useSelect } from '@wordpress/data'
import { store } from '../../../store/backend'
import { Loading } from '../Loading/Loading'
import { SuccessMessage } from '../SuccessMessage/SuccessMessage'
import { FailedMessage } from '../FailedMessage/FailedMessage'

export const Settings = () => {
    const sections = buildSettingsSections()
    const isLoading = useSelect(
        (select) => select(store).getLoadingState('options'),
        []
    )

    if (isLoading) {
        return <Loading minHeight="calc(100vh - 230px)" />
    }

    return (
        <>
            <div className="wbk_settings__wrapper">
                {sections}
                <SettingSupportCard />
            </div>
            <SuccessMessage />
            <FailedMessage />
        </>
    )
}
