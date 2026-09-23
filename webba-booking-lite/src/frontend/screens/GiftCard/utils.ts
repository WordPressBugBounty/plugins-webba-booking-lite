import { MouseEvent } from 'react'
import { __ } from '@wordpress/i18n'
import { fromZonedTime } from 'date-fns-tz'
import { IFieldConfig } from '../../components/Form/types'
import { DEFAULT_GIFT_CARD_DESIGN } from './giftCardDesigns'

export const todayIsoDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export const openNativeDatePicker = (event: MouseEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    try {
        if (typeof input.showPicker === 'function') {
            input.showPicker()
        }
    } catch {
        // showPicker can throw when unsupported or blocked; fall back to native behavior
    }
}

export const amountValidator = (value: unknown) => {
    const amount = Number(String(value).replace(',', '.'))
    if (!Number.isFinite(amount) || amount <= 0) {
        return __('Please enter a valid amount', 'webba-booking-lite')
    }
    return true
}

export const getGiftCardPresetAmounts = (preset: {
    settings?: { gift_card_preset_amounts?: unknown }
}): number[] => {
    const raw = preset?.settings?.gift_card_preset_amounts
    const fallback = [50, 75, 100, 150, 200]
    if (!Array.isArray(raw)) {
        return fallback
    }

    const amounts = raw
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)

    return amounts.length > 0 ? amounts : fallback
}

export const isGiftCardCustomAmountAllowed = (preset: {
    settings?: { gift_card_allow_custom_amount?: boolean }
}): boolean => preset?.settings?.gift_card_allow_custom_amount !== false

export const getGiftCardPolicyHtml = (preset: {
    settings?: { gift_card_policy?: unknown }
}): string => {
    const raw = preset?.settings?.gift_card_policy
    if (typeof raw !== 'string') {
        return ''
    }

    const text = raw
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    return text === '' ? '' : raw
}

export const currentIsoTime = () => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
    ).padStart(2, '0')}`
}

export const browserTimezone = () =>
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

export const composeGiftCardSendOn = (
    date: string,
    time: string
): string => {
    const normalizedTime = time.length === 5 ? `${time}:00` : time
    return `${date} ${normalizedTime}`
}

export const giftCardSendOnPayload = (
    sendTiming: string,
    date: string,
    time: string
): string | number => {
    if (sendTiming !== 'later') {
        return Math.floor(Date.now() / 1000)
    }

    return composeGiftCardSendOn(date, time)
}

export const validateGiftCardSendOn = (
    date: string,
    time: string,
    timezone: string
): string | null => {
    if (!date) {
        return __('Please select a send date', 'webba-booking-lite')
    }
    if (!time) {
        return __('Please select a send time', 'webba-booking-lite')
    }
    if (!timezone) {
        return __('Please select a time zone', 'webba-booking-lite')
    }

    try {
        const scheduled = fromZonedTime(
            composeGiftCardSendOn(date, time).replace(' ', 'T'),
            timezone
        )
        if (
            Number.isNaN(scheduled.getTime()) ||
            scheduled.getTime() < Date.now() - 120000
        ) {
            return __('Send date cannot be in the past', 'webba-booking-lite')
        }
    } catch {
        return __(
            'Please select a valid send date and time',
            'webba-booking-lite'
        )
    }

    return null
}

export const formatGiftCardSendDateTime = (
    date: string,
    time: string,
    timezone: string
): string => {
    if (!date || !time) {
        return ''
    }

    try {
        const utcDate = fromZonedTime(
            composeGiftCardSendOn(date, time).replace(' ', 'T'),
            timezone
        )
        return utcDate.toLocaleString(undefined, {
            timeZone: timezone || undefined,
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZoneName: 'short',
        })
    } catch {
        return timezone ? `${date} ${time} (${timezone})` : `${date} ${time}`
    }
}

export const buildGiftCardFields = (initialAmount = ''): IFieldConfig[] => [
    {
        slug: 'amount',
        placeholder: __('Custom amount', 'webba-booking-lite'),
        required: true,
        value: initialAmount,
        type: 'price',
        width: 'full-width',
        validators: [amountValidator],
    },
    {
        slug: 'design',
        placeholder: __('Choose Gift Card design', 'webba-booking-lite'),
        required: true,
        value: DEFAULT_GIFT_CARD_DESIGN,
        type: 'text',
        width: 'full-width',
    },
    {
        slug: 'recipient_name',
        placeholder: __('Recipient name', 'webba-booking-lite'),
        required: true,
        value: '',
        type: 'text',
        width: 'half-width',
    },
    {
        slug: 'recipient_email',
        placeholder: __('Recipient email', 'webba-booking-lite'),
        required: true,
        value: '',
        type: 'email',
        width: 'half-width',
    },
    {
        slug: 'message',
        placeholder: __('Message to the recipient (optional)', 'webba-booking-lite'),
        required: false,
        value: '',
        type: 'textarea',
        width: 'full-width',
        maxLength: 500,
    },
    {
        slug: 'send_timing',
        placeholder: '',
        required: true,
        value: 'now',
        defaultValue: 'now',
        type: 'radio',
        width: 'full-width',
        options: [
            {
                value: 'now',
                label: __('Send now', 'webba-booking-lite'),
            },
            {
                value: 'later',
                label: __('Schedule for later', 'webba-booking-lite'),
            },
        ],
    },
    {
        slug: 'buyer_name',
        placeholder: __('Your name', 'webba-booking-lite'),
        required: true,
        value: '',
        type: 'text',
        width: 'half-width',
    },
    {
        slug: 'buyer_email',
        placeholder: __('Your email', 'webba-booking-lite'),
        required: true,
        value: '',
        type: 'email',
        width: 'half-width',
    },
]
