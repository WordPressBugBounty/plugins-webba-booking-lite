import classNames from 'classnames'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldMisc } from '../../types'
import { usePreset } from '../../../../hooks/usePreset'
import infoIcon from '../../../../../../public/images/info-blue.svg'
import './NoticeField.scss'

export const createNoticeField: FormComponentConstructor<any> = () => {
    return ({ misc }) => {
        const { settings } = usePreset() as {
            settings?: { show_booked_slots?: boolean }
        }
        const isWarning =
            misc?.sub_type === 'warning' ||
            readNoticeVariant(misc?.options) === 'warning'

        if (
            misc?.requires_show_booked_slots &&
            settings?.show_booked_slots !== false
        ) {
            return null
        }

        return (
            <div
                className={classNames('wbk_noticeField', {
                    'wbk_noticeField--warning': isWarning,
                })}
            >
                <img src={infoIcon} className="wbk_noticeField__icon" alt="" />
                <div className="wbk_noticeField__content">
                    <div
                        dangerouslySetInnerHTML={{
                            __html: misc?.tooltip as string,
                        }}
                    />
                </div>
            </div>
        )
    }
}

function readNoticeVariant(options: FormFieldMisc['options']): string | undefined {
    if (!options || typeof options !== 'object' || Array.isArray(options)) {
        return undefined
    }

    if (!('variant' in options)) {
        return undefined
    }

    const variant = options.variant
    return typeof variant === 'string' ? variant : undefined
}
