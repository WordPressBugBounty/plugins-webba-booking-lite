import Select from 'react-select'
import { __ } from '@wordpress/i18n'
import { IShortcodeAttributeFieldsProps, TShortcodeOption, TShortcodeServiceType } from './types'
import { getAdminSelectStyles } from '../../utils/adminSelectStyles'
import './ShortcodeAttributeFields.scss'

const selectStyles = getAdminSelectStyles({
    control: (base: Record<string, unknown>) => ({
        ...base,
        minHeight: 40,
        borderRadius: 8,
    }),
})

export const ShortcodeAttributeFields = ({
    filters,
}: IShortcodeAttributeFieldsProps) => {
    const {
        serviceType,
        serviceId,
        categoryIds,
        locationIds,
        staffIds,
        isDailyServiceType,
        serviceTypeOptions,
        serviceOptions,
        categoryOptions,
        locationOptions,
        staffOptions,
        setServiceId,
        setCategoryIds,
        setLocationIds,
        setStaffIds,
        handleServiceTypeChange,
    } = filters

    const menuPortalTarget =
        typeof document !== 'undefined' ? document.body : null

    return (
        <div className="wbk_shortcode_attribute_fields">
            <div className="wbk_shortcode_attribute_fields__field">
                <label>{__('Service type', 'webba-booking-lite')}</label>
                <Select
                    classNamePrefix="wbk_select"
                    styles={selectStyles}
                    options={serviceTypeOptions}
                    value={
                        serviceTypeOptions.find(
                            (option) => option.value === serviceType
                        ) || serviceTypeOptions[0]
                    }
                    onChange={(opt: TShortcodeOption | null) =>
                        handleServiceTypeChange(
                            (opt?.value as TShortcodeServiceType) || 'hourly'
                        )
                    }
                    isClearable={false}
                    menuPortalTarget={menuPortalTarget}
                />
            </div>

            <div className="wbk_shortcode_attribute_fields__field">
                <label>
                    {isDailyServiceType
                        ? __('Daily service', 'webba-booking-lite')
                        : __('Service', 'webba-booking-lite')}
                </label>
                <Select
                    classNamePrefix="wbk_select"
                    styles={selectStyles}
                    placeholder={
                        isDailyServiceType
                            ? __(
                                  'Select daily service...',
                                  'webba-booking-lite'
                              )
                            : __('Select Service...', 'webba-booking-lite')
                    }
                    options={serviceOptions}
                    value={
                        serviceId
                            ? serviceOptions.find(
                                  (o) => o.value === serviceId
                              ) || null
                            : null
                    }
                    onChange={(opt: TShortcodeOption | null) =>
                        setServiceId(opt?.value ?? null)
                    }
                    isClearable={true}
                    menuPortalTarget={menuPortalTarget}
                />
            </div>

            <div className="wbk_shortcode_attribute_fields__field">
                <label>{__('Categories', 'webba-booking-lite')}</label>
                <Select
                    isMulti
                    classNamePrefix="wbk_select"
                    styles={selectStyles}
                    placeholder={__(
                        'Select Categories...',
                        'webba-booking-lite'
                    )}
                    options={categoryOptions}
                    value={categoryOptions.filter((o) =>
                        categoryIds.includes(o.value)
                    )}
                    onChange={(opts: readonly TShortcodeOption[]) =>
                        setCategoryIds(opts.map((o) => o.value))
                    }
                    menuPortalTarget={menuPortalTarget}
                />
            </div>

            <div className="wbk_shortcode_attribute_fields__field">
                <label>{__('Locations', 'webba-booking-lite')}</label>
                <Select
                    isMulti
                    classNamePrefix="wbk_select"
                    styles={selectStyles}
                    placeholder={__(
                        'Select Locations...',
                        'webba-booking-lite'
                    )}
                    options={locationOptions}
                    value={locationOptions.filter((o) =>
                        locationIds.includes(o.value)
                    )}
                    onChange={(opts: readonly TShortcodeOption[]) =>
                        setLocationIds(opts.map((o) => o.value))
                    }
                    menuPortalTarget={menuPortalTarget}
                />
            </div>

            {!isDailyServiceType && (
                <div className="wbk_shortcode_attribute_fields__field">
                    <label>{__('Staff', 'webba-booking-lite')}</label>
                    <Select
                        isMulti
                        classNamePrefix="wbk_select"
                        styles={selectStyles}
                        placeholder={__('Select Staff...', 'webba-booking-lite')}
                        options={staffOptions}
                        value={staffOptions.filter((o) =>
                            staffIds.includes(o.value)
                        )}
                        onChange={(opts: readonly TShortcodeOption[]) =>
                            setStaffIds(opts.map((o) => o.value))
                        }
                        menuPortalTarget={menuPortalTarget}
                    />
                </div>
            )}
        </div>
    )
}
