import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import { getGiftCardDesignVariant } from '../../../Form/Fields/GiftCardDesignField/giftCardDesigns'
import { GiftCardDesignCellProps } from './types'
import './GiftCardDesignCell.scss'

export const GiftCardDesignCell = ({ cell }: GiftCardDesignCellProps) => {
    const { plugin_url } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    ) as { plugin_url?: string }

    const variant = getGiftCardDesignVariant(String(cell.getValue() ?? ''))
    const imageUrl = plugin_url
        ? `${plugin_url}/${variant.background}`
        : ''

    return (
        <div className="wbk_giftCardDesignCell">
            {imageUrl && (
                <img
                    className="wbk_giftCardDesignCell__preview"
                    src={imageUrl}
                    alt={variant.label}
                />
            )}
        </div>
    )
}
