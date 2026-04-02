import './FieldDescription.scss'
import iconInfo from '../../../../../../public/images/info-blue.svg'
import { IFieldDescriptionProps } from './types'

export const FieldDescription = ({ description }: IFieldDescriptionProps) => {
    return (
        <div className="wbk_fieldDescription">
            <img src={iconInfo} />
            <span dangerouslySetInnerHTML={{ __html: description }} />
        </div>
    )
}
