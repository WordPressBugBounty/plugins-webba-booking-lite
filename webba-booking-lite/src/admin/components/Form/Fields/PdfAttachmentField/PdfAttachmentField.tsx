import { useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { FormComponentConstructor } from '../../lib/types'
import { useField } from '../../lib/hooks/useField'
import { useForm } from '../../lib/FormProvider'
import { createEditorField } from '../EditorField/EditorField'
import { createGiftCardDesignField } from '../GiftCardDesignField/GiftCardDesignField'
import {
    getDefaultGiftCardDesign,
    parseGiftCardDesign,
    serializeGiftCardDesign,
} from '../GiftCardDesignField/giftCardDesigns'

export const createPdfAttachmentField: FormComponentConstructor<any> = (
    config
) => {
    const EditorComponent = createEditorField(config)
    const DesignComponent = createGiftCardDesignField(config)

    return (props) => {
        const form = useForm()
        const { value, setValue } = useField(config.field)
        const trigger = useSnapshot(form.fields.type.value).value
        const isGiftCardSent = trigger === 'gift_card_sent'

        useEffect(() => {
            if (isGiftCardSent) {
                if (!parseGiftCardDesign(value)) {
                    setValue(
                        serializeGiftCardDesign(getDefaultGiftCardDesign())
                    )
                }
                return
            }

            if (parseGiftCardDesign(value)) {
                setValue('')
            }
        }, [isGiftCardSent, setValue, value])

        if (isGiftCardSent) {
            return <DesignComponent {...props} />
        }

        return <EditorComponent {...props} />
    }
}
