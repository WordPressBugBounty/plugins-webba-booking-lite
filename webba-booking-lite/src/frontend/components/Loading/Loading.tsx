import React from 'react'
import './Loading.scss'
import { useWording } from '../../hooks/useWording'
import classNames from 'classnames'

interface LoadingProps {
    message?: string
    size?: 'small' | 'medium' | 'large'
}

export const Loading: React.FC<LoadingProps> = ({
    message,
    size = 'medium',
}) => {
    const wording = useWording()
    const loadingMessage = message || wording?.loading || 'Loading...'

    return (
        <div className={'wbk_loading_container'}>
            <div
                className={classNames(
                    'wbk_loading_container__spinner',
                    `wbk_loading_container__spinner--${size}`
                )}
            ></div>
            <p className={'wbk_loading_container__message'}>{loadingMessage}</p>
        </div>
    )
}
