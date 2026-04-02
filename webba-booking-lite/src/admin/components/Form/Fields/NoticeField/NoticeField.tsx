import { FormNotice } from '../../../../../frontend/components/FormNotice/FormNotice'
import { FormComponentConstructor } from '../../lib/types'
import infoIcon from '../../../../../../public/images/info-blue.svg'
import './NoticeField.scss'

export const createNoticeField: FormComponentConstructor<any> = () => {
    return ({ misc }) => {
        return (
            <div className="wbk_noticeField">
                <img src={infoIcon} className="wbk_noticeField__icon" />
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
