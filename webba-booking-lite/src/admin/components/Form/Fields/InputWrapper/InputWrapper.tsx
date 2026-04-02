import { PropsWithChildren, useMemo, isValidElement, cloneElement, Fragment, useRef, useEffect, useState, Children } from 'react'
import { __, sprintf } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import './InputWrapper.scss'
import lockedIcon from '../../../../../../public/images/icon-lock.png'
import unlockIcon from '../../../../../../public/images/icon-lock-open.png'
import classNames from 'classnames'
import { processUpgradeMessage } from '../../../../../utilities/planHelper'
import { Toggle } from '../../../Toggle/Toggle'

export const InputWrapper = ({
    field,
    fieldConfig,
    children,
    skipProLabel = false,
}: PropsWithChildren<any> & { skipProLabel?: boolean }) => {
    const { admin_url, plan_map, wording } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

    const requiredPlan = fieldConfig?.misc?.required_plan as string
    const isToggleField = fieldConfig?.input_type === 'checkbox'
    const isTextareaField = fieldConfig?.input_type === 'textarea'
    const isFileField = fieldConfig?.input_type === 'file'
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({})
    
    const proLabelApplicable = useMemo(() => {
        if (skipProLabel) {
            return false
        }

        if (
            fieldConfig?.misc?.available_in_old_free &&
            plan_map?.old_free === true
        ) {
            return false
        }

        return (
            requiredPlan &&
            Object.keys(plan_map).includes(requiredPlan) &&
            plan_map[
                Object.keys(plan_map).find(
                    (plan: string) => plan === requiredPlan
                )
            ] !== true
        )
    }, [requiredPlan, plan_map, fieldConfig?.misc?.available_in_old_free, skipProLabel])

    if (proLabelApplicable) {
        field.resetValidators()
    }

    const requiredMessage =
        wording?.plan_required_message ||
        __('Available in #plan', 'webba-booking-lite')

    const renderProBadge = () => (
        <a
            className="wbk_inputWrapper__proBadge"
            href={sprintf(
                '%sadmin.php?page=wbk-main-pricing',
                admin_url
            )}
        >
            <img
                className="wbk_inputWrapper__badgeLocked"
                src={lockedIcon}
                alt={__('Locked Icon', 'webba-booking-lite')}
            />
            {processUpgradeMessage(
                [requiredPlan],
                plan_map,
                requiredMessage
            )}
        </a>
    )

    const cloneChildrenWithProBadge = () => {
        if (!isToggleField) {
            return children
        }

        const processChild = (child: any): any => {
            if (!isValidElement(child)) {
                return child
            }

            const childType = child.type as any
            const childProps = child.props as any
            
            const isFragment = childType === Fragment || 
                             (typeof childType === 'symbol' && childType.toString() === 'Symbol(react.fragment)')
            
            if (isFragment || Array.isArray(childProps)) {
                const fragmentChildren = Array.isArray(childProps) ? childProps : (childProps?.children || [])
                const processedChildren = Children.map(fragmentChildren, processChild)
                return <Fragment>{processedChildren}</Fragment>
            }
            
            const isToggleByReference = childType === Toggle
            const isToggleByProps = childProps && 
                                   typeof childProps === 'object' && 
                                   !Array.isArray(childProps) &&
                                   childProps !== null && 
                                   'value' in childProps && 
                                   typeof childProps.value === 'boolean' &&
                                   'onChange' in childProps && 
                                   'label' in childProps &&
                                   !('proBadge' in childProps)
            
            const isToggleComponent = isToggleByReference || isToggleByProps
            
            if (isToggleComponent) {
                return cloneElement(child, {
                    ...childProps,
                    proBadge: renderProBadge(),
                } as any)
            }

            if (childProps && typeof childProps === 'object' && childProps !== null && !Array.isArray(childProps) && 'children' in childProps) {
                const processedChildren = Children.map((childProps as any).children, processChild)
                return cloneElement(child, {
                    ...childProps,
                    children: processedChildren,
                } as any)
            }

            return child
        }

        const allChildren = Children.toArray(children)
        const processedChildren = allChildren.map(processChild)
        
        if (processedChildren.length === 0) {
            return children
        } else if (processedChildren.length === 1) {
            return processedChildren[0]
        } else {
            return <Fragment>{processedChildren}</Fragment>
        }
    }

    useEffect(() => {
        if (!proLabelApplicable || isToggleField || !wrapperRef.current) {
            return
        }

        const updateOverlayPosition = () => {
            const wrapper = wrapperRef.current
            if (!wrapper) return

            const fieldRoot = wrapper.firstElementChild as HTMLElement
            const lastContainer = fieldRoot?.lastElementChild as HTMLElement

            if (lastContainer) {
                const rect = lastContainer.getBoundingClientRect()
                const wrapperRect = wrapper.getBoundingClientRect()
                const top = rect.top - wrapperRect.top
                const left = rect.left - wrapperRect.left
                const width = rect.width
                const height = rect.height
                setOverlayStyle({
                    top: `${top}px`,
                    left: `${left}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                })
                return
            }

            setOverlayStyle({
                bottom: '0',
                left: '0',
                right: '0',
                height: '50px',
            })
        }

        updateOverlayPosition()
        const rafId = requestAnimationFrame(updateOverlayPosition)
        const delay50 = setTimeout(updateOverlayPosition, 50)
        const delay150 = setTimeout(updateOverlayPosition, 150)
        const delay400 = setTimeout(updateOverlayPosition, 400)

        window.addEventListener('resize', updateOverlayPosition)

        let resizeObserver: ResizeObserver | null = null
        const attachResizeObserver = () => {
            if (resizeObserver || !wrapperRef.current) return
            const fieldRoot = wrapperRef.current.firstElementChild as HTMLElement
            const lastContainer = fieldRoot?.lastElementChild as HTMLElement
            if (lastContainer) {
                resizeObserver = new ResizeObserver(() => {
                    requestAnimationFrame(updateOverlayPosition)
                })
                resizeObserver.observe(lastContainer)
            }
        }

        attachResizeObserver()

        const mutationObserver = new MutationObserver(() => {
            requestAnimationFrame(updateOverlayPosition)
            attachResizeObserver()
        })
        if (wrapperRef.current) {
            mutationObserver.observe(wrapperRef.current, { childList: true, subtree: true, attributes: true })
        }

        return () => {
            cancelAnimationFrame(rafId)
            clearTimeout(delay50)
            clearTimeout(delay150)
            clearTimeout(delay400)
            window.removeEventListener('resize', updateOverlayPosition)
            mutationObserver.disconnect()
            resizeObserver?.disconnect()
        }
    }, [proLabelApplicable, isToggleField, isTextareaField, isFileField])

    return (
        <div
            ref={wrapperRef}
            className={classNames('wbk_inputWrapper__wrapper', {
                'wbk_inputWrapper__wrapper--noLabel': !proLabelApplicable,
                'wbk_inputWrapper__wrapper--toggleField': isToggleField && proLabelApplicable,
                'wbk_inputWrapper__wrapper--hasProOverlay': proLabelApplicable && !isToggleField,
                'wbk_inputWrapper__wrapper--textareaField': isTextareaField && proLabelApplicable,
                'wbk_inputWrapper__wrapper--fileField': isFileField && proLabelApplicable,
            })}
        >
            {children}
            {proLabelApplicable && !isToggleField && (
                <div className="wbk_inputWrapper__proOverlay" style={overlayStyle}>
                    <a
                        className="wbk_inputWrapper__upgradeLink"
                        href={sprintf(
                            '%sadmin.php?page=wbk-main-pricing',
                            admin_url
                        )}
                    >
                        <img
                            className="wbk_inputWrapper__locked"
                            src={lockedIcon}
                            alt={__('Locked Icon', 'webba-booking-lite')}
                        />
                        <img
                            className="wbk_inputWrapper__unlock"
                            src={unlockIcon}
                            alt={__('Unlock Icon', 'webba-booking-lite')}
                        />
                        {processUpgradeMessage(
                            [requiredPlan],
                            plan_map,
                            requiredMessage
                        )}
                    </a>
                </div>
            )}
        </div>
    )
}
