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
import {
    SelectControl,
    FormTokenField,
    BaseControl,
} from '@wordpress/components'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { BookingFormProvider } from '../frontend/providers/BookingFormProvider/BookingFormProvider.tsx'
import { BookingForm } from '../frontend/screens/BookingForm/BookingForm.tsx'
import { store_name } from '../store/frontend/index.ts'

export default function Edit({ attributes, setAttributes }) {
    const { serviceId, categoryId, singleOrMulripleService, locationIds } = attributes

    const data = useSelect(
        (select) => select(store_name).getPreset(),
        [store_name]
    )

    let is_single_service = attributes.singleOrMulripleService == 'single'
    let steps = []
    let filtered_services

    // if (data.services) {
    //     if (attributes.singleOrMulripleService == 'multiple') {
    //         steps.push(__('Services', 'webba-booking-lite'))
    //     }
    //     steps.push(__('Date & time', 'webba-booking-lite'))
    //     steps.push(__('Details', 'webba-booking-lite'))
    //     filtered_services = data.services
    //     if (attributes.categoryId > 0 && !attributes.showCategoryList) {
    //         filtered_services = []
    //         let services_in_category = data.categories.find(
    //             (item) => item.value == attributes.categoryId
    //         ).services
    //         services_in_category.forEach((item) => {
    //             filtered_services.push(
    //                 data.services.find(
    //                     (item_service) => item_service.value == item
    //                 )
    //             )
    //         })
    //     }
    // }

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

    const locationSuggestions = (data.locations || []).map((loc) => loc.label)
    const locationTokens = (locationIds || [])
        .map((id) => {
            const loc = (data.locations || []).find(
                (l) =>
                    String(l.id) === String(id) ||
                    String(l.value) === String(id)
            )
            return loc ? loc.label : null
        })
        .filter(Boolean)
    const onLocationTokensChange = (newTokens) => {
        const ids = newTokens
            .map((label) => {
                const loc = (data.locations || []).find(
                    (l) => l.label === label
                )
                return loc ? String(loc.id || loc.value) : null
            })
            .filter(Boolean)
        setAttributes({ locationIds: ids })
    }

    const [selectedServices, setSelectedServices] = useState(null)

    const handleServiceSelect = () => { }



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
                                            ...(data.categories || []).map((category) => ({ label: category.name, value: category.id })),
                                        ]}
                                        onChange={onChangeCategoryId}
                                    />
                                )}
                                {data.locations &&
                                    data.locations.length > 0 && (
                                        <BaseControl
                                            label={__(
                                                'Select locations',
                                                'webba-booking-lite'
                                            )}
                                            help={__(
                                                'Choose one or more locations to show in the form. Leave empty to show all.',
                                                'webba-booking-lite'
                                            )}
                                        >
                                            <div className="wbk-block-location-token-field">
                                                <FormTokenField
                                                    value={locationTokens}
                                                    suggestions={
                                                        locationSuggestions
                                                    }
                                                    onChange={
                                                        onLocationTokensChange
                                                    }
                                                    placeholder={__(
                                                        'Type or select locations…',
                                                        'webba-booking-lite'
                                                    )}
                                                    __experimentalExpandOnFocus
                                                />
                                            </div>
                                        </BaseControl>
                                    )}
                            </>
                        )}
                    </PanelBody>
                )}
            </InspectorControls>
            <div className="main-block-w">
                <div className="main-block-w-inner">
                    <div>Webba booking form</div>
                    {/* <BookingFormProvider key={JSON.stringify({ serviceId, categoryId, singleOrMulripleService })} attrService={serviceId > 0 && singleOrMulripleService === 'single' && serviceId || '0'} attrCategory={categoryId > 0 && singleOrMulripleService === 'multiple' && categoryId || '0'}>
                        <BookingForm />
                    </BookingFormProvider> */}
                </div>
            </div>
        </div>
    )
}
