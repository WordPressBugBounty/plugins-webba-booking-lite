import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers'
import { RestrictToElement } from '@dnd-kit/dom/modifiers'
import { BuilderFieldProps } from '../types'
import { Input } from '../../../Input/Input'
import { Label } from '../../../Label/Label'
import { Button } from '../../../Button/Button'
import CloseIcon from '../../../../../../public/images/close-icon-medium.png'
import { useArrayField } from '../../hooks/useGroup'
import {
    SortableList,
    useSortableItem,
} from '../../../SortableList/SortableList'
import { QuantityFieldOption } from '../../utils/createBuilderField'
import { useFormBuilderValidation } from '../../FormBuilderValidationContext'
import styles from './QuantityFieldsField.module.css'

const listContainerId = 'quantity-fields-sortable-list'

const quantityFieldOptionValidator = (value: QuantityFieldOption) => {
    if (
        !value ||
        !String(value.label || '').trim() ||
        !String(value.slug || '').trim()
    ) {
        return __('Required field', 'webba-booking-lite')
    }

    return null
}

const emptyQuantityField = (): QuantityFieldOption => ({
    label: '',
    slug: '',
})

interface QuantityFieldItemProps {
    id: number
    index: number
    value: QuantityFieldOption
    errors: string[]
    forceShowErrors: boolean
    onChange: (value: QuantityFieldOption) => void
    onRemove: () => void
    listRef: (element: Element | null) => void
}

const QuantityFieldItem = ({
    id,
    index,
    value,
    errors,
    forceShowErrors,
    onChange,
    onRemove,
    listRef,
}: QuantityFieldItemProps) => {
    const { handleRef } = useSortableItem()
    const labelInputId = `quantity-field-label-${id}-${index}`
    const slugInputId = `quantity-field-slug-${id}-${index}`

    return (
        <li ref={listRef} className={styles.row}>
            <button
                type="button"
                ref={handleRef}
                className={styles.handle}
                aria-label={__('Reorder field', 'webba-booking-lite')}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                >
                    <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                </svg>
            </button>
            <div className={styles.inputs}>
                <div className={styles.inputWrapper}>
                    <Input
                        id={labelInputId}
                        value={value?.label || ''}
                        onChange={(label) =>
                            onChange({
                                ...value,
                                label,
                            })
                        }
                        placeholder={__('Label', 'webba-booking-lite')}
                        errors={errors}
                        forceShowErrors={forceShowErrors}
                    />
                </div>
                <div className={styles.inputWrapper}>
                    <Input
                        id={slugInputId}
                        value={value?.slug || ''}
                        onChange={(slug) =>
                            onChange({
                                ...value,
                                slug,
                            })
                        }
                        placeholder={__('Slug', 'webba-booking-lite')}
                    />
                </div>
            </div>
            <button
                className={styles.menuBtn}
                type="button"
                onClick={onRemove}
                aria-label={__('Remove field', 'webba-booking-lite')}
            >
                <img src={CloseIcon} className={styles.deleteIcon} />
            </button>
        </li>
    )
}

export const QuantityFieldsField = ({ group }: BuilderFieldProps) => {
    const quantityFields = useArrayField(group.id, 'quantityFields')
    const { showValidation } = useFormBuilderValidation()
    const hasNoFields = quantityFields.fields.length === 0
    const showEmptyError = showValidation && hasNoFields

    const sortableItems = quantityFields.fields.map((field, index) => ({
        id: index,
        value: (field.value || emptyQuantityField()) as QuantityFieldOption,
        errors: field.errors,
    }))

    return (
        <div className={styles.wrapper} id={listContainerId}>
            <div>
                <Label>{__('Quantity', 'webba-booking-lite')}</Label>
            </div>
            <ul className={styles.fields}>
                {sortableItems.length ? (
                    <SortableList
                        items={sortableItems}
                        onChange={(items) => {
                            quantityFields.reorder(
                                items.map((item) => item.value)
                            )
                        }}
                        sortableConfig={{
                            modifiers: [
                                RestrictToVerticalAxis,
                                RestrictToElement.configure({
                                    element:
                                        document.getElementById(
                                            listContainerId
                                        ),
                                }),
                            ],
                        }}
                        renderItem={({ item, index, ref }) => (
                            <QuantityFieldItem
                                key={item.id}
                                id={group.id}
                                index={index}
                                value={item.value}
                                errors={item.errors}
                                forceShowErrors={showValidation}
                                listRef={ref}
                                onChange={(value) =>
                                    quantityFields.setValueAt(index, value)
                                }
                                onRemove={() => quantityFields.removeAt(index)}
                            />
                        )}
                    />
                ) : (
                    <div
                        className={classNames(styles.emptyState, {
                            [styles.emptyStateError]: showEmptyError,
                        })}
                    >
                        {__(
                            'No quantity fields added. Press "Add quantity field" to add one.',
                            'webba-booking-lite'
                        )}
                    </div>
                )}
            </ul>
            <div>
                <Button
                    onClick={() => {
                        quantityFields.push({
                            defaultValue: emptyQuantityField(),
                            validators: [quantityFieldOptionValidator],
                            validateOnInit: true,
                        })
                    }}
                >
                    {__('Add quantity field', 'webba-booking-lite')}
                </Button>
            </div>
        </div>
    )
}
