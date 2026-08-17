import classNames from 'classnames'
import './Loading.scss'

interface LoadingProps {
    className?: string
    text?: string
    minHeight?: string
    transparent?: boolean
}

export const Loading = ({
    className,
    text = 'LOADING...',
    minHeight = '100%',
    transparent = false,
}: LoadingProps) => {
    return (
        <div className={className}>
            <div
                className={classNames('wbk_loading', {
                    'wbk_loading--transparent': transparent,
                })}
                style={{ minHeight }}
            >
                <div className="wbk_loading__bars">
                    {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                        <div
                            key={index}
                            className="wbk_loading__bar"
                            style={{
                                animationDelay: `${index * 0.1}s`,
                            }}
                        />
                    ))}
                </div>
                {text && <div className="wbk_loading__text">{text}</div>}
            </div>
        </div>
    )
}
