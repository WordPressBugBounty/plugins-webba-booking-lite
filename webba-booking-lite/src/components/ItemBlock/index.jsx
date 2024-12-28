import React from 'react'
import { useState } from '@wordpress/element'
import { store_name } from '../../store/frontend'
import { select } from '@wordpress/data'

export default function ItemBlock({
    data,
    selected,
    onChange,
    type,

    handleAction,
}) {
    const [actionState, setActionState] = useState('')

    const handleCancelAction = (event, action, id) => {
        event.preventDefault()
        setActionState('confirmCancel')
    }

    const handleCancelConfirmAction = async (event, action, id) => {
        event.preventDefault()
        setActionState('loading')
        await handleAction(event, 'cancel', data.id)
    }

    const wording = select(store_name).getPreset().wording

    let className = 'item-wbk timeslot-animation-wbk'
    let fieldName = ''
    let title = '-'
    let showActions = true

    switch (type) {
        case 'booking':
            fieldName = 'wbk_booking'
            title = data.service_name
            break
        case 'past-booking':
            fieldName = 'wbk_booking'
            title = data.service_name
            showActions = false
            break
        case 'service':
            fieldName = 'wbk_service_id'
            break
        case 'extras':
            fieldName = 'wbk_extras'
            break
    }
    const [showDescription, setShowDescription] = useState(false)

    return (
        <li className={className}>
            <label>
                <span className={'item-title-wbk'}>{title}</span>
                {data.date && (
                    <>
                        <span className="item-block-sub-title-wbk clock-icon-wbk item-wbk icon-wbk clock-grey-icon-wbk">
                            {data.date + ' ' + data.time_formated}
                        </span>
                    </>
                )}
                {data.price && (
                    <>
                        <span className="item-block-sub-title-wbk clock-icon-wbk item-wbk icon-wbk money-grey-icon-wbk">
                            {data.price}
                        </span>
                    </>
                )}
                <input
                    type="checkbox"
                    className="hidden-wbk"
                    value={data.id}
                    onChange={onChange}
                ></input>
                {showActions && (
                    <div class="item-block-controls-wbk">
                        <a
                            href="#"
                            onClick={(event) =>
                                handleAction(
                                    event,
                                    'reschedule',
                                    data.id,
                                    data.service_id
                                )
                            }
                        >
                            {wording.reschedule}
                        </a>

                        {actionState === 'confirmCancel' ? (
                            <a
                                className="color-red-wbk"
                                onClick={(event) =>
                                    handleCancelConfirmAction(event, data.id)
                                }
                                href="#"
                            >
                                {wording.confirm_cancel}
                            </a>
                        ) : actionState === 'loading' ? (
                            <span className="loading-small-horizontal-wbk"></span>
                        ) : (
                            <a
                                className="color-red-wbk"
                                onClick={(event) => handleCancelAction(event)}
                                href="#"
                            >
                                {wording.cancel}
                            </a>
                        )}
                    </div>
                )}
            </label>
        </li>
    )
}
