import { useEffect, useState } from 'react'
import { __ } from '@wordpress/i18n'
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers'
import { RestrictToElement } from '@dnd-kit/dom/modifiers'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { useField } from '../../lib/hooks/useField'
import { Label } from '../Label/Label'
import {
    SortableList,
    useSortableItem,
} from '../../../SortableList/SortableList'
import plusIcon from '../../../../../../public/images/icon-plus-green.svg'
import trashIcon from '../../../../../../public/images/icon-trash.svg'
import { NestedNumberItem } from './types'
import {
    createNestedNumberItem,
    parseNestedNumbers,
    readNestedNumbers,
    serializeNestedNumbers,
} from './utils'
import './NestedNumbersField.scss'

const isPartialNumber = (value: string) =>
    value === '' || /^-?\d*\.?\d*$/.test(value)

type NestedNumberRowProps = {
    item: NestedNumberItem
    listRef: (element: Element | null) => void
    onChange: (value: string) => void
    onRemove: () => void
}

const NestedNumberRow = ({
    item,
    listRef,
    onChange,
    onRemove,
}: NestedNumberRowProps) => {
    const { handleRef } = useSortableItem()

    return (
        <li ref={listRef} className="wbk_nestedNumbersField__row">
            <button
                type="button"
                ref={handleRef}
                className="wbk_nestedNumbersField__handle"
                aria-label={__('Reorder amount', 'webba-booking-lite')}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                >
                    <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                </svg>
            </button>
            <input
                type="text"
                inputMode="decimal"
                className="wbk_nestedNumbersField__input"
                value={item.value}
                onChange={(event) => {
                    const nextValue = event.target.value
                    if (!isPartialNumber(nextValue)) {
                        return
                    }
                    onChange(nextValue)
                }}
            />
            <button
                type="button"
                className="wbk_nestedNumbersField__remove"
                onClick={onRemove}
                aria-label={__('Remove amount', 'webba-booking-lite')}
            >
                <img src={trashIcon} alt="" />
            </button>
        </li>
    )
}

export const createNestedNumbersField: FormComponentConstructor<number[] | string> =
    ({ field, fieldConfig }) => {
        return ({ name, label, misc }: FormFieldProps) => {
            const { value, setValue } = useField(field)
            const [items, setItems] = useState<NestedNumberItem[]>([])
            const listId = `nested-numbers-${name}`
            const maxLength = Number(
                misc?.max_length ?? fieldConfig.misc?.max_length ?? 0
            )
            const canAdd = !maxLength || items.length < maxLength

            useEffect(() => {
                setItems((currentItems) => {
                    const incoming = readNestedNumbers(value)
                    const current = serializeNestedNumbers(currentItems)
                    if (
                        incoming.length === current.length &&
                        incoming.every((number, index) => number === current[index])
                    ) {
                        return currentItems
                    }
                    return parseNestedNumbers(value)
                })
            }, [value])

            const commitItems = (nextItems: NestedNumberItem[]) => {
                setItems(nextItems)
                setValue(serializeNestedNumbers(nextItems))
            }

            return (
                <div className="wbk_nestedNumbersField" id={listId}>
                    <Label
                        title={label}
                        id={name}
                        tooltip={misc?.tooltip ?? fieldConfig.misc?.tooltip}
                    />
                    {items.length > 0 && (
                        <ul className="wbk_nestedNumbersField__list">
                            <SortableList
                                items={items}
                                onChange={commitItems}
                                sortableConfig={{
                                    modifiers: [
                                        RestrictToVerticalAxis,
                                        RestrictToElement.configure({
                                            element:
                                                document.getElementById(listId),
                                        }),
                                    ],
                                }}
                                renderItem={({ item, index, ref }) => (
                                    <NestedNumberRow
                                        key={item.id}
                                        item={item}
                                        listRef={ref}
                                        onChange={(nextValue) => {
                                            const nextItems = items.map(
                                                (current, itemIndex) =>
                                                    itemIndex === index
                                                        ? {
                                                              ...current,
                                                              value: nextValue,
                                                          }
                                                        : current
                                            )
                                            commitItems(nextItems)
                                        }}
                                        onRemove={() =>
                                            commitItems(
                                                items.filter(
                                                    (_, itemIndex) =>
                                                        itemIndex !== index
                                                )
                                            )
                                        }
                                    />
                                )}
                            />
                        </ul>
                    )}
                    {canAdd && (
                        <button
                            type="button"
                            className="wbk_nestedNumbersField__add"
                            onClick={() =>
                                commitItems([
                                    ...items,
                                    createNestedNumberItem(''),
                                ])
                            }
                        >
                            <img src={plusIcon} alt="" />
                            <span>{__('Add amount', 'webba-booking-lite')}</span>
                        </button>
                    )}
                </div>
            )
        }
    }
