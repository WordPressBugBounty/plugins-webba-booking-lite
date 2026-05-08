(function ($) {
    const WIDGET_NAME = 'wbk_booking_form'
    const FIELD_NAMES = ['service', 'category', 'location', 'staff']
    const lockConfig = window.wbkElementorAdvancedAppearanceLock || null

    let presetPromise = null
    let isApplying = false
    let upgradeModalNode = null
    let globalLockAttached = false
    let runtimeAdvancedLock =
        lockConfig && typeof lockConfig.locked === 'boolean'
            ? lockConfig.locked
            : null
    const advancedSettingNames = [
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

    const toId = (value) => String(value)

    const ensureArray = (value) => {
        if (Array.isArray(value)) {
            return value
        }
        if (value === null || typeof value === 'undefined' || value === '') {
            return []
        }
        return [value]
    }

    const uniqueIds = (values) => {
        const ids = []
        ensureArray(values).forEach((item) => {
            const id = toId(item)
            if (id === '' || id === '0') {
                return
            }
            if (!ids.includes(id)) {
                ids.push(id)
            }
        })
        return ids
    }

    const getSelection = (panelView) => {
        const serviceValue = panelView.$el.find('[data-setting="service"]').val()
        const categoryValue = panelView.$el.find('[data-setting="category"]').val()
        const locationValue = panelView.$el.find('[data-setting="location"]').val()
        const staffValue = panelView.$el.find('[data-setting="staff"]').val()

        const serviceIds = uniqueIds(serviceValue)

        return {
            serviceId: serviceIds.length > 0 ? serviceIds[0] : null,
            categoryIds: uniqueIds(categoryValue),
            locationIds: uniqueIds(locationValue),
            staffIds: uniqueIds(staffValue),
        }
    }

    const intersectSets = (a, b) => {
        const out = new Set()
        a.forEach((x) => {
            if (b.has(x)) {
                out.add(x)
            }
        })
        return out
    }

    const serviceBelongsToLocation = (service, locationId) => {
        const locations = ensureArray(service.locations)
        return locations.some((lid) => toId(lid) === toId(locationId))
    }

    const staffMatchesSelectedLocations = (staff, locationIds) => {
        const locations = ensureArray(staff.location)
        return locationIds.some((locationId) =>
            locations.some((staffLocation) => toId(staffLocation) === toId(locationId))
        )
    }

    const getVisibleServiceIds = (preset, selection, ignore) => {
        let ids = new Set(preset.services.map((service) => toId(service.id)))

        if (selection.serviceId && ignore !== 'service') {
            ids = ids.has(selection.serviceId) ? new Set([selection.serviceId]) : new Set()
        }

        if (selection.categoryIds.length > 0 && ignore !== 'category') {
            const fromCategories = new Set()
            preset.categories
                .filter((category) => selection.categoryIds.includes(toId(category.id)))
                .forEach((category) => {
                    ensureArray(category.services).forEach((serviceId) =>
                        fromCategories.add(toId(serviceId))
                    )
                })
            ids = intersectSets(ids, fromCategories)
        }

        if (selection.locationIds.length > 0 && ignore !== 'location') {
            const fromLocations = new Set()
            preset.services.forEach((service) => {
                if (
                    selection.locationIds.some((locationId) =>
                        serviceBelongsToLocation(service, locationId)
                    )
                ) {
                    fromLocations.add(toId(service.id))
                }
            })
            ids = intersectSets(ids, fromLocations)
        }

        if (selection.staffIds.length > 0 && ignore !== 'staff') {
            const fromStaff = new Set()
            preset.staffMembers
                .filter((staffMember) => selection.staffIds.includes(toId(staffMember.id)))
                .forEach((staffMember) => {
                    ensureArray(staffMember.services).forEach((serviceId) =>
                        fromStaff.add(toId(serviceId))
                    )
                })
            ids = intersectSets(ids, fromStaff)
        }

        return ids
    }

    const getUnionLocationIdsForServices = (services, serviceIds) => {
        const output = new Set()
        services.forEach((service) => {
            if (!serviceIds.has(toId(service.id))) {
                return
            }
            ensureArray(service.locations).forEach((locationId) =>
                output.add(toId(locationId))
            )
        })
        return output
    }

    const getAllowedLocationIdsForPicker = (preset, visibleServiceIds, selection) => {
        const allLocationIds = new Set(preset.locations.map((location) => toId(location.id)))
        const noNarrowing =
            !selection.serviceId &&
            selection.categoryIds.length === 0 &&
            selection.staffIds.length === 0

        if (noNarrowing) {
            return allLocationIds
        }

        const fromServices = getUnionLocationIdsForServices(
            preset.services,
            visibleServiceIds
        )

        if (selection.staffIds.length > 0) {
            const selectedStaff = preset.staffMembers.filter((staffMember) =>
                selection.staffIds.includes(toId(staffMember.id))
            )
            let staffLocationIntersect = new Set(allLocationIds)
            selectedStaff.forEach((staffMember) => {
                const locations = ensureArray(staffMember.location)
                const forStaff =
                    locations.length === 0
                        ? new Set(allLocationIds)
                        : new Set(locations.map((locationId) => toId(locationId)))
                staffLocationIntersect = intersectSets(staffLocationIntersect, forStaff)
            })

            const serviceLocationsOrPreset =
                fromServices.size > 0 ? fromServices : allLocationIds
            return intersectSets(serviceLocationsOrPreset, staffLocationIntersect)
        }

        if (fromServices.size === 0) {
            return allLocationIds
        }
        return fromServices
    }

    const staffMatchesFilters = (staffMember, visibleServiceIds, locationIds, selection) => {
        const locationOnlyNarrowing =
            locationIds.length > 0 && !selection.serviceId && selection.categoryIds.length === 0

        if (locationOnlyNarrowing) {
            return staffMatchesSelectedLocations(staffMember, locationIds)
        }

        const servesVisible = ensureArray(staffMember.services).some((serviceId) =>
            visibleServiceIds.has(toId(serviceId))
        )
        if (!servesVisible) {
            return false
        }
        if (locationIds.length === 0) {
            return true
        }
        return staffMatchesSelectedLocations(staffMember, locationIds)
    }

    const equalSelections = (a, b) => {
        if (a.serviceId !== b.serviceId) {
            return false
        }
        const keys = ['categoryIds', 'locationIds', 'staffIds']
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            if (a[key].length !== b[key].length) {
                return false
            }
            for (let j = 0; j < a[key].length; j++) {
                if (!b[key].includes(a[key][j])) {
                    return false
                }
            }
        }
        return true
    }

    const pruneSelections = (preset, inputSelection) => {
        let current = {
            serviceId: inputSelection.serviceId,
            categoryIds: [...inputSelection.categoryIds],
            locationIds: [...inputSelection.locationIds],
            staffIds: [...inputSelection.staffIds],
        }

        for (let i = 0; i < 6; i++) {
            let { serviceId, categoryIds, locationIds, staffIds } = current

            const visibleAll = getVisibleServiceIds(preset, {
                serviceId,
                categoryIds,
                locationIds,
                staffIds,
            })
            if (serviceId && !visibleAll.has(serviceId)) {
                serviceId = null
            }

            const visibleNoCategory = getVisibleServiceIds(
                preset,
                { serviceId, categoryIds, locationIds, staffIds },
                'category'
            )
            categoryIds = categoryIds.filter((categoryId) =>
                preset.categories.some(
                    (category) =>
                        toId(category.id) === categoryId &&
                        ensureArray(category.services).some((serviceId) =>
                            visibleNoCategory.has(toId(serviceId))
                        )
                )
            )

            const visibleNoLocation = getVisibleServiceIds(
                preset,
                { serviceId, categoryIds, locationIds, staffIds },
                'location'
            )
            const allowedLocationIds = getAllowedLocationIdsForPicker(
                preset,
                visibleNoLocation,
                { serviceId, categoryIds, staffIds }
            )
            locationIds = locationIds.filter((locationId) =>
                allowedLocationIds.has(locationId)
            )

            const visibleNoStaff = getVisibleServiceIds(
                preset,
                { serviceId, categoryIds, locationIds, staffIds },
                'staff'
            )
            staffIds = staffIds.filter((staffId) => {
                const staffMember = preset.staffMembers.find(
                    (staff) => toId(staff.id) === staffId
                )
                if (!staffMember) {
                    return false
                }
                return staffMatchesFilters(
                    staffMember,
                    visibleNoStaff,
                    locationIds,
                    { serviceId, categoryIds }
                )
            })

            const next = { serviceId, categoryIds, locationIds, staffIds }
            if (equalSelections(next, current)) {
                return next
            }
            current = next
        }

        return current
    }

    const ensureBaseOptionsCache = (panelView) => {
        if (panelView.__wbkBaseOptions) {
            return panelView.__wbkBaseOptions
        }

        const cache = {}
        FIELD_NAMES.forEach((settingName) => {
            const $select = panelView.$el.find('[data-setting="' + settingName + '"]')
            const options = []
            $select.find('option').each(function () {
                options.push({
                    value: toId($(this).attr('value') || ''),
                    label: $(this).text(),
                })
            })
            cache[settingName] = options
        })
        panelView.__wbkBaseOptions = cache
        return cache
    }

    const applyOptionsToControl = (panelView, settingName, allowedIds) => {
        const $select = panelView.$el.find('[data-setting="' + settingName + '"]')
        if ($select.length === 0) {
            return
        }

        const isService = settingName === 'service'
        const allowedSet = new Set((allowedIds || []).map((id) => toId(id)))
        const baseOptionsByControl = ensureBaseOptionsCache(panelView)
        const baseOptions = baseOptionsByControl[settingName] || []

        let selectedValues = ensureArray($select.val()).map((value) => toId(value))
        if (isService) {
            selectedValues = selectedValues.slice(0, 1)
        }
        const filteredSelection = selectedValues.filter((value) =>
            value === '' ? true : allowedSet.has(value)
        )

        const allowedOptions = baseOptions.filter((option) => {
            if (option.value === '') {
                return true
            }
            return allowedSet.has(option.value)
        })

        const optionsHtml = allowedOptions
            .map(
                (option) =>
                    '<option value="' +
                    option.value.replace(/"/g, '&quot;') +
                    '">' +
                    option.label +
                    '</option>'
            )
            .join('')

        $select.html(optionsHtml)

        if (selectedValues.join(',') !== filteredSelection.join(',')) {
            isApplying = true
            $select.val(isService ? filteredSelection[0] || '' : filteredSelection)
            $select.trigger('change')
            isApplying = false
        } else {
            $select.val(isService ? filteredSelection[0] || '' : filteredSelection)
        }

        if ($select.data('select2')) {
            $select.trigger('change.select2')
        }
    }

    const applyFilters = (panelView, preset) => {
        if (isApplying) {
            return
        }

        const rawSelection = getSelection(panelView)
        const selection = pruneSelections(preset, rawSelection)

        const visibleForService = getVisibleServiceIds(preset, selection, 'service')
        const visibleForCategory = getVisibleServiceIds(preset, selection, 'category')
        const visibleForLocation = getVisibleServiceIds(preset, selection, 'location')
        const visibleForStaff = getVisibleServiceIds(preset, selection, 'staff')
        const allowedLocationIds = getAllowedLocationIdsForPicker(
            preset,
            visibleForLocation,
            {
                serviceId: selection.serviceId,
                categoryIds: selection.categoryIds,
                staffIds: selection.staffIds,
            }
        )

        const allowedCategoryIds = []
        preset.categories.forEach((category) => {
            const hasVisibleService = ensureArray(category.services).some((serviceId) =>
                visibleForCategory.has(toId(serviceId))
            )
            if (hasVisibleService) {
                allowedCategoryIds.push(toId(category.id))
            }
        })

        const allowedStaffIds = []
        preset.staffMembers.forEach((staffMember) => {
            if (
                staffMatchesFilters(
                    staffMember,
                    visibleForStaff,
                    selection.locationIds,
                    {
                        serviceId: selection.serviceId,
                        categoryIds: selection.categoryIds,
                    }
                )
            ) {
                allowedStaffIds.push(toId(staffMember.id))
            }
        })

        applyOptionsToControl(panelView, 'service', Array.from(visibleForService))
        applyOptionsToControl(panelView, 'category', allowedCategoryIds)
        applyOptionsToControl(panelView, 'location', Array.from(allowedLocationIds))
        applyOptionsToControl(panelView, 'staff', allowedStaffIds)
    }

    const normalizePreset = (presetData) => {
        return {
            services: ensureArray(presetData.services).map((service) => ({
                id: service.id,
                locations: ensureArray(service.locations).map(toId),
            })),
            categories: ensureArray(presetData.categories).map((category) => ({
                id: category.id,
                services: ensureArray(category.services).map(toId),
            })),
            locations: ensureArray(presetData.locations).map((location) => ({
                id: location.id,
            })),
            staffMembers: ensureArray(presetData.staff_members || presetData.staffMembers).map(
                (staffMember) => ({
                    id: staffMember.id,
                    services: ensureArray(staffMember.services).map(toId),
                    location: ensureArray(staffMember.location || staffMember.locations).map(
                        toId
                    ),
                })
            ),
        }
    }

    const getPresetData = () => {
        if (presetPromise) {
            return presetPromise
        }

        presetPromise = window.wp.apiFetch({
            path: '/wbk/v2/get-preset',
        })
            .then((data) => {
                if (
                    runtimeAdvancedLock === null &&
                    data &&
                    data.plan_map &&
                    typeof data.plan_map === 'object'
                ) {
                    const planMap = data.plan_map
                    runtimeAdvancedLock = !(
                        planMap.standard === true ||
                        planMap.premium === true ||
                        planMap.pro === true
                    )
                }
                return normalizePreset(data || {})
            })
            .catch(() => ({
                services: [],
                categories: [],
                locations: [],
                staffMembers: [],
            }))

        return presetPromise
    }

    const attachPanelHandlers = (panelView) => {
        const namespace = '.wbkElementorFilter'
        panelView.$el.off(namespace)
        panelView.$el.on(
            'change' + namespace + ' select2:select' + namespace + ' select2:unselect' + namespace,
            '[data-setting="service"], [data-setting="category"], [data-setting="location"], [data-setting="staff"]',
            () => {
                getPresetData().then((preset) => applyFilters(panelView, preset))
            }
        )
    }

    const initWidgetPanel = (panelView) => {
        if (!panelView || !panelView.$el) {
            return
        }
        setupPanelLockObserver(panelView)
        // Style tab does not contain booking context controls, but it still needs the lock.
        safelyEnsureAdvancedAppearanceLock(panelView)
        const hasContextControls =
            panelView.$el.find('[data-setting="service"]').length > 0
        if (!hasContextControls) {
            setTimeout(() => safelyEnsureAdvancedAppearanceLock(panelView), 120)
            setTimeout(() => safelyEnsureAdvancedAppearanceLock(panelView), 400)
            return
        }
        getPresetData().then((preset) => {
            attachPanelHandlers(panelView)
            setTimeout(() => {
                ensureBaseOptionsCache(panelView)
                applyFilters(panelView, preset)
                safelyEnsureAdvancedAppearanceLock(panelView)
            }, 60)
        })
        // Elementor can render controls lazily after panel open.
        setTimeout(() => safelyEnsureAdvancedAppearanceLock(panelView), 200)
        setTimeout(() => safelyEnsureAdvancedAppearanceLock(panelView), 500)
        setTimeout(() => safelyEnsureAdvancedAppearanceLock(panelView), 1000)
        setTimeout(() => safelyEnsureAdvancedAppearanceLock(panelView), 1800)
        setTimeout(() => safelyEnsureAdvancedAppearanceLock(panelView), 2800)
    }

    const setupPanelLockObserver = (panelView) => {
        if (!panelView || !panelView.$el || panelView.__wbkLockObserverAttached) {
            return
        }
        panelView.__wbkLockObserverAttached = true
        const root = panelView.$el[0]
        if (!root) {
            return
        }
        const handlePotentialStyleRender = () => {
            setTimeout(() => safelyEnsureAdvancedAppearanceLock(panelView), 50)
            setTimeout(() => safelyEnsureAdvancedAppearanceLock(panelView), 220)
        }
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(() => {
                handlePotentialStyleRender()
            })
            observer.observe(root, {
                childList: true,
                subtree: true,
            })
            panelView.__wbkLockObserver = observer
        }
        panelView.$el.on(
            'click.wbkElementorLockTabs',
            'button, .elementor-control, .elementor-panel-navigation-tab',
            function () {
                handlePotentialStyleRender()
            }
        )
    }

    const initElementorHooks = () => {
        if (
            typeof window.elementor === 'undefined' ||
            !window.elementor.hooks ||
            typeof window.elementor.hooks.addAction !== 'function'
        ) {
            return
        }

        window.elementor.hooks.addAction(
            'panel/open_editor/widget/' + WIDGET_NAME,
            function () {
                const args = Array.prototype.slice.call(arguments)
                const panelView =
                    args.find((item) => item && item.$el && typeof item.$el.find === 'function') ||
                    (window.elementor.getPanelView
                        ? window.elementor.getPanelView()
                        : null)
                initWidgetPanel(panelView)
            }
        )
        attachGlobalAdvancedAppearanceLock()
    }

    $(window).on('elementor:init', initElementorHooks)
    if (typeof window.elementor !== 'undefined') {
        initElementorHooks()
    }

    function showUpgradeModal() {
        if (runtimeAdvancedLock !== true) {
            return
        }
        if (upgradeModalNode) {
            upgradeModalNode.style.display = 'flex'
            return
        }
        const title =
            (lockConfig && lockConfig.title) || 'Upgrade Required'
        const message =
            (lockConfig && lockConfig.message) || 'Available in PLUS'
        const buttonText = (lockConfig && lockConfig.button) || 'Upgrade'
        const upgradeUrl =
            (lockConfig && lockConfig.upgradeUrl) ||
            '/wp-admin/admin.php?page=wbk-main-pricing'
        const modal = document.createElement('div')
        modal.className = 'wbk-builder-upgrade-modal'
        modal.innerHTML =
            '<div class="wbk-builder-upgrade-modal__backdrop"></div>' +
            '<div class="wbk-builder-upgrade-modal__dialog">' +
            '<h3 class="wbk-builder-upgrade-modal__title"></h3>' +
            '<p class="wbk-builder-upgrade-modal__message"></p>' +
            '<div class="wbk-builder-upgrade-modal__actions">' +
            '<a class="wbk-builder-upgrade-modal__button wbk-builder-upgrade-modal__button--primary" target="_blank" rel="noreferrer"></a>' +
            '<button type="button" class="wbk-builder-upgrade-modal__button wbk-builder-upgrade-modal__button--secondary">Close</button>' +
            '</div>' +
            '</div>'
        modal.querySelector('.wbk-builder-upgrade-modal__title').textContent = title
        modal.querySelector('.wbk-builder-upgrade-modal__message').textContent = message
        const upgradeButton = modal.querySelector(
            '.wbk-builder-upgrade-modal__button--primary'
        )
        upgradeButton.textContent = buttonText
        upgradeButton.setAttribute('href', upgradeUrl)
        const closeButton = modal.querySelector(
            '.wbk-builder-upgrade-modal__button--secondary'
        )
        const close = () => {
            modal.style.display = 'none'
        }
        closeButton.addEventListener('click', close)
        modal
            .querySelector('.wbk-builder-upgrade-modal__backdrop')
            .addEventListener('click', close)
        document.body.appendChild(modal)
        upgradeModalNode = modal
        ensureModalStyles()
    }

    function ensureModalStyles() {
        if (document.getElementById('wbk-builder-upgrade-modal-styles')) {
            return
        }
        const style = document.createElement('style')
        style.id = 'wbk-builder-upgrade-modal-styles'
        style.textContent =
            '.wbk-builder-upgrade-modal{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center}' +
            '.wbk-builder-upgrade-modal__backdrop{position:absolute;inset:0;background:rgba(0,0,0,.45)}' +
            '.wbk-builder-upgrade-modal__dialog{position:relative;background:#fff;border-radius:8px;padding:20px;max-width:420px;width:calc(100% - 32px);box-shadow:0 10px 40px rgba(0,0,0,.2)}' +
            '.wbk-builder-upgrade-modal__title{margin:0 0 8px;font-size:20px;line-height:1.3}' +
            '.wbk-builder-upgrade-modal__message{margin:0 0 16px;font-size:14px;line-height:1.5}' +
            '.wbk-builder-upgrade-modal__actions{display:flex;gap:8px}' +
            '.wbk-builder-upgrade-modal__button{border:0;border-radius:6px;padding:8px 14px;text-decoration:none;cursor:pointer}' +
            '.wbk-builder-upgrade-modal__button--primary{background:#15B8A9;color:#fff}' +
            '.wbk-builder-upgrade-modal__button--secondary{background:#f1f3f4;color:#222}'
        document.head.appendChild(style)
    }

    function ensureAdvancedAppearanceLock(panelView) {
        if (runtimeAdvancedLock !== true || !panelView || !panelView.$el) {
            return
        }
        ensureElementorAdvancedLockStyles()
        const root = panelView.$el[0]
        if (!root) {
            return
        }
        const section =
            root.querySelector('.elementor-control-section_wbk_appearance_advanced') ||
            root.querySelector('[data-section="wbk_appearance_advanced"]') ||
            root.querySelector('[data-section*="wbk_appearance_advanced"]')
        if (section && !section.querySelector('.wbk-elementor-advanced-style-lock')) {
            if (window.getComputedStyle(section).position === 'static') {
                section.style.position = 'relative'
            }
            const lock = document.createElement('div')
            lock.className = 'wbk-elementor-advanced-style-lock'
            lock.style.cssText =
                'position:absolute;inset:0;z-index:3;background:rgba(255,255,255,.35);backdrop-filter:blur(1px);cursor:pointer;'
            lock.addEventListener('click', function (event) {
                event.preventDefault()
                event.stopPropagation()
                showUpgradeModal()
            })
            section.appendChild(lock)
        }

        const lockControlNode = (control) => {
            if (!control || !control.classList) {
                return false
            }
            if (control.classList.contains('elementor-control-type-heading')) {
                return false
            }
            if (
                control.classList.contains('elementor-control-type-divider') ||
                control.classList.contains('elementor-hidden-control')
            ) {
                return false
            }
            control.classList.add('wbk-elementor-advanced-style-disabled')
            if (!control.querySelector('.wbk-lock-badge')) {
                const badge = document.createElement('span')
                badge.className = 'wbk-lock-badge'
                badge.textContent = 'LOCKED'
                control.appendChild(badge)
            }
            return true
        }
        let lockedControlsCount = 0
        if (section) {
            const controls = section.querySelectorAll('.elementor-control')
            controls.forEach((control) => {
                if (lockControlNode(control)) {
                    lockedControlsCount += 1
                }
            })
        }
        if (lockedControlsCount === 0) {
            const fallbackLockedControlMap = new Set()
            advancedSettingNames.forEach((name) => {
                const classUnderscore = '.elementor-control-' + name
                const classHyphen = '.elementor-control-' + String(name).replace(/_/g, '-')
                const selector =
                    '[data-setting="' +
                    name +
                    '"],' +
                    '[name*="[' +
                    name +
                    ']"],' +
                    '[name*=".' +
                    name +
                    '"],' +
                    classUnderscore +
                    ',' +
                    classHyphen
                const nodes = root.querySelectorAll(selector)
                nodes.forEach((node) => {
                    const control =
                        (node.closest && node.closest('.elementor-control')) || node
                    if (!control) {
                        return
                    }
                    fallbackLockedControlMap.add(control)
                })
            })
            fallbackLockedControlMap.forEach((control) => {
                if (lockControlNode(control)) {
                    lockedControlsCount += 1
                }
            })
        }
        if (lockedControlsCount === 0) {
            const advancedLabelTextSet = new Set(
                [
                    "buttons' border radius",
                    'default color',
                    'default text color',
                    'hover-on color',
                    'hover-on text color',
                    'selected color',
                    'selected text color',
                    'background color',
                    'text color',
                    'border color',
                ].map((item) => String(item).toLowerCase())
            )
            const titleNodes = root.querySelectorAll(
                'label, .elementor-control-title, .elementor-panel-heading-title, h3, span, div'
            )
            const textBasedLockedMap = new Set()
            titleNodes.forEach((node) => {
                const text = String(node.textContent || '')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .toLowerCase()
                if (!advancedLabelTextSet.has(text)) {
                    return
                }
                let container = node
                while (container && container !== root) {
                    const hasInteractive = !!container.querySelector(
                        'button, select, input, textarea'
                    )
                    if (hasInteractive) {
                        textBasedLockedMap.add(container)
                        break
                    }
                    container = container.parentElement
                }
            })
            textBasedLockedMap.forEach((control) => {
                if (lockControlNode(control)) {
                    lockedControlsCount += 1
                }
            })
        }
        if (panelView && panelView.$el && panelView.$el.on) {
            const ns = '.wbkElementorAdvancedLock'
            panelView.$el.off(ns)
            const selectors =
                '.wbk-elementor-advanced-style-disabled, .wbk-elementor-advanced-style-disabled *'
            panelView.$el.on(
                'mousedown' + ns + ' click' + ns + ' change' + ns + ' focus' + ns,
                selectors,
                function (event) {
                    if (runtimeAdvancedLock !== true) {
                        return
                    }
                    event.preventDefault()
                    event.stopPropagation()
                    if (typeof event.stopImmediatePropagation === 'function') {
                        event.stopImmediatePropagation()
                    }
                    showUpgradeModal()
                }
            )
        }
    }

    function safelyEnsureAdvancedAppearanceLock(panelView) {
        try {
            ensureAdvancedAppearanceLock(panelView)
        } catch (e) {}
    }

    function ensureElementorAdvancedLockStyles() {
        if (document.getElementById('wbk-elementor-advanced-lock-styles')) {
            return
        }
        const style = document.createElement('style')
        style.id = 'wbk-elementor-advanced-lock-styles'
        style.textContent =
            '.wbk-elementor-advanced-style-disabled{opacity:.55;position:relative}' +
            '.wbk-elementor-advanced-style-disabled:after{content:\"\";position:absolute;inset:0;z-index:2;cursor:pointer}' +
            '.wbk-elementor-advanced-style-disabled .wbk-lock-badge{position:absolute;right:6px;top:6px;z-index:4;font-size:10px;font-weight:700;letter-spacing:.3px;line-height:1.1;color:#fff;background:#2271b1;border-radius:3px;padding:3px 6px;pointer-events:none}'
        document.head.appendChild(style)
    }

    function shouldLockTarget(target) {
        if (!target || runtimeAdvancedLock !== true) {
            return false
        }
        let el = target
        while (el && el !== document.body) {
            if (
                el.classList &&
                (el.classList.contains('wbk-elementor-advanced-style-disabled') ||
                    el.classList.contains('wbk-elementor-advanced-style-lock'))
            ) {
                return true
            }
            el = el.parentNode
        }
        return false
    }

    function attachGlobalAdvancedAppearanceLock() {
        if (globalLockAttached) {
            return
        }
        globalLockAttached = true
        const intercept = function (event) {
            if (!shouldLockTarget(event.target)) {
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
    }
})(jQuery)
