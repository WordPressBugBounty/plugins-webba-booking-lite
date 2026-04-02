import { IFormNoticeProps } from './types'
import './FormNotice.scss'
import { PropsWithChildren } from 'react'
import classNames from 'classnames'

export const FormNotice = ({
    notice,
    children,
    className,
}: PropsWithChildren<IFormNoticeProps>) => {
    return (
        <div className={classNames('wbk_form_notice', className)}>
            {notice || children}
        </div>
    )
}
