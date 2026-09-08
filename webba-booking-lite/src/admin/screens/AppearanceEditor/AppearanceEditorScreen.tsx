import { AppearanceEditor } from '../../components/AppearanceEditor/AppearanceEditor'
import {
    AppearanceProvider,
    useAppearance,
} from '../../providers/AppearanceProvider/AppearanceProvider'
import { FORM_TYPE_WATERFALL, sections } from './sections'
import './AppearanceEditorScreen.scss'
import { BookingForm } from '../../../frontend/screens/BookingForm/BookingForm'
import { BookingFormProvider } from '../../../frontend/providers/BookingFormProvider/BookingFormProvider'
import { AppearanceFooter } from './components/AppearanceFooter/AppearanceFooter'
import { FormTypePanel } from './components/FormTypePanel/FormTypePanel'
import { ToastContainer } from 'react-toastify'
import classNames from 'classnames'

const AppearancePreview = () => {
    const { formType } = useAppearance()
    const isWaterfall = formType === FORM_TYPE_WATERFALL

    return (
        <BookingFormProvider attrService={'0'} attrCategory={'0'}>
            <div
                className={classNames({
                    wbk_appearanceEditorScreen__waterfallPreview: isWaterfall,
                })}
            >
                <BookingForm formType={formType} />
            </div>
        </BookingFormProvider>
    )
}

export const AppearanceEditorScreen = () => {
    return (
        <AppearanceProvider sections={sections}>
            <FormTypePanel />
            <div className="wbk_appearanceEditorScreen__wrapper">
                <div className="wbk_appearanceEditorScreen__leftCol">
                    <AppearanceEditor />
                </div>
                <div className="wbk_appearanceEditorScreen__rightCol">
                    <AppearancePreview />
                </div>
            </div>
            <AppearanceFooter />
            <ToastContainer className="wbk_appearanceEditorScreen__toast" limit={1} />
        </AppearanceProvider>
    )
}
