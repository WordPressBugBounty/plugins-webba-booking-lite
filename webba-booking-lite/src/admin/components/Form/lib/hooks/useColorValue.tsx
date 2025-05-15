import { useSelect } from '@wordpress/data'
import { IColorValueProps } from '../../Fields/ColorField/types'
import { store_name } from '../../../../../store/backend'
import { generateRandomColor } from '../../Fields/ColorField/utils'

export const useColorValue = ({ value, misc, setValue }: IColorValueProps) => {
    const items = useSelect(
        (select) =>
            // @ts-ignore
            select(store_name).getItems(
                (misc?.generate_key &&
                    misc?.generate_key[0] &&
                    misc?.generate_key[0]) ||
                    'services',
                []
            ),
        []
    )

    if (value) return value

    if (!value && items) {
        const color = generateRandomColor(
            items.map(
                (item: any) =>
                    item[
                        (misc?.generate_key && misc?.generate_key[1]) || 'color'
                    ]
            )
        )

        setValue(color)

        return color
    }

    return value
}
