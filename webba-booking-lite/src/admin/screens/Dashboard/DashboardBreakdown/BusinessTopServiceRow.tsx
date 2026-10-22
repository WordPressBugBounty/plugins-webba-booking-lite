import { CSSProperties } from 'react'
import { BusinessTopServiceItem } from './types'
import './BusinessOverview.scss'

interface BusinessTopServiceRowProps {
    item: BusinessTopServiceItem
}

export const BusinessTopServiceRow = ({ item }: BusinessTopServiceRowProps) => {
    return (
        <li className="wbk_businessOverview__serviceItem">
            <div className="wbk_businessOverview__serviceMeta">
                <span className="wbk_businessOverview__serviceName">
                    {item.name}
                </span>
                <span className="wbk_businessOverview__serviceCount">
                    {item.count}
                </span>
            </div>
            <div className="wbk_businessOverview__serviceTrack">
                <div
                    className="wbk_businessOverview__serviceFill"
                    style={
                        {
                            '--wbk-service-fill': `${item.percent}%`,
                        } as CSSProperties
                    }
                />
            </div>
        </li>
    )
}
