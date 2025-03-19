import {
    PanelBody,
    PanelRow,
    RadioControl,
    CheckboxControl,
} from '@wordpress/components'
import { useBlockProps, InspectorControls } from '@wordpress/block-editor'
import { useState, useEffect } from '@wordpress/element'
import '../assets/frontend.scss'
import { __ } from '@wordpress/i18n'
import apiFetch from '@wordpress/api-fetch'
import StatusBar from './components/statusbar.js'
import ServiceBlock from './components/serviceblock.js'
import WbkSelect from './components/wbkselect.js'
import WbkText from './components/wbktext.js'
import store from './store/index.js'
import { useDispatch, useSelect } from '@wordpress/data'
import { SelectControl } from '@wordpress/components'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps()

    const data = useSelect((select) => {
        const store = select('webba_booking/assets_store')
        return store.getData()
    }, [])

    let is_single_service = attributes.singleOrMulripleService == 'single'
    let steps = []
    let filtered_services
    if (data.services) {
        if (attributes.singleOrMulripleService == 'multiple') {
            steps.push(__('Services', 'webba-booking-lite'))
        }
        steps.push(__('Date & time', 'webba-booking-lite'))
        steps.push(__('Details', 'webba-booking-lite'))
        filtered_services = data.services
        if (attributes.categoryId > 0 && !attributes.showCategoryList) {
            filtered_services = []
            let services_in_category = data.categories.find(
                (item) => item.value == attributes.categoryId
            ).services
            services_in_category.forEach((item) => {
                filtered_services.push(
                    data.services.find(
                        (item_service) => item_service.value == item
                    )
                )
            })
        }
    }

    const onChangeSingleOrMulripleService = (newValue) => {
        setAttributes({ singleOrMulripleService: newValue })
    }
    const onChangeMultipleServices = (newValue) => {
        setAttributes({ multipleServices: newValue })
    }
    const onChangeShowCategoryList = (newValue) => {
        setAttributes({ showCategoryList: newValue })
    }
    const onChangeServiceId = (newValue) => {
        setAttributes({ serviceId: Number(newValue) })
    }
    const onChangeCategoryId = (newValue) => {
        setAttributes({ categoryId: Number(newValue) })
    }

    const [selectedServices, setSelectedServices] = useState(null)

    const handleServiceSelect = () => {}

    return (
        <div {...useBlockProps()}>
            <InspectorControls>
                {data.services && (
                    <PanelBody title={__('Settings', 'webba-booking-lite')}>
                        <RadioControl
                            label={__(
                                __(
                                    'Single or multiple services',
                                    'webba-booking-lite'
                                )
                            )}
                            help={__(
                                'If "Multiple" is chosen, the booking form will show all the services you have created in the Webba Booking admin panel. If you want to show services from a single category only, please use "Select category" option below.',
                                'webba-booking-lite'
                            )}
                            selected={attributes.singleOrMulripleService}
                            options={[
                                {
                                    label: __('Single', 'webba-booking-lite'),
                                    value: 'single',
                                },
                                {
                                    label: __('Multiple', 'webba-booking-lite'),
                                    value: 'multiple',
                                },
                            ]}
                            onChange={onChangeSingleOrMulripleService}
                        />
                        {is_single_service ? (
                            <>
                                <SelectControl
                                    label={__(
                                        'Select service',
                                        'webba-booking-lite'
                                    )}
                                    help={__(
                                        'Select a service for this booking form.',
                                        'webba-booking-lite'
                                    )}
                                    value={attributes.serviceId}
                                    options={[
                                        { value: 0, label: __('Select') },
                                        ...data.services,
                                    ]}
                                    onChange={onChangeServiceId}
                                />
                            </>
                        ) : (
                            <>
                                <CheckboxControl
                                    label={__(
                                        'Allow selection of multiple services',
                                        'webba-booking-lite'
                                    )}
                                    help={__(
                                        'If enabled, the customer can book more than one service at one booking session.',
                                        'webba-booking-lite'
                                    )}
                                    checked={attributes.multipleServices}
                                    onChange={onChangeMultipleServices}
                                />
                                <CheckboxControl
                                    label={__(
                                        'Show category list in the form',
                                        'webba-booking-lite'
                                    )}
                                    help={__(
                                        'If enabled, the customer will have to choose a service category before choosing the service.',
                                        'webba-booking-lite'
                                    )}
                                    checked={attributes.showCategoryList}
                                    onChange={onChangeShowCategoryList}
                                />
                                {!attributes.showCategoryList && (
                                    <SelectControl
                                        label={__(
                                            'Select category',
                                            'webba-booking-lite'
                                        )}
                                        help={__(
                                            'Select the category of services to display. If not set, all services will be shown.',
                                            'webba-booking-lite'
                                        )}
                                        value={attributes.categoryId}
                                        options={[
                                            { value: 0, label: __('Select') },
                                            ...data.categories,
                                        ]}
                                        onChange={onChangeCategoryId}
                                    />
                                )}
                            </>
                        )}
                    </PanelBody>
                )}
            </InspectorControls>
            <div className="main-block-w">
                {data.services ? (
                    <div
                        className={
                            data.settings.narrow_form
                                ? 'appointment-box-w narrow-form-w'
                                : 'appointment-box-w'
                        }
                    >
                        <div
                            className="appointment-status-wrapper-w"
                            style={{ background: data.appearance[0] }}
                        >
                            <>
                                <StatusBar steps={steps} />
                                <div className="circle-chart-wb">
                                    <span
                                        style={{
                                            background: data.appearance[0],
                                        }}
                                        className="circle-chart-text-wb"
                                    >
                                        1{' '}
                                        {__('of', 'webba-booking-lite') +
                                            ' ' +
                                            steps.length}
                                    </span>
                                </div>
                                <div className="appointment-status-text-mobile-wb">
                                    <p className="current-step-w">Services</p>
                                    <p className="next-step-w">
                                        Next
                                        <span className="btn-ring-w"></span>:
                                        Date and time
                                    </p>
                                </div>
                            </>
                        </div>

                        <div className="appointment-content-w">
                            <div className="appointment-content-scroll-w">
                                {data.services &&
                                    (is_single_service ? (
                                        <>
                                            <WbkText
                                                value=""
                                                name={'date'}
                                                placeholder={
                                                    data.wording
                                                        .date_placeholder
                                                }
                                                label={data.wording.date_label}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            {attributes.showCategoryList && (
                                                <WbkSelect
                                                    options={data.categories}
                                                    label={
                                                        data.wording
                                                            .category_label
                                                    }
                                                />
                                            )}
                                            <label className="input-label-w service-label-w">
                                                {data.wording.service_label}
                                            </label>
                                            <ul className="wbk_v5_service_list">
                                                {filtered_services.map(
                                                    (value, index) => (
                                                        <ServiceBlock
                                                            data={value}
                                                            selected={
                                                                selectedServices
                                                            }
                                                            onChange={
                                                                handleServiceSelect
                                                            }
                                                            type={
                                                                attributes.multipleServices
                                                            }
                                                            environment={data}
                                                            key={index}
                                                        />
                                                    )
                                                )}
                                            </ul>
                                        </>
                                    ))}{' '}
                            </div>
                            <div className="button-block-w two-buttons-w">
                                <button
                                    type="button"
                                    className="button-w button-prev-w"
                                    style={{ background: data.appearance[1] }}
                                >
                                    {__('Back', 'webba-booking-lite')}
                                </button>
                                <div className="button-container-w">
                                    <button
                                        className="button-w button-next-w"
                                        style={{
                                            background: data.appearance[1],
                                        }}
                                    >
                                        {__('Next', 'webba-booking-lite')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="appointment-box-w loading-holder-w">
                        <Skeleton count={5} height={30} />
                    </div>
                )}
            </div>
        </div>
    )
}
