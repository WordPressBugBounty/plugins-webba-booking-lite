import {
    FormEvent,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
    useRef,
    useCallback,
    cloneElement,
    isValidElement,
} from 'react'
import { useSidebar } from '../Sidebar/SidebarContext'
import { IFormProps, ResolvedFormField } from './types'
import classNames from 'classnames'
import { toast, ToastContentProps } from 'react-toastify'
import { Model } from '../../types'
import './Form.scss'
import { FormProvider } from './lib/FormProvider'
import { FormValueFromModel } from './lib/types'
import { getFormState } from './lib/utils'
import { __ } from '@wordpress/i18n'
import { Button } from '../Button/Button'
import { useSelect, useDispatch } from '@wordpress/data'
import { store_name, store } from '../../../store/backend'
import { ConfirmationButton } from '../ConfirmationButton/ConfirmationButton'
import { useConfirmationPopup } from '../ConfirmationPopup/ConfirmationPopupContext'
import closeIcon from '../../../../public/images/icon-close.svg'
import deleteIcon from '../../../../public/images/delete-icon.svg'
import duplicateIcon from '../../../../public/images/duplicate-icon.svg'
import resetIcon from '../../../../public/images/icon-reset.svg'
import arrowLeftIcon from '../../../../public/images/icon-navigation-prev.svg'
import arrowRightIcon from '../../../../public/images/icon-navigation-next.svg'
import { capitalize } from '../../utils/capitalize'
import { Accordion } from './Accordion'
import { ProFeatuerWrapper } from '../ProFeatuerWrapper/ProFeatuerWrapper'
import { ReactComponent as ErrorIcon } from '../../../../public/images/icon-error-circle.svg'
import { usePreset } from '../../hooks/usePreset'
import { TabularForm } from '../TabularForm/TabularForm'

interface ErrorNotificationProps {
    errors: string
}

const ErrorNotification = ({
    data,
}: ToastContentProps<ErrorNotificationProps>) => {
    return (
        <div className="wbk_form__invalidFormNotificationContainer">
            <div className="wbk_form__invalidFormNotificationHeader">
                <div className="wbk_form__invalidFormNotificationIcon">
                    <ErrorIcon className="wbk_form__errorIcon" />
                </div>
                <div className="wbk_form__invalidFormNotificationTitle">
                    {__('You have errors in your form', 'webba-booking-lite')}
                </div>
            </div>
            <div className="wbk_form__invalidFormNotificationContent">
                <div>
                    {__(
                        'Please, fix the following fields and try again:',
                        'webba-booking-lite'
                    )}
                </div>
                <div>{data.errors}</div>
            </div>
        </div>
    )
}

export const Form = function <T extends Model>({
    form,
    defaultValue,
    name,
    id,
    sections,
    onSubmit,
    onDelete,
    onReset,
    onDuplicate,
    subsectionTitles,
    tooltipMode = 'tooltip',
    tabs,
    editorView = 'form',
    showTabularSearch = false,
    submitButtonText,
    submitButtonIcon,
}: IFormProps<T>) {
    const shouldShowSections = Object.keys(sections).length > 1
    const [activeSection, setActiveSection] = useState('')
    const sidebar = useSidebar()
    const { show: showConfirmation } = useConfirmationPopup()
    // @ts-ignore
    const busy = useSelect((select) => select(store_name).isBusy(), [])
    const { setItem } = useDispatch(store)
    const sectionNavigationRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)
    const initialValuesRef = useRef<Record<string, any> | null>(null)
    const [loadingButton, setLoadingButton] = useState<
        'apply' | 'save-and-exit' | null
    >(null)
    const wasAddModeRef = useRef<boolean>(!defaultValue?.id)
    const startedInAddModeRef = useRef<boolean>(!defaultValue?.id)
    const collectionNameRef = useRef<string | null>(null)
    const { plan_map } = usePreset()

    const getCollectionNameFromFormId = (formId: string): string | null => {
        const collectionNameMap: Record<string, string> = {
            'service-category': 'service_categories',
            'service-categories': 'service_categories',
            'pricing-rule': 'pricing_rules',
            'pricing-rules': 'pricing_rules',
            'ggcalendar': 'gg_calendars',
            'gg-calendar': 'gg_calendars',
            'emailTemplate': 'email_templates',
            'email-template': 'email_templates',
            'booking': 'appointments',
            'bookings': 'appointments',
        }

        const match = formId.match(/add-([\w-]+)-form|edit-([\w-]+)-form/)
        if (!match) return null

        const extractedName = match[1] || match[2]

        if (collectionNameMap[extractedName]) {
            return collectionNameMap[extractedName]
        }

        const parts = extractedName.split('-')
        if (parts.length > 1) {
            const lastPart = parts[parts.length - 1]
            return parts.slice(0, -1).join('_') + '_' + lastPart + 's'
        }

        return extractedName + 's'
    }

    useEffect(() => {
        if (defaultValue) {
            form.patchValue(defaultValue)
            form.defaultValue = defaultValue
            wasAddModeRef.current = !defaultValue.id
        } else {
            form.defaultValue = {} as FormValueFromModel<T>
            wasAddModeRef.current = true
        }

        collectionNameRef.current = getCollectionNameFromFormId(id)

        const captureInitialValues = () => {
            const { values } = getFormState(form)
            const filteredValues: Record<string, any> = {}
            for (const key in values) {
                if (form.fields[key] && form.fields[key].isIgnored?.value !== true) {
                    filteredValues[key] = values[key]
                }
            }
            initialValuesRef.current = filteredValues
        }

        setTimeout(captureInitialValues, 100)

        return form.reset
    }, [])

    const submitHandler = async (
        e: FormEvent | MouseEvent,
        close: boolean = false
    ) => {
        e.preventDefault()
        const buttonType = close ? 'save-and-exit' : 'apply'
        setLoadingButton(buttonType)

        try {
            const { values, errors, isValid } = getFormState(form)
            if (!isValid) {
                toast.dismiss()
                toast.error(ErrorNotification, {
                    autoClose: 5000,
                    containerId: 'wbk-toast-container',
                    hideProgressBar: false,
                    data: {
                        errors: Object.keys(errors)
                            .map((key) => form.fields[key].label)
                            .join(', '),
                    },
                })
            } else {
                let response: any

                if (
                    startedInAddModeRef.current &&
                    values?.id &&
                    typeof values.id === 'number' &&
                    collectionNameRef.current
                ) {
                    response = await setItem(collectionNameRef.current, values)
                } else {
                    response = await onSubmit(values)
                }

                if (
                    wasAddModeRef.current &&
                    !values?.id &&
                    response?.id &&
                    typeof response.id === 'number'
                ) {
                    const updatedValues = {
                        ...(values as FormValueFromModel<T>),
                        id: response.id,
                    } as unknown as FormValueFromModel<T>

                    form.patchValue(updatedValues)
                    form.defaultValue = updatedValues

                    const { values: currentValues } = getFormState(form)
                    initialValuesRef.current = currentValues
                } else if (
                    wasAddModeRef.current &&
                    values?.id &&
                    typeof values.id === 'number'
                ) {
                    const { values: currentValues } = getFormState(form)
                    initialValuesRef.current = currentValues
                } else {
                    const { values: currentValues } = getFormState(form)
                    initialValuesRef.current = currentValues
                }

                if (close) {
                    sidebar.close()
                }
            }
        } finally {
            setLoadingButton(null)
        }
    }

    const submitClose = () => { }

    const normalizeValue = (value: any): any => {
        if (value === null || value === undefined || value === '') {
            return ''
        }
        if (typeof value === 'string') {
            const trimmed = value.trim()
            if (trimmed === '') return ''
            const numValue = Number(trimmed)
            if (!isNaN(numValue) && trimmed === String(numValue)) {
                return numValue
            }
            return trimmed
        }
        if (typeof value === 'number') {
            return value
        }
        if (Array.isArray(value)) {
            if (value.length === 0) return []
            const normalized = value.map(normalizeValue).filter((v) => v !== '')
            return normalized.length === 0 ? [] : normalized.sort()
        }
        if (typeof value === 'object') {
            const normalized: Record<string, any> = {}
            for (const key in value) {
                if (value.hasOwnProperty(key)) {
                    const normalizedVal = normalizeValue(value[key])
                    if (normalizedVal !== '' && normalizedVal !== null && normalizedVal !== undefined) {
                        normalized[key] = normalizedVal
                    }
                }
            }
            return Object.keys(normalized).length === 0 ? {} : normalized
        }
        return value
    }

    const hasFormChanged = useCallback((): boolean => {
        if (!initialValuesRef.current) {
            return false
        }

        const { values } = getFormState(form)
        const initialValues = initialValuesRef.current

        const initialKeys = Object.keys(initialValues)
        const currentKeys = Object.keys(values)

        const allKeys = new Set([...initialKeys, ...currentKeys])

        for (const key of allKeys) {
            if (!form.fields[key]) {
                continue
            }

            const field = form.fields[key]
            if (field.isIgnored?.value === true) {
                continue
            }

            const initialValue = normalizeValue(initialValues[key])
            const currentValue = normalizeValue(values[key])

            const initialStr = JSON.stringify(initialValue)
            const currentStr = JSON.stringify(currentValue)

            if (initialStr !== currentStr) {
                return true
            }
        }

        return false
    }, [form])

    const handleClose = useCallback(() => {
        if (!hasFormChanged()) {
            sidebar.close()
            return
        }

        showConfirmation({
            buttonText: __('Yes, discard', 'webba-booking-lite'),
            title: __(
                'You have unsaved changes. Do you want to discard them?',
                'webba-booking-lite'
            ),
            message: '',
            onConfirm: () => {
                sidebar.close()
            },
        })
    }, [hasFormChanged, sidebar, showConfirmation])

    const header = (
        <div className="wbk_form__header">
            <div className="wbk_form__headerTitle">{name}</div>
            <div>
                <button
                    type="button"
                    onClick={handleClose}
                    className="wbk_form__closeBtn"
                >
                    <img src={closeIcon} />
                    <span className="wbk_form__closeBtnText">
                        {__('Close', 'webba-booking-lite')}
                    </span>
                </button>
            </div>
        </div>
    )

    const checkScrollability = useCallback(() => {
        if (!sectionNavigationRef.current) return

        const container = sectionNavigationRef.current
        const scrollLeft = container.scrollLeft
        const scrollWidth = container.scrollWidth
        const clientWidth = container.clientWidth

        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }, [])

    const scrollLeft = useCallback(() => {
        if (sectionNavigationRef.current) {
            sectionNavigationRef.current.scrollBy({
                left: -200,
                behavior: 'smooth',
            })
        }
    }, [])

    const scrollRight = useCallback(() => {
        if (sectionNavigationRef.current) {
            sectionNavigationRef.current.scrollBy({
                left: 200,
                behavior: 'smooth',
            })
        }
    }, [])

    useEffect(() => {
        checkScrollability()
        const container = sectionNavigationRef.current
        if (container) {
            container.addEventListener('scroll', checkScrollability)
            window.addEventListener('resize', checkScrollability)
            return () => {
                container.removeEventListener('scroll', checkScrollability)
                window.removeEventListener('resize', checkScrollability)
            }
        }
    }, [sections, activeSection, checkScrollability])

    useLayoutEffect(() => {
        checkScrollability()
    }, [sections, activeSection, checkScrollability])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleClose])

    const sectionNavigation = (
        <div className="wbk_form__sectionNavigationWrapper">
            {canScrollLeft && (
                <button
                    type="button"
                    onClick={scrollLeft}
                    className="wbk_form__sectionNavigationArrow"
                    aria-label={__('Scroll left', 'webba-booking-lite')}
                >
                    <img src={arrowLeftIcon} alt="" />
                </button>
            )}
            <div
                ref={sectionNavigationRef}
                className="wbk_form__sectionNavigation"
                onScroll={checkScrollability}
            >
                {Object.keys(sections).map(
                    (section) =>
                        sections[section].length > 0 && (
                            <button
                                key={section}
                                type="button"
                                onClick={() => setActiveSection(section)}
                                className={classNames(
                                    'wbk_form__sectionNavigationBtn',
                                    {
                                        'wbk_form__sectionNavigationBtn--active':
                                            activeSection === section,
                                    }
                                )}
                            >
                                <span
                                    className="wbk_form__sectionNavigationBtnText"
                                >
                                    {tabs?.[section]?.title ||
                                        capitalize(section)}
                                </span>
                            </button>
                        )
                )}
            </div>
            {canScrollRight && (
                <button
                    type="button"
                    onClick={scrollRight}
                    className="wbk_form__sectionNavigationArrow"
                    aria-label={__('Scroll right', 'webba-booking-lite')}
                >
                    <img src={arrowRightIcon} alt="" />
                </button>
            )}
        </div>
    )

    useLayoutEffect(() => {
        if (Object.keys(sections).length > 0 && !activeSection) {
            const firstSection = Object.keys(sections).filter(
                (section) => sections[section]?.length > 0
            )[0]

            if (firstSection) {
                setActiveSection(firstSection)
            }
        }
    }, [sectionNavigation, activeSection])

    const checkTabRequiredPlan = useMemo(() => {
        const currentFields = sections[activeSection] || []
        if (currentFields.length === 0) {
            return null
        }

        const fieldsWithRequiredPlan = currentFields.filter(
            (field) => field.required_plan
        )

        if (fieldsWithRequiredPlan.length === 0) {
            return null
        }

        if (fieldsWithRequiredPlan.length !== currentFields.length) {
            return null
        }

        const firstRequiredPlan = fieldsWithRequiredPlan[0].required_plan
        const allSamePlan = fieldsWithRequiredPlan.every(
            (field) => field.required_plan === firstRequiredPlan
        )

        if (!allSamePlan || !firstRequiredPlan) {
            return null
        }

        if (
            !plan_map ||
            typeof plan_map !== 'object' ||
            !firstRequiredPlan ||
            !(firstRequiredPlan in plan_map)
        ) {
            return null
        }

        const planValue = plan_map[firstRequiredPlan]

        if (planValue === true) {
            return null
        }

        return firstRequiredPlan
    }, [sections, activeSection, plan_map])

    const cloneElementWithSkipProLabel = useCallback(
        (element: React.ReactElement, skipProLabel: boolean): React.ReactElement => {
            if (!isValidElement(element)) {
                return element
            }

            const props = element.props as any

            const isInputWrapper =
                props?.fieldConfig !== undefined && props?.field !== undefined

            if (isInputWrapper) {
                return cloneElement(element, { skipProLabel } as any)
            }

            if (props?.children) {
                if (isValidElement(props.children)) {
                    const clonedChild = cloneElementWithSkipProLabel(
                        props.children,
                        skipProLabel
                    )
                    return cloneElement(element, {}, clonedChild) as React.ReactElement
                }

                if (Array.isArray(props.children)) {
                    const clonedChildren = props.children.map((child: any) => {
                        if (isValidElement(child)) {
                            return cloneElementWithSkipProLabel(child, skipProLabel)
                        }
                        return child
                    })
                    return cloneElement(element, {}, ...clonedChildren) as React.ReactElement
                }
            }

            return element
        },
        []
    )

    // Group fields by subsection
    const fieldsWithSubsections = useMemo(() => {
        const currentFields = sections[activeSection] || []
        const hasSubsections = currentFields.some((field) => field.subsection)

        if (!hasSubsections) {
            return null
        }

        const grouped: Record<string, ResolvedFormField[]> = {}
        const ungrouped: ResolvedFormField[] = []

        currentFields.forEach((field) => {
            if (field.subsection) {
                const subsectionKey = field.subsection
                if (!grouped[subsectionKey]) {
                    grouped[subsectionKey] = []
                }
                grouped[subsectionKey].push(field)
            } else {
                ungrouped.push(field)
            }
        })

        return { grouped, ungrouped }
    }, [sections, activeSection])

    return (
        <FormProvider form={form} tooltipMode={tooltipMode}>
            <div className="wbk_form__container">
                {shouldShowSections ? (
                    <>
                        {header}
                        {editorView !== 'tabular' && sectionNavigation}
                    </>
                ) : (
                    header
                )}
                <form
                    className="wbk_form__form"
                    onSubmit={(e) => submitHandler(e, false)}
                    id={id}
                >
                    {editorView === 'form' && (
                        <>
                            {fieldsWithSubsections ? (
                                <div className="wbk_form__fieldsWithSubsections">
                                    {checkTabRequiredPlan && (
                                        <ProFeatuerWrapper
                                            requiredPlans={[
                                                String(checkTabRequiredPlan),
                                            ]}
                                            additionalClasses="wbk_form__proFeatureWrapper"
                                            additionalButtonClasses="wbk_form__proFeatureButton"
                                        />
                                    )}
                                    {fieldsWithSubsections.ungrouped.length > 0 && (
                                        <div className="wbk_form__innerFieldsWrapper">
                                            {fieldsWithSubsections.ungrouped.map(
                                                (field) => (
                                                    <div
                                                        key={field.name}
                                                        className="wbk_form__fieldWrapper"
                                                    >
                                                        {checkTabRequiredPlan
                                                            ? cloneElementWithSkipProLabel(
                                                                field.element,
                                                                true
                                                            )
                                                            : field.element}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}

                                    {Object.entries(fieldsWithSubsections.grouped).map(
                                        ([subsectionKey, fields], index) => {
                                            const displayTitle =
                                                subsectionTitles?.[subsectionKey] ||
                                                capitalize(subsectionKey)
                                            return (
                                                <Accordion
                                                    key={subsectionKey}
                                                    title={displayTitle}
                                                    fields={fields.map((field) => ({
                                                        ...field,
                                                        element: checkTabRequiredPlan
                                                            ? cloneElementWithSkipProLabel(
                                                                field.element,
                                                                true
                                                            )
                                                            : field.element,
                                                    }))}
                                                    defaultOpen={index === 0}
                                                />
                                            )
                                        }
                                    )}
                                </div>
                            ) : (
                                <div className="wbk_form__innerFieldsWrapper">
                                    {(checkTabRequiredPlan ||
                                        tabs?.[activeSection]?.required_plan) && (
                                            <ProFeatuerWrapper
                                                requiredPlans={[
                                                    String(
                                                        checkTabRequiredPlan ||
                                                        tabs?.[activeSection]
                                                            ?.required_plan ||
                                                        ''
                                                    ),
                                                ]}
                                                additionalClasses="wbk_form__proFeatureWrapper"
                                                additionalButtonClasses="wbk_form__proFeatureButton"
                                            />
                                        )}
                                    {sections[activeSection]?.length > 0 &&
                                        sections[activeSection].map((field) => (
                                            <div
                                                key={field.name}
                                                className="wbk_form__fieldWrapper"
                                            >
                                                {checkTabRequiredPlan
                                                    ? cloneElementWithSkipProLabel(
                                                        field.element,
                                                        true
                                                    )
                                                    : field.element}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </>
                    )}
                    {editorView === 'tabular' && (
                        <TabularForm
                            sections={sections}
                            tabs={tabs}
                            subsectionTitles={subsectionTitles}
                            showSearch={showTabularSearch}
                        />
                    )}
                </form>
                <div className="wbk_form__buttons">
                    <div className="wbk_form__editButtons">
                        {onDelete && defaultValue?.can_delete !== false && (
                            <ConfirmationButton
                                icon={deleteIcon}
                                wrapperClass="wbk_form__closeBtn"
                                action={onDelete}
                                confirmationMessage={__(
                                    'Yes, delete it',
                                    'webba-booking-lite'
                                )}
                                position="left"
                            />
                        )}
                        {onDuplicate && (
                            <Button
                                onClick={onDuplicate}
                                className="wbk_form__closeBtn"
                                type="secondary"
                            >
                                <img src={duplicateIcon} />
                            </Button>
                        )}
                        {onReset && (
                            <Button
                                onClick={onReset}
                                className="wbk_form__resetButton"
                                type="secondary"
                            >
                                <img src={resetIcon} />
                                {__('Reset to defaults', 'webba-booking-lite')}
                            </Button>
                        )}
                    </div>
                    <Button
                        className="wbk_form__buttonCancel"
                        actionType="submit"
                        type="secondary"
                        form={id}
                        isLoading={busy && loadingButton === 'apply'}
                    >
                        {__('Apply', 'webba-booking-lite')}
                    </Button>
                    <Button
                        className="button-wb"
                        isLoading={busy && loadingButton === 'save-and-exit'}
                        onClick={() =>
                            submitHandler(new MouseEvent('click'), true)
                        }
                    >
                        {submitButtonIcon && (
                            <span className="wbk_form__submitButtonIconWrapper">
                                {submitButtonIcon}
                            </span>
                        )}
                        {submitButtonText ?? __('Save and exit', 'webba-booking-lite')}
                    </Button>
                </div>
            </div>
        </FormProvider>
    )
}
