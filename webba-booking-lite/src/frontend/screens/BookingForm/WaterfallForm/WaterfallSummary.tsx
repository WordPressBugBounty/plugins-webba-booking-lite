import { useState } from 'react'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { wbkFormatPrice } from '../../../providers/BookingFormProvider/utils'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { useBookingSummaryTotal } from '../../../hooks/useBookingSummaryTotal'
import { getSelectedStaffLabel } from '../../../components/StaffSelector/utils'
import { IStaffOption } from '../../../components/StaffSelector/types'
import { ReactComponent as ArrowDownIcon } from '../../../../../public/images/arrow-down.svg'

export const WaterfallSummary = () => {
    const {
        sortedItems,
        totalFormatted,
        displayTax,
        depositTotal,
        hasSummaryAmounts,
        hideAllPrices,
        amountData,
        priceFormat,
        wording,
    } = useBookingSummaryTotal()
    const { formData, preset } = useBookingContext()
    const [showDetails, setShowDetails] = useState(false)
    const staffMembers = preset?.staff_members as IStaffOption[] | undefined
    const formStaff =
        typeof formData?.staff === 'object' && formData.staff !== null
            ? (formData.staff as Record<string, string | null>)
            : undefined
    const anyAvailableLabel =
        wording.any_available ||
        __('Any available', 'webba-booking-lite')

    if (!sortedItems.length) {
        return null
    }

    return (
        <div className="wbk_waterfall_form__summary">
            <div className="wbk_waterfall_form__summary-header">
                <h3 className="wbk_waterfall_form__summary-title">
                    {wording.summary || __('Summary', 'webba-booking-lite')}
                </h3>
            </div>
            <ul className="wbk_waterfall_form__summary-items">
                {sortedItems.map((item: any) => {
                    const staffLabel = getSelectedStaffLabel({
                        staffMembers,
                        serviceId: item.id,
                        places: item.places,
                        staffId: item.staffId,
                        formStaff,
                        anyAvailableLabel,
                    })

                    return (
                        <li
                            key={item.id}
                            className="wbk_waterfall_form__summary-item"
                        >
                            <span className="wbk_waterfall_form__summary-item-label">
                                {item.label}
                            </span>
                            {staffLabel && (
                                <span className="wbk_waterfall_form__summary-item-staff">
                                    {staffLabel}
                                </span>
                            )}
                        </li>
                    )
                })}
            </ul>
            {!hideAllPrices && (
                <>
                    <div className="wbk_waterfall_form__summary-total">
                        <span>
                            {wording.total || __('Total', 'webba-booking-lite')}
                        </span>
                        <strong>{totalFormatted}</strong>
                    </div>
                    <p className="wbk_waterfall_form__summary-subline">
                        {wording.tax_included ||
                            __('Tax incl.', 'webba-booking-lite')}
                    </p>
                    {hasSummaryAmounts && (
                        <div className="wbk_waterfall_form__summary-toggle">
                            <button
                                type="button"
                                className="wbk_waterfall_form__summary-toggle-btn"
                                onClick={() => setShowDetails((open) => !open)}
                            >
                                <span>
                                    {showDetails
                                        ? wording.hide_summary ||
                                          __('Hide summary', 'webba-booking-lite')
                                        : wording.show_summary ||
                                          __('Show summary', 'webba-booking-lite')}
                                </span>
                                <ArrowDownIcon
                                    className={classNames(
                                        'wbk_waterfall_form__summary-toggle-icon',
                                        {
                                            'wbk_waterfall_form__summary-toggle-icon--expanded':
                                                showDetails,
                                        }
                                    )}
                                />
                            </button>
                            {showDetails && (
                                <div className="wbk_waterfall_form__summary-detail">
                                    <div className="wbk_waterfall_form__summary-row">
                                        <span>
                                            {wording.total_booked_items ||
                                                __(
                                                    'Total booked items',
                                                    'webba-booking-lite'
                                                )}
                                            :
                                        </span>
                                        <span>
                                            {wbkFormatPrice(
                                                Number(amountData?.subtotal || 0),
                                                priceFormat
                                            )}
                                        </span>
                                    </div>
                                    {Number(amountData?.service_fees) > 0 && (
                                        <div className="wbk_waterfall_form__summary-row">
                                            <span>
                                                {wording.service_fees ||
                                                    __(
                                                        'Service fees',
                                                        'webba-booking-lite'
                                                    )}
                                                :
                                            </span>
                                            <span>
                                                {wbkFormatPrice(
                                                    Number(amountData.service_fees),
                                                    priceFormat
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {displayTax > 0 && (
                                        <div className="wbk_waterfall_form__summary-row">
                                            <span>
                                                {wording.tax ||
                                                    __(
                                                        'Sales tax',
                                                        'webba-booking-lite'
                                                    )}
                                                :
                                            </span>
                                            <span>
                                                {wbkFormatPrice(
                                                    displayTax,
                                                    priceFormat
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="wbk_waterfall_form__summary-row wbk_waterfall_form__summary-row--total">
                                        <span>
                                            <strong>
                                                {wording.grand_total ||
                                                    __(
                                                        'Grand total',
                                                        'webba-booking-lite'
                                                    )}
                                                :
                                            </strong>
                                        </span>
                                        <span>
                                            <strong>
                                                {wbkFormatPrice(
                                                    Number(amountData?.total || 0),
                                                    priceFormat
                                                )}
                                            </strong>
                                        </span>
                                    </div>
                                    {depositTotal > 0 && (
                                        <div className="wbk_waterfall_form__summary-row">
                                            <span>
                                                {wording.deposits ||
                                                    __(
                                                        'Deposits',
                                                        'webba-booking-lite'
                                                    )}
                                                :
                                            </span>
                                            <span>
                                                {wbkFormatPrice(
                                                    depositTotal,
                                                    priceFormat
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {Number(amountData?.left_to_pay) > 0 && (
                                        <div className="wbk_waterfall_form__summary-row">
                                            <span>
                                                {wording.left_to_pay_later ||
                                                    __(
                                                        'Left to pay later',
                                                        'webba-booking-lite'
                                                    )}
                                                :
                                            </span>
                                            <span>
                                                {wbkFormatPrice(
                                                    Number(amountData.left_to_pay),
                                                    priceFormat
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
