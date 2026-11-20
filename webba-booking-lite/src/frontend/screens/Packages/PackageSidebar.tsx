import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import ChevronLeftIcon from '../../../../public/images/chevron-left-icon.svg'
import { ReactComponent as CloseIcon } from '../../../../public/images/icon-close.svg'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { useWording } from '../../hooks/useWording'
import { usePackagePurchase } from './PackagePurchaseContext'
import '../../components/Sidebar/Sidebar.scss'

type PackageSidebarProps = {
    toggle: boolean
    onToggle: (open: boolean) => void
}

export const PackageSidebar = ({ toggle, onToggle }: PackageSidebarProps) => {
    const wording = useWording()
    const { preset } = useBookingContext()
    const { selectedProduct } = usePackagePurchase()
    const isNarrowForm = preset?.settings?.narrow_form === true
    const hidePrices = preset?.settings?.show_prices === false

    return (
        <div
            className={classNames('wbk_sidebar__wrapper', {
                'wbk_sidebar__wrapper--open': toggle,
                'wbk_sidebar__wrapper--hidden': !toggle,
            })}
        >
            <div
                className={classNames('wbk_sidebar__toggle-button', {
                    'wbk_sidebar__toggle-button--open': toggle,
                    'wbk_sidebar__toggle-button--hidden': !toggle,
                    'wbk_sidebar__toggle-button--narrow': isNarrowForm,
                })}
                onClick={() => onToggle(!toggle)}
            >
                <img src={ChevronLeftIcon} alt="" />
            </div>
            <div
                className={classNames('wbk_sidebar__inner-wrapper', {
                    'wbk_sidebar__inner-wrapper--open': toggle,
                    'wbk_sidebar__inner-wrapper--hidden': !toggle,
                })}
            >
                <button
                    type="button"
                    className="wbk_sidebar__mobile-close-button"
                    onClick={() => onToggle(false)}
                    aria-label={__('Close', 'webba-booking-lite')}
                >
                    <CloseIcon />
                </button>
                <h3 className="wbk_sidebar__title">
                    {wording?.summary || __('Summary', 'webba-booking-lite')}
                </h3>

                {!selectedProduct && (
                    <p className="wbk_sidebar__empty">
                        {__(
                            'Select a package to see the summary.',
                            'webba-booking-lite'
                        )}
                    </p>
                )}

                {selectedProduct && (
                    <>
                        <div className="wbk_sidebar__items">
                            <div className="wbk_sidebar__items__inner">
                                <div className="wbk_sidebar__items__item wbk_sidebar__items__item--vertical">
                                    <div className="wbk_sidebar__items__item__inner">
                                        <div className="wbk_sidebar__items__item__info">
                                            <div className="wbk_sidebar__items__item__title">
                                                {selectedProduct.name}
                                            </div>
                                            {!hidePrices && (
                                                <div className="wbk_sidebar__items__item__price">
                                                    {
                                                        selectedProduct.price_formatted
                                                    }
                                                </div>
                                            )}
                                        </div>
                                        <div className="wbk_sidebar__items__item__meta">
                                            <div className="wbk_sidebar__items__item__meta-row">
                                                <span className="wbk_sidebar__items__item__meta-label">
                                                    {selectedProduct.visit_count}{' '}
                                                    {__(
                                                        'visits',
                                                        'webba-booking-lite'
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {!hidePrices && (
                            <div className="wbk_sidebar__items wbk_sidebar__items--less-gap">
                                <div className="wbk_sidebar__items__item">
                                    <div className="wbk_sidebar__items__item__title">
                                        {wording?.total ||
                                            __(
                                                'Total',
                                                'webba-booking-lite'
                                            )}
                                    </div>
                                    <div className="wbk_sidebar__items__item__price">
                                        {selectedProduct.price_formatted}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
