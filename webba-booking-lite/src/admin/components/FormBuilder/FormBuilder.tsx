import { __ } from '@wordpress/i18n'

import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers'
import { RestrictToElement } from '@dnd-kit/dom/modifiers'
import { useState } from 'react'
import closeIcon2 from '../../../../public/images/close-icon2.png'
import { Button } from '../Button/Button'
import { Validators } from '../Form/utils/validation'
import { Input } from '../Input/Input'
import { useSidebar } from '../Sidebar/SidebarContext'
import { SortableList } from '../SortableList/SortableList'
import { Field } from './Fields/Field'
import './FormBuilder.scss'
import {
    FieldGroupConfig,
    getGroupArrayValid,
    getGroupArrayValue,
    GroupProvider,
    useField,
    useFieldGroupArray,
} from './hooks/useGroup'
import { FieldType } from './types'
import { BuilderGroupConfig, getBuilderGroup } from './utils/createBuilderField'
import { reorder } from './utils/reorder'

const containerId = 'sortable-list-container'

interface FormBuilderProps {
    buttonTitle: string
    onSave: (data: any) => void
    initialState?: {
        name: string
        fields: BuilderGroupConfig[]
    }
}

const initGroupArrayConfig: FieldGroupConfig[] = [
    getBuilderGroup(
        {
            slug: 'first_name',
            type: FieldType.Text,
            required: true,
            placeholder: __('First Name', 'webba-booking-lite'),
            width: 'half-width',
        },
        {
            disabled: true,
            collapsed: true,
        }
    ),
    getBuilderGroup(
        {
            slug: 'last_name',
            type: FieldType.Text,
            required: false,
            placeholder: __('Last Name', 'webba-booking-lite'),
            width: 'half-width',
        },
        {
            disabled: false,
            collapsed: true,
        }
    ),
    getBuilderGroup(
        {
            slug: 'email',
            type: FieldType.Email,
            required: true,
            placeholder: __('Email address', 'webba-booking-lite'),
            width: 'half-width',
        },
        {
            disabled: true,
            collapsed: true,
        }
    ),
    getBuilderGroup(
        {
            slug: 'phone',
            type: FieldType.Phone,
            required: false,
            placeholder: __('Phone number', 'webba-booking-lite'),
            width: 'half-width',
        },
        {
            disabled: false,
            collapsed: true,
        }
    ),
]

export const FormBuilder = ({
    onSave,
    initialState,
    buttonTitle,
}: FormBuilderProps) => {
    const nameField = useField({
        defaultValue: initialState?.name || '',
        validators: [Validators.required],
        validateOnInit: true,
    })

    const fields = useFieldGroupArray(
        initialState
            ? initialState.fields.map((config) =>
                  getBuilderGroup(config, {
                      collapsed: true,
                      disabled: ['first_name', 'email'].includes(config.slug),
                  })
              )
            : initGroupArrayConfig
    )
    const [fieldOrder, setFieldOrder] = useState<number[]>([])
    const sidebar = useSidebar()

    return (
        <div className="wbk_formBuilder">
            <div className="wbk_formBuilder__formHeader">
                <div className="wbk_formBuilder__formHeaderTitle">
                    {__('Booking Form', 'webba-booking-lite')}
                </div>
                <button
                    type="button"
                    onClick={sidebar.close}
                    className="wbk_formBuilder__closeBtn"
                >
                    <img src={closeIcon2} />
                </button>
            </div>
            <form className="wbk_formBuilder__form" id={containerId}>
                <div className="wbk_formBuilder__formBody">
                    <div>
                        <Input
                            value={nameField.value}
                            onChange={nameField.setValue}
                            label={__(
                                'Add booking form name (for internal use only)',
                                'webba-booking-lite'
                            )}
                            type="text"
                            errors={nameField.errors}
                        />
                    </div>
                    <ul className="wbk_formBuilder__list">
                        <GroupProvider groups={fields}>
                            <SortableList
                                onChange={(items) => {
                                    setFieldOrder(items.map((item) => item.id))
                                }}
                                sortableConfig={{
                                    modifiers: [
                                        RestrictToVerticalAxis,
                                        RestrictToElement.configure({
                                            element:
                                                document.getElementById(
                                                    containerId
                                                ),
                                        }),
                                    ],
                                }}
                                items={fields.state}
                                renderItem={({ item, ref }) => (
                                    <li ref={ref} key={item.id}>
                                        <Field
                                            groupId={item.id}
                                            onDelete={() => {
                                                fields.remove(item.id)
                                            }}
                                        />
                                    </li>
                                )}
                            />
                        </GroupProvider>
                    </ul>
                    <Button
                        onClick={() => {
                            fields.push(getBuilderGroup())
                        }}
                        type="secondary"
                    >
                        {__('Add custom field', 'webba-booking-lite')}
                    </Button>
                </div>
                <div className="wbk_formBuilder__formFooter">
                    <Button
                        onClick={() => {
                            const reorderedGroups = reorder(
                                fields.state,
                                fieldOrder
                            )

                            if (
                                !getGroupArrayValid(reorderedGroups) ||
                                !!nameField.errors.length
                            ) {
                                return
                            }

                            onSave({
                                name: nameField.value,
                                fields: getGroupArrayValue(reorderedGroups),
                            })

                            sidebar.close()
                        }}
                    >
                        {buttonTitle}
                    </Button>
                </div>
            </form>
        </div>
    )
}
