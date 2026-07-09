import { useCallback, useEffect, useMemo, useState } from 'react'
import { __ } from '@wordpress/i18n'
import { useDispatch } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { Toggle } from '../Toggle/Toggle'
import type { SetupChecklistEmailTemplate } from './types'
import './EmailNotificationsStepContent.scss'

interface EmailNotificationsStepContentProps {
    templates: SetupChecklistEmailTemplate[]
    actionUrl: string
    guideUrl: string
}

export const EmailNotificationsStepContent = ({
    templates,
    actionUrl,
    guideUrl,
}: EmailNotificationsStepContentProps) => {
    const { saveSetupChecklistEmailNotifications } = useDispatch(store_name) as {
        saveSetupChecklistEmailNotifications: (
            templates: { id: number; enabled: boolean }[]
        ) => Promise<{ status?: string }>
    }

    const [enabledById, setEnabledById] = useState<Record<number, boolean>>({})
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const initialState: Record<number, boolean> = {}
        templates.forEach((template) => {
            initialState[template.id] = template.enabled
        })
        setEnabledById(initialState)
    }, [templates])

    const hasChanges = useMemo(() => {
        return templates.some(
            (template) => enabledById[template.id] !== template.enabled
        )
    }, [enabledById, templates])

    const handleToggle = useCallback((templateId: number, enabled: boolean) => {
        setEnabledById((current) => ({
            ...current,
            [templateId]: enabled,
        }))
    }, [])

    const handleConfirm = useCallback(async () => {
        setIsSaving(true)
        try {
            const payload = templates.map((template) => ({
                id: template.id,
                enabled: enabledById[template.id] ?? false,
            }))
            await saveSetupChecklistEmailNotifications(payload)
        } finally {
            setIsSaving(false)
        }
    }, [enabledById, saveSetupChecklistEmailNotifications, templates])

    const getRecipientBadgeClass = (recipient: string) => {
        if (recipient === 'customer') {
            return 'wbk_emailNotificationsStep__badge--customer'
        }
        if (recipient === 'admin') {
            return 'wbk_emailNotificationsStep__badge--admin'
        }
        return 'wbk_emailNotificationsStep__badge--default'
    }

    if (!templates.length) {
        return (
            <div className="wbk_emailNotificationsStep">
                <p className="wbk_emailNotificationsStep__empty">
                    {__(
                        'No email templates found. Create templates on the Email Notifications page.',
                        'webba-booking-lite'
                    )}
                </p>
                <div className="wbk_emailNotificationsStep__actionRow">
                    <a
                        className="wbk_emailNotificationsStep__primaryButton"
                        href={actionUrl}
                    >
                        {__('Go to Email Notifications', 'webba-booking-lite')}
                    </a>
                    {guideUrl && (
                        <a
                            className="wbk_emailNotificationsStep__secondaryLink"
                            href={guideUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {__('View Guide', 'webba-booking-lite')}
                        </a>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="wbk_emailNotificationsStep">
            <ul className="wbk_emailNotificationsStep__list">
                {templates.map((template) => (
                    <li
                        key={template.id}
                        className="wbk_emailNotificationsStep__item"
                    >
                        <div className="wbk_emailNotificationsStep__itemInfo">
                            <span className="wbk_emailNotificationsStep__itemName">
                                {template.name}
                            </span>
                            <span className="wbk_emailNotificationsStep__itemTrigger">
                                {template.type_label}
                            </span>
                            {template.recipients.length > 0 && (
                                <div className="wbk_emailNotificationsStep__badges">
                                    {template.recipients.map((recipient, index) => (
                                        <span
                                            key={`${template.id}-${recipient}`}
                                            className={`wbk_emailNotificationsStep__badge ${getRecipientBadgeClass(recipient)}`}
                                        >
                                            {template.recipient_labels[index] ||
                                                recipient}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Toggle
                            name={`email-template-${template.id}`}
                            value={enabledById[template.id] ?? false}
                            onChange={(enabled) =>
                                handleToggle(template.id, enabled)
                            }
                        />
                    </li>
                ))}
            </ul>
            <div className="wbk_emailNotificationsStep__actionRow">
                <button
                    type="button"
                    className="wbk_emailNotificationsStep__primaryButton"
                    onClick={handleConfirm}
                    disabled={isSaving}
                >
                    {isSaving
                        ? __('Saving...', 'webba-booking-lite')
                        : __('Confirm', 'webba-booking-lite')}
                </button>
                <a
                    className="wbk_emailNotificationsStep__secondaryLink"
                    href={actionUrl}
                >
                    {__('Manage templates', 'webba-booking-lite')}
                </a>
                {guideUrl && (
                    <a
                        className="wbk_emailNotificationsStep__secondaryLink"
                        href={guideUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {__('View Guide', 'webba-booking-lite')}
                    </a>
                )}
            </div>
            {hasChanges && (
                <p className="wbk_emailNotificationsStep__hint">
                    {__(
                        'Click Confirm to save your choices and complete this step.',
                        'webba-booking-lite'
                    )}
                </p>
            )}
        </div>
    )
}
