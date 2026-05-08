(function () {
    var metadata = window.wbkDivi5ModuleMetadata || null
    var pickerData = metadata && metadata.wbkPickerData ? metadata.wbkPickerData : null
    var appearanceDefaults = metadata && metadata.wbkAppearanceDefaults ? metadata.wbkAppearanceDefaults : {}
    var advancedAppearanceLocked = !!(
        metadata &&
        metadata.wbkAdvancedAppearanceLocked
    )
    var upgradeUrl =
        (metadata && metadata.wbkUpgradeUrl) || '/wp-admin/admin.php?page=wbk-main-pricing'
    var upgradeMessage =
        (metadata && metadata.wbkUpgradeMessage) || 'Available in PLUS'
    var registrationKey = '__wbkDivi5ModuleRegistered'
    var hookAttachedKey = '__wbkDivi5ModuleHookAttached'
    var modalNode = null
    var advancedStyleKeys = [
        'button_border_radius',
        'bg_button_primary',
        'color_button_primary',
        'bg_button_primary_hover',
        'color_button_primary_hover',
        'bg_button_inactive',
        'color_button_inactive',
        'bg_button_selected',
        'color_button_selected',
        'bg_button_selected_hover',
        'color_button_selected_hover',
        'bg_button_selected_selected',
        'color_button_selected_selected',
        'bg_button_secondary',
        'color_button_secondary',
        'bg_button_secondary_hover',
        'color_button_secondary_hover',
        'bg_sidebar',
        'color_sidebar',
        'color_border_selected',
    ]
    var lockedSectionTitles = [
        'Buttons Border Radius',
        'Main Button',
        'Inactive Button',
        'Selected Button',
        'Secondary Button',
        'Sidebar Styling',
        'Selected Elements Styling',
    ]

    var getHooks = function () {
        if (window.vendor && window.vendor.wp && window.vendor.wp.hooks) {
            return window.vendor.wp.hooks
        }
        if (window.wp && window.wp.hooks) {
            return window.wp.hooks
        }
        return null
    }

    var getRegisterModule = function () {
        var moduleLibrary = window.divi && window.divi.moduleLibrary ? window.divi.moduleLibrary : null
        return moduleLibrary && moduleLibrary.registerModule ? moduleLibrary.registerModule : null
    }

    var getReact = function () {
        if (window.vendor && window.vendor.React) {
            return window.vendor.React
        }
        if (window.React) {
            return window.React
        }
        return null
    }

    var getNested = function (target, path) {
        var value = target
        for (var index = 0; index < path.length; index += 1) {
            var key = path[index]
            if (!value || typeof value !== 'object' || !(key in value)) {
                return null
            }
            value = value[key]
        }
        return value
    }

    var unwrapDiviValue = function (value) {
        if (value && typeof value === 'object') {
            if (value.desktop && typeof value.desktop === 'object' && 'value' in value.desktop) {
                return value.desktop.value
            }
            if ('value' in value) {
                return value.value
            }
        }
        return value
    }

    var normalizeIds = function (value) {
        var unwrapped = unwrapDiviValue(value)
        if (Array.isArray(unwrapped)) {
            return unwrapped
                .map(function (item) {
                    return String(item)
                })
                .filter(function (item) {
                    return item !== '0' && item !== ''
                })
        }
        if (unwrapped && typeof unwrapped === 'object') {
            return Object.keys(unwrapped).filter(function (item) {
                var selected = unwrapped[item]
                return selected === true || selected === 1 || selected === '1' || selected === 'on'
            })
        }
        if (typeof unwrapped === 'string') {
            if (unwrapped.indexOf(',') !== -1) {
                return unwrapped
                    .split(',')
                    .map(function (item) {
                        return item.trim()
                    })
                    .filter(function (item) {
                        return item !== '0' && item !== ''
                    })
            }
            return unwrapped !== '' && unwrapped !== '0' ? [unwrapped] : []
        }
        if (typeof unwrapped === 'number' && unwrapped > 0) {
            return [String(unwrapped)]
        }
        return []
    }

    var getAppearanceValue = function (attrs, key, fallback) {
        var value = unwrapDiviValue(getNested(attrs, ['content', 'advanced', key]))
        if (value === null || typeof value === 'undefined' || value === '') {
            if (Object.prototype.hasOwnProperty.call(appearanceDefaults, key)) {
                return String(appearanceDefaults[key])
            }
            return String(fallback || '')
        }
        return String(value)
    }

    var buildAppearanceStyle = function (attrs) {
        var bgAccent = getAppearanceValue(attrs, 'bg_accent', '#15B8A9')
        var bgSidebar = getAppearanceValue(attrs, 'bg_sidebar', '#f9fafb')

        return {
            '--wbk-bg-accent': bgAccent,
            '--wbk-font': getAppearanceValue(attrs, 'font', '"Ubuntu", sans-serif'),
            '--wbk-border-radius': getAppearanceValue(attrs, 'border_radius', '8px'),
            '--wbk-shadow': getAppearanceValue(attrs, 'shadow', '0px 0px 16px 0px #3f3f4629'),
            '--wbk-button-border-radius': getAppearanceValue(attrs, 'button_border_radius', '8px'),
            '--wbk-bg-button-primary': getAppearanceValue(attrs, 'bg_button_primary', '#15B8A9'),
            '--wbk-color-button-primary': getAppearanceValue(attrs, 'color_button_primary', '#ffffff'),
            '--wbk-bg-button-primary-hover': getAppearanceValue(
                attrs,
                'bg_button_primary_hover',
                '#1A5B57'
            ),
            '--wbk-color-button-primary-hover': getAppearanceValue(
                attrs,
                'color_button_primary_hover',
                '#ffffff'
            ),
            '--wbk-bg-button-inactive': getAppearanceValue(attrs, 'bg_button_inactive', '#edeff3'),
            '--wbk-color-button-inactive': getAppearanceValue(
                attrs,
                'color_button_inactive',
                '#ffffff'
            ),
            '--wbk-bg-button-selected': getAppearanceValue(attrs, 'bg_button_selected', '#15B8A9'),
            '--wbk-color-button-selected': getAppearanceValue(
                attrs,
                'color_button_selected',
                '#ffffff'
            ),
            '--wbk-bg-button-selected-hover': getAppearanceValue(
                attrs,
                'bg_button_selected_hover',
                '#1A5B57'
            ),
            '--wbk-color-button-selected-hover': getAppearanceValue(
                attrs,
                'color_button_selected_hover',
                '#ffffff'
            ),
            '--wbk-bg-button-selected-selected': getAppearanceValue(
                attrs,
                'bg_button_selected_selected',
                '#ffffff'
            ),
            '--wbk-color-button-selected-selected': getAppearanceValue(
                attrs,
                'color_button_selected_selected',
                '#22292f'
            ),
            '--wbk-bg-button-secondary': getAppearanceValue(
                attrs,
                'bg_button_secondary',
                '#edeff2'
            ),
            '--wbk-color-button-secondary': getAppearanceValue(
                attrs,
                'color_button_secondary',
                '#ffffff'
            ),
            '--wbk-bg-button-secondary-hover': getAppearanceValue(
                attrs,
                'bg_button_secondary_hover',
                '#1A5B57'
            ),
            '--wbk-color-button-secondary-hover': getAppearanceValue(
                attrs,
                'color_button_secondary_hover',
                '#ffffff'
            ),
            '--wbk-bg-sidebar': bgSidebar,
            '--wbk-color-sidebar': getAppearanceValue(attrs, 'color_sidebar', '#22292F'),
            '--wbk-color-border-selected': getAppearanceValue(
                attrs,
                'color_border_selected',
                '#15B8A9'
            ),
            '--wbk-primary-50': 'color-mix(in srgb, ' + bgAccent + ' 5%, white 95%)',
            '--wbk-primary-100': 'color-mix(in srgb, ' + bgAccent + ' 10%, white 90%)',
            '--wbk-primary-200': 'color-mix(in srgb, ' + bgAccent + ' 20%, white 80%)',
            '--wbk-primary-300': 'color-mix(in srgb, ' + bgAccent + ' 30%, white 70%)',
            '--wbk-primary-400': 'color-mix(in srgb, ' + bgAccent + ' 40%, white 60%)',
            '--wbk-primary-500': bgAccent,
            '--wbk-primary-600': 'color-mix(in srgb, ' + bgAccent + ' 88%, black 12%)',
            '--wbk-primary-700': 'color-mix(in srgb, ' + bgAccent + ' 76%, black 24%)',
            '--wbk-primary-800': 'color-mix(in srgb, ' + bgAccent + ' 64%, black 36%)',
            '--wbk-primary-900': 'color-mix(in srgb, ' + bgAccent + ' 52%, black 48%)',
            '--wbk-primary-950': 'color-mix(in srgb, ' + bgAccent + ' 44%, black 56%)',
            '--wbk-primary-text-50': '#22292F',
            '--wbk-primary-text-100': '#22292F',
            '--wbk-primary-text-200': '#22292F',
            '--wbk-primary-text-300': '#22292F',
            '--wbk-primary-text-400': '#22292F',
            '--wbk-primary-text-500': '#FFFFFF',
            '--wbk-primary-text-600': '#FFFFFF',
            '--wbk-primary-text-700': '#FFFFFF',
            '--wbk-primary-text-800': '#FFFFFF',
            '--wbk-primary-text-900': '#FFFFFF',
            '--wbk-primary-text-950': '#FFFFFF',
            '--wbk-primary-filter-500': 'none',
            '--wbk-secondary-50': 'color-mix(in srgb, ' + bgSidebar + ' 5%, white 95%)',
            '--wbk-secondary-100': 'color-mix(in srgb, ' + bgSidebar + ' 10%, white 90%)',
            '--wbk-secondary-200': 'color-mix(in srgb, ' + bgSidebar + ' 20%, white 80%)',
            '--wbk-secondary-300': 'color-mix(in srgb, ' + bgSidebar + ' 30%, white 70%)',
            '--wbk-secondary-400': 'color-mix(in srgb, ' + bgSidebar + ' 40%, white 60%)',
            '--wbk-secondary-500': bgSidebar,
            '--wbk-secondary-600': 'color-mix(in srgb, ' + bgSidebar + ' 88%, black 12%)',
            '--wbk-secondary-700': 'color-mix(in srgb, ' + bgSidebar + ' 76%, black 24%)',
            '--wbk-secondary-800': 'color-mix(in srgb, ' + bgSidebar + ' 64%, black 36%)',
            '--wbk-secondary-900': 'color-mix(in srgb, ' + bgSidebar + ' 52%, black 48%)',
            '--wbk-secondary-950': 'color-mix(in srgb, ' + bgSidebar + ' 44%, black 56%)',
            '--wbk-secondary-text-50': '#22292F',
            '--wbk-secondary-text-100': '#22292F',
            '--wbk-secondary-text-200': '#22292F',
            '--wbk-secondary-text-300': '#22292F',
            '--wbk-secondary-text-400': '#22292F',
            '--wbk-secondary-text-500': '#22292F',
            '--wbk-secondary-text-600': '#FFFFFF',
            '--wbk-secondary-text-700': '#FFFFFF',
            '--wbk-secondary-text-800': '#FFFFFF',
            '--wbk-secondary-text-900': '#FFFFFF',
            '--wbk-secondary-text-950': '#FFFFFF',
            '--wbk-secondary-filter-500': 'none',
        }
    }

    var ensureArray = function (value) {
        if (Array.isArray(value)) {
            return value
        }
        if (value === null || typeof value === 'undefined' || value === '') {
            return []
        }
        return [value]
    }

    var intersectSets = function (a, b) {
        var out = new Set()
        a.forEach(function (x) {
            if (b.has(x)) {
                out.add(x)
            }
        })
        return out
    }

    var serviceBelongsToLocation = function (service, locationId) {
        return ensureArray(service.locations).some(function (locationItem) {
            return String(locationItem) === String(locationId)
        })
    }

    var staffMatchesSelectedLocations = function (staffMember, locationIds) {
        return locationIds.some(function (locationId) {
            return ensureArray(staffMember.location).some(function (staffLocation) {
                return String(staffLocation) === String(locationId)
            })
        })
    }

    var getVisibleServiceIds = function (selection, ignore) {
        if (!pickerData) {
            return new Set()
        }
        var ids = new Set(
            ensureArray(pickerData.services).map(function (service) {
                return String(service.id)
            })
        )

        if (selection.serviceId && ignore !== 'service') {
            ids = ids.has(selection.serviceId) ? new Set([selection.serviceId]) : new Set()
        }

        if (selection.categoryIds.length > 0 && ignore !== 'category') {
            var fromCategories = new Set()
            ensureArray(pickerData.categories)
                .filter(function (category) {
                    return selection.categoryIds.indexOf(String(category.id)) !== -1
                })
                .forEach(function (category) {
                    ensureArray(category.services).forEach(function (serviceId) {
                        fromCategories.add(String(serviceId))
                    })
                })
            ids = intersectSets(ids, fromCategories)
        }

        if (selection.locationIds.length > 0 && ignore !== 'location') {
            var fromLocations = new Set()
            ensureArray(pickerData.services).forEach(function (service) {
                if (
                    selection.locationIds.some(function (locationId) {
                        return serviceBelongsToLocation(service, locationId)
                    })
                ) {
                    fromLocations.add(String(service.id))
                }
            })
            ids = intersectSets(ids, fromLocations)
        }

        if (selection.staffIds.length > 0 && ignore !== 'staff') {
            var fromStaff = new Set()
            ensureArray(pickerData.staff_members)
                .filter(function (staffMember) {
                    return selection.staffIds.indexOf(String(staffMember.id)) !== -1
                })
                .forEach(function (staffMember) {
                    ensureArray(staffMember.services).forEach(function (serviceId) {
                        fromStaff.add(String(serviceId))
                    })
                })
            ids = intersectSets(ids, fromStaff)
        }

        return ids
    }

    var getUnionLocationIdsForServices = function (serviceIds) {
        var output = new Set()
        ensureArray(pickerData.services).forEach(function (service) {
            if (!serviceIds.has(String(service.id))) {
                return
            }
            ensureArray(service.locations).forEach(function (locationId) {
                output.add(String(locationId))
            })
        })
        return output
    }

    var getAllowedLocationIdsForPicker = function (visibleServiceIds, selection) {
        var allLocationIds = new Set(
            ensureArray(pickerData.locations).map(function (location) {
                return String(location.id)
            })
        )
        var noNarrowing =
            !selection.serviceId &&
            selection.categoryIds.length === 0 &&
            selection.staffIds.length === 0

        if (noNarrowing) {
            return allLocationIds
        }

        var fromServices = getUnionLocationIdsForServices(visibleServiceIds)
        if (selection.staffIds.length > 0) {
            var selectedStaff = ensureArray(pickerData.staff_members).filter(function (staffMember) {
                return selection.staffIds.indexOf(String(staffMember.id)) !== -1
            })
            var staffLocationIntersect = new Set(allLocationIds)
            selectedStaff.forEach(function (staffMember) {
                var locations = ensureArray(staffMember.location)
                var forStaff =
                    locations.length === 0
                        ? new Set(allLocationIds)
                        : new Set(
                              locations.map(function (locationId) {
                                  return String(locationId)
                              })
                          )
                staffLocationIntersect = intersectSets(staffLocationIntersect, forStaff)
            })
            var serviceLocationsOrPreset = fromServices.size > 0 ? fromServices : allLocationIds
            return intersectSets(serviceLocationsOrPreset, staffLocationIntersect)
        }

        if (fromServices.size === 0) {
            return allLocationIds
        }
        return fromServices
    }

    var staffMatchesFilters = function (staffMember, visibleServiceIds, locationIds, selection) {
        var locationOnlyNarrowing =
            locationIds.length > 0 && !selection.serviceId && selection.categoryIds.length === 0

        if (locationOnlyNarrowing) {
            return staffMatchesSelectedLocations(staffMember, locationIds)
        }

        var servesVisible = ensureArray(staffMember.services).some(function (serviceId) {
            return visibleServiceIds.has(String(serviceId))
        })
        if (!servesVisible) {
            return false
        }
        if (locationIds.length === 0) {
            return true
        }
        return staffMatchesSelectedLocations(staffMember, locationIds)
    }

    var setServiceOptions = function (visibleServiceIds) {
        var options = {
            '0': { label: 'All Services' },
        }
        ensureArray(pickerData.services).forEach(function (service) {
            var id = String(service.id)
            if (!visibleServiceIds.has(id)) {
                return
            }
            options[id] = { label: String(service.label || '') }
        })
        metadata.attributes.content.settings.advanced.service.item.component.props.options = options
    }

    var setCategoryOptions = function (visibleForCategory) {
        var options = []
        ensureArray(pickerData.categories).forEach(function (category) {
            var id = String(category.id)
            var hasVisibleService = ensureArray(category.services).some(function (serviceId) {
                return visibleForCategory.has(String(serviceId))
            })
            if (!hasVisibleService) {
                return
            }
            options.push({
                value: id,
                label: String(category.name || '') + ' (ID: ' + id + ')',
            })
        })
        metadata.attributes.content.settings.advanced.category.item.component.props.options = options
    }

    var setLocationOptions = function (allowedLocationIds) {
        var options = []
        ensureArray(pickerData.locations).forEach(function (location) {
            var id = String(location.id)
            if (!allowedLocationIds.has(id)) {
                return
            }
            options.push({
                value: id,
                label: String(location.label || ''),
            })
        })
        metadata.attributes.content.settings.advanced.location.item.component.props.options = options
    }

    var setStaffOptions = function (visibleForStaff, selection) {
        var options = []
        ensureArray(pickerData.staff_members).forEach(function (staffMember) {
            if (
                !staffMatchesFilters(staffMember, visibleForStaff, selection.locationIds, {
                    serviceId: selection.serviceId,
                    categoryIds: selection.categoryIds,
                })
            ) {
                return
            }
            options.push({
                value: String(staffMember.id),
                label: String(staffMember.label || ''),
            })
        })
        metadata.attributes.content.settings.advanced.staff.item.component.props.options = options
    }

    var applyFilteredOptions = function (selection) {
        if (!pickerData || !metadata || !metadata.attributes || !metadata.attributes.content) {
            return
        }
        var visibleForService = getVisibleServiceIds(selection, 'service')
        var visibleForCategory = getVisibleServiceIds(selection, 'category')
        var visibleForLocation = getVisibleServiceIds(selection, 'location')
        var visibleForStaff = getVisibleServiceIds(selection, 'staff')
        var allowedLocationIds = getAllowedLocationIdsForPicker(visibleForLocation, {
            serviceId: selection.serviceId,
            categoryIds: selection.categoryIds,
            staffIds: selection.staffIds,
        })

        setServiceOptions(visibleForService)
        setCategoryOptions(visibleForCategory)
        setLocationOptions(allowedLocationIds)
        setStaffOptions(visibleForStaff, selection)
    }

    var performRegistration = function () {
        var registerModule = getRegisterModule()
        var React = getReact()

        if (!registerModule || !React || !metadata || !metadata.name || window[registrationKey]) {
            return false
        }

        var editRenderer = function (props) {
            var attrs = props && props.attrs ? props.attrs : {}
            var service = unwrapDiviValue(getNested(attrs, ['content', 'advanced', 'service']))
            if (Array.isArray(service)) {
                service = service.length > 0 ? String(service[0]) : '0'
            } else if (service === null || service === undefined || service === '') {
                service = '0'
            } else {
                service = String(service)
            }

            var categoryListToggle = unwrapDiviValue(
                getNested(attrs, ['content', 'advanced', 'categoryList'])
            )
            var categoryList = categoryListToggle === 'on' ? 'yes' : 'no'
            var categoryIds = normalizeIds(getNested(attrs, ['content', 'advanced', 'category']))
            var locationIds = normalizeIds(getNested(attrs, ['content', 'advanced', 'location']))
            var staffIds = normalizeIds(getNested(attrs, ['content', 'advanced', 'staff']))
            var category = categoryIds.join(',')
            var location = locationIds.join(',')
            var staff = staffIds.join(',')

            applyFilteredOptions({
                serviceId: service !== '0' ? service : null,
                categoryIds: categoryIds,
                locationIds: locationIds,
                staffIds: staffIds,
            })

            return React.createElement(
                'div',
                {
                    className: 'wbk_divi_booking_form_scope',
                    style: buildAppearanceStyle(attrs),
                },
                React.createElement('div', {
                    className: 'webba_booking_form_v6',
                    'data-service': service || '0',
                    'data-category-list': categoryList,
                    'data-category': category || '0',
                    'data-location': location || '0',
                    'data-staff': staff || '0',
                })
            )
        }

        try {
            registerModule(metadata, {
                renderers: {
                    edit: editRenderer,
                },
                callbacks: {},
            })
            window[registrationKey] = true
            return true
        } catch (error) {
            if (window.console && window.console.error) {
                window.console.error('WBK Divi5 register failed', error)
            }
            var errorMessage = ''
            if (error && error.message) {
                errorMessage = String(error.message)
            } else {
                try {
                    errorMessage = JSON.stringify(error)
                } catch (serializationError) {
                    errorMessage = String(error)
                }
            }
            if (errorMessage.indexOf('You cannot use `divi` namespace') !== -1) {
                window[registrationKey] = 'failed-namespace'
            }
            return false
        }
    }

    var attachHook = function () {
        if (window[hookAttachedKey]) {
            return
        }
        var hooks = getHooks()
        var addAction = hooks && hooks.addAction ? hooks.addAction : null
        if (!addAction) {
            return
        }

        addAction(
            'divi.moduleLibrary.registerModuleLibraryStore.after',
            'webba-booking/divi5-register-module',
            performRegistration
        )
        window[hookAttachedKey] = true
    }

    var ensureUpgradeModalStyles = function () {
        if (document.getElementById('wbk-divi-upgrade-modal-style')) {
            return
        }
        var style = document.createElement('style')
        style.id = 'wbk-divi-upgrade-modal-style'
        style.textContent =
            '.wbk-builder-upgrade-modal{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center}' +
            '.wbk-builder-upgrade-modal__backdrop{position:absolute;inset:0;background:rgba(0,0,0,.45)}' +
            '.wbk-builder-upgrade-modal__dialog{position:relative;background:#fff;border-radius:8px;padding:20px;max-width:420px;width:calc(100% - 32px);box-shadow:0 10px 40px rgba(0,0,0,.2)}' +
            '.wbk-builder-upgrade-modal__title{margin:0 0 8px;font-size:20px;line-height:1.3}' +
            '.wbk-builder-upgrade-modal__message{margin:0 0 16px;font-size:14px;line-height:1.5}' +
            '.wbk-builder-upgrade-modal__actions{display:flex;gap:8px}' +
            '.wbk-builder-upgrade-modal__button{border:0;border-radius:6px;padding:8px 14px;text-decoration:none;cursor:pointer}' +
            '.wbk-builder-upgrade-modal__button--primary{background:#15B8A9;color:#fff}' +
            '.wbk-builder-upgrade-modal__button--secondary{background:#f1f3f4;color:#222}' +
            '.wbk-divi-advanced-style-disabled{opacity:.55 !important;position:relative !important}' +
            '.wbk-divi-advanced-style-disabled:after{content:\"\";position:absolute;inset:0;z-index:5;cursor:pointer}' +
            '.wbk-divi-advanced-style-disabled .wbk-lock-badge,.wbk-divi-advanced-style-disabled-section .wbk-lock-badge{position:absolute;right:6px;top:6px;z-index:6;font-size:10px;font-weight:700;letter-spacing:.3px;line-height:1.1;color:#fff;background:#2271b1;border-radius:3px;padding:3px 6px;pointer-events:none}' +
            '.wbk-lock-badge-host{position:relative !important}' +
            '.wbk-divi-advanced-style-disabled-section{opacity:.55 !important;position:relative !important}' +
            '.wbk-divi-advanced-style-disabled-section:after{content:\"\";position:absolute;inset:0;z-index:5;cursor:pointer}'
        document.head.appendChild(style)
    }

    var showUpgradeModal = function () {
        if (!advancedAppearanceLocked) {
            return
        }
        if (modalNode) {
            modalNode.style.display = 'flex'
            return
        }
        var modal = document.createElement('div')
        modal.className = 'wbk-builder-upgrade-modal'
        modal.innerHTML =
            '<div class="wbk-builder-upgrade-modal__backdrop"></div>' +
            '<div class="wbk-builder-upgrade-modal__dialog">' +
            '<h3 class="wbk-builder-upgrade-modal__title">Upgrade Required</h3>' +
            '<p class="wbk-builder-upgrade-modal__message"></p>' +
            '<div class="wbk-builder-upgrade-modal__actions">' +
            '<a class="wbk-builder-upgrade-modal__button wbk-builder-upgrade-modal__button--primary" target="_blank" rel="noreferrer">Upgrade</a>' +
            '<button type="button" class="wbk-builder-upgrade-modal__button wbk-builder-upgrade-modal__button--secondary">Close</button>' +
            '</div>' +
            '</div>'
        modal.querySelector('.wbk-builder-upgrade-modal__message').textContent = upgradeMessage
        modal
            .querySelector('.wbk-builder-upgrade-modal__button--primary')
            .setAttribute('href', upgradeUrl)
        var close = function () {
            modal.style.display = 'none'
        }
        modal
            .querySelector('.wbk-builder-upgrade-modal__button--secondary')
            .addEventListener('click', close)
        modal
            .querySelector('.wbk-builder-upgrade-modal__backdrop')
            .addEventListener('click', close)
        document.body.appendChild(modal)
        modalNode = modal
        ensureUpgradeModalStyles()
    }

    var markDiviAdvancedAppearanceControls = function () {
        if (!advancedAppearanceLocked || !document || !document.querySelectorAll) {
            return
        }
        var normalizeText = function (value) {
            return String(value || '')
                .replace(/\s+/g, ' ')
                .trim()
                .toLowerCase()
        }
        var lockedSectionTitleSet = {}
        for (var sectionIndex = 0; sectionIndex < lockedSectionTitles.length; sectionIndex += 1) {
            lockedSectionTitleSet[normalizeText(lockedSectionTitles[sectionIndex])] = true
        }
        var markSectionsByTitle = function () {
            var headerSelectors = [
                '.et-fb-accordion-item__title',
                '.et-fb-form__toggle-title',
                '[role="button"]',
            ]
            for (var selectorIndex = 0; selectorIndex < headerSelectors.length; selectorIndex += 1) {
                var headers = document.querySelectorAll(headerSelectors[selectorIndex])
                for (var headerIndex = 0; headerIndex < headers.length; headerIndex += 1) {
                    var header = headers[headerIndex]
                    var title = normalizeText(header.textContent)
                    if (!lockedSectionTitleSet[title]) {
                        continue
                    }
                    var section =
                        (header.closest &&
                            (header.closest('.et-fb-accordion-item') ||
                                header.closest('.et-fb-form__toggle') ||
                                header.closest('[data-testid*="accordion-item"]'))) ||
                        header
                    if (!section || !section.classList) {
                        continue
                    }
                    section.classList.add('wbk-divi-advanced-style-disabled-section')
                    if (header.classList && !header.classList.contains('wbk-lock-badge-host')) {
                        header.classList.add('wbk-lock-badge-host')
                    }
                    if (header.querySelector('.wbk-lock-badge[data-wbk-lock-section-title="1"]')) {
                        continue
                    }
                    var badge = document.createElement('span')
                    badge.className = 'wbk-lock-badge'
                    badge.textContent = 'LOCKED'
                    badge.setAttribute('data-wbk-lock-section-title', '1')
                    header.appendChild(badge)
                }
            }
        }
        var markSectionContainer = function (node, key) {
            if (!node || !node.closest) {
                return
            }
            var section =
                node.closest('.et-fb-accordion-item') ||
                node.closest('[data-testid*="accordion-item"]') ||
                node.closest('.et-fb-form__toggle') ||
                null
            if (!section || !section.classList) {
                return
            }
            section.classList.add('wbk-divi-advanced-style-disabled-section')
            if (section.querySelector('.wbk-lock-badge[data-wbk-lock-section="1"]')) {
                return
            }
            var badgeHost =
                section.querySelector('.et-fb-accordion-item__title') ||
                section.querySelector('.et-fb-form__toggle-title') ||
                section.querySelector('[role="button"]') ||
                section
            if (!badgeHost || !badgeHost.appendChild) {
                return
            }
            if (badgeHost !== section && badgeHost.classList && !badgeHost.classList.contains('wbk-lock-badge-host')) {
                badgeHost.classList.add('wbk-lock-badge-host')
            }
            var badge = document.createElement('span')
            badge.className = 'wbk-lock-badge'
            badge.textContent = 'LOCKED'
            badge.setAttribute('data-wbk-lock-key', key)
            badge.setAttribute('data-wbk-lock-section', '1')
            badgeHost.appendChild(badge)
        }
        var containerMatchesKey = function (node, key) {
            if (!node || !node.getAttribute) {
                return false
            }
            var dataName = node.getAttribute('data-name') || ''
            var name = node.getAttribute('name') || ''
            var testId = node.getAttribute('data-testid') || ''
            return (
                dataName.indexOf('content.advanced.' + key) !== -1 ||
                name.indexOf('content.advanced.' + key) !== -1 ||
                testId.indexOf(key) !== -1
            )
        }
        for (var i = 0; i < advancedStyleKeys.length; i += 1) {
            var key = advancedStyleKeys[i]
            var selector =
                '[data-name*="content.advanced.' +
                key +
                '"],[name*="content.advanced.' +
                key +
                '"],[data-testid*="' +
                key +
                '"]'
            var nodes = document.querySelectorAll(selector)
            for (var j = 0; j < nodes.length; j += 1) {
                var node = nodes[j]
                var container = null
                if (node.closest) {
                    container =
                        node.closest('[data-name*="content.advanced.' + key + '"]') ||
                        node.closest('[name*="content.advanced.' + key + '"]') ||
                        node.closest('[data-testid*="' + key + '"]') ||
                        null
                }
                if (!container && node.closest) {
                    var candidates = node.closest('.et-fb-form__group')
                    if (candidates && containerMatchesKey(candidates, key)) {
                        container = candidates
                    }
                }
                if (!container) {
                    container = node
                }
                if (!container || !container.classList) {
                    continue
                }
                container.classList.add('wbk-divi-advanced-style-disabled')
                markSectionContainer(container, key)
            }
        }
        markSectionsByTitle()
    }

    var isAdvancedAppearanceControlEvent = function (target) {
        if (!target || !advancedAppearanceLocked) {
            return false
        }
        var current = target
        while (current && current !== document.body) {
            if (
                current.classList &&
                current.classList.contains('wbk-divi-advanced-style-disabled-section')
            ) {
                return true
            }
            var dataName = current.getAttribute ? current.getAttribute('data-name') : null
            var name = current.getAttribute ? current.getAttribute('name') : null
            var testId = current.getAttribute ? current.getAttribute('data-testid') : null
            var haystack = [dataName, name, testId].filter(Boolean).join(' ')
            for (var i = 0; i < advancedStyleKeys.length; i += 1) {
                if (haystack.indexOf('content.advanced.' + advancedStyleKeys[i]) !== -1) {
                    return true
                }
                if (haystack.indexOf(advancedStyleKeys[i]) !== -1) {
                    return true
                }
            }
            current = current.parentNode
        }
        return false
    }

    var attachAdvancedAppearanceLock = function () {
        if (!advancedAppearanceLocked) {
            return
        }
        ensureUpgradeModalStyles()
        var intercept = function (event) {
            if (!isAdvancedAppearanceControlEvent(event.target)) {
                return
            }
            event.preventDefault()
            event.stopPropagation()
            if (typeof event.stopImmediatePropagation === 'function') {
                event.stopImmediatePropagation()
            }
            showUpgradeModal()
        }
        document.addEventListener('mousedown', intercept, true)
        document.addEventListener('click', intercept, true)
        document.addEventListener('focusin', intercept, true)
        document.addEventListener('change', intercept, true)
        markDiviAdvancedAppearanceControls()
    }

    attachHook()
    performRegistration()
    attachAdvancedAppearanceLock()

    var attempts = 0
    var interval = window.setInterval(function () {
        attempts += 1
        attachHook()
        markDiviAdvancedAppearanceControls()
        if (performRegistration() || window[registrationKey] === 'failed-namespace' || attempts > 1200) {
            window.clearInterval(interval)
        }
    }, 250)
})()
