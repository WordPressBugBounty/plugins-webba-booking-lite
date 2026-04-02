import { Button } from '../../../../components/Button/Button'
import { __ } from '@wordpress/i18n'
import './AppearanceFooter.scss'
import { useAppearance } from '../../../../providers/AppearanceProvider/AppearanceProvider'
import { useDispatch } from '@wordpress/data'
import { store } from '../../../../../store/backend'
import { extractOptionValues } from '../../../../components/AppearanceEditor/utils'
import { toast, ToastContentProps } from 'react-toastify'

interface SuccessNotificationProps {
    success: boolean
}

const SuccessNotification = ({
    data,
}: ToastContentProps<SuccessNotificationProps>) => {
    return (
        <div>
            <div>{__('Settings Saved Successfully', 'webba-booking-lite')}</div>
        </div>
    )
}

export const AppearanceFooter = () => {
    const { sections } = useAppearance()
    const { updateAppearance } = useDispatch(store)

    return (
        <div className="wbk_appearanceFooter__wrapper">
            <Button
                onClick={async () => {
                    await updateAppearance(extractOptionValues(sections))
                    toast.success(SuccessNotification, {
                        theme: 'colored',
                        autoClose: 2000,
                    })
                }}
            >
                {__('Save Changes', 'webba-booking-lite')}
            </Button>
        </div>
    )
}
