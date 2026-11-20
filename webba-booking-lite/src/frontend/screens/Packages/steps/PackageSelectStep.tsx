import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { CustomScroll } from 'react-custom-scroll'
import { Button } from '../../../components/Button/Button'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { ReactComponent as CheckIcon } from '../../../../../public/images/icon-checkmark.svg'
import { useWording } from '../../../hooks/useWording'
import { usePackagePurchase } from '../PackagePurchaseContext'
import '../../BookingForm/steps/Steps.scss'
import '../../../components/Services/Services.scss'

export const PackageSelectStep = () => {
    const { products, selectedProductId, selectProduct } = usePackagePurchase()
    const { disableCustomScroll, preset } = useBookingContext()
    const wording = useWording()
    const hidePrices = preset?.settings?.show_prices === false

    const content = (
        <div className="wbk_step__services-step">
            <div className="wbk_services_wrapper">
                {products.length === 0 && (
                    <p>
                        {__(
                            'No packages are available for purchase.',
                            'webba-booking-lite'
                        )}
                    </p>
                )}
                {products.map((product) => {
                    const selected = selectedProductId === product.id
                    return (
                        <div
                            key={product.id}
                            className={classNames('wbk_service_item', {
                                'wbk_service_item--selected': selected,
                            })}
                            onClick={() =>
                                selectProduct(selected ? null : product.id)
                            }
                        >
                            <div className="wbk_service_item__top-part">
                                <div className="wbk_service_item__content-wrapper">
                                    <div className="wbk_service_item__heading-wrapper">
                                        <div className="wbk_service_item__heading-content">
                                            <h3>{product.name}</h3>
                                            <p className="wbk_service_item__heading-wrapper__duration">
                                                <span>
                                                    {product.visit_count}{' '}
                                                    {__(
                                                        'visits',
                                                        'webba-booking-lite'
                                                    )}
                                                </span>
                                            </p>
                                        </div>
                                        {!hidePrices && (
                                            <div className="wbk_service_item__heading-wrapper__price-row">
                                                <div className="wbk_service_item__heading-wrapper__price">
                                                    <span>
                                                        {product.price_formatted}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {product.description ? (
                                        <p
                                            className="wbk_service_item__description"
                                            dangerouslySetInnerHTML={{
                                                __html: product.description,
                                            }}
                                        />
                                    ) : null}
                                    {(product.min_interval_days > 0 ||
                                        product.max_visits_per_week > 0 ||
                                        product.max_visits_per_month > 0 ||
                                        product.max_visits_per_day > 0) && (
                                        <p className="wbk_service_item__description">
                                            {product.min_interval_days > 0 && (
                                                <span>
                                                    {__(
                                                        'Min days between visits:',
                                                        'webba-booking-lite'
                                                    )}{' '}
                                                    {product.min_interval_days}
                                                    {' · '}
                                                </span>
                                            )}
                                            {product.max_visits_per_week >
                                                0 && (
                                                <span>
                                                    {__(
                                                        'Max / week:',
                                                        'webba-booking-lite'
                                                    )}{' '}
                                                    {
                                                        product.max_visits_per_week
                                                    }
                                                    {' · '}
                                                </span>
                                            )}
                                            {product.max_visits_per_month >
                                                0 && (
                                                <span>
                                                    {__(
                                                        'Max / month:',
                                                        'webba-booking-lite'
                                                    )}{' '}
                                                    {
                                                        product.max_visits_per_month
                                                    }
                                                </span>
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                classes={classNames(
                                    'wbk_service_item__mobile-select-button',
                                    {
                                        'wbk_service_item__mobile-select-button--selected':
                                            selected,
                                    }
                                )}
                                type="custom"
                                svgIcon={selected && (CheckIcon as any)}
                            >
                                {selected
                                    ? wording.selected ||
                                      __('Selected', 'webba-booking-lite')
                                    : wording.select ||
                                      __('+ Select', 'webba-booking-lite')}
                            </Button>
                        </div>
                    )
                })}
            </div>
        </div>
    )

    return disableCustomScroll ? (
        <div className="wbk_step__native-scroll-wrapper">{content}</div>
    ) : (
        <CustomScroll
            flex="1"
            className="wbk_step__scroll-wrapper"
            allowOuterScroll={true}
        >
            {content}
        </CustomScroll>
    )
}
