import apiFetch from '@wordpress/api-fetch'
import { __ } from '@wordpress/i18n'
import { FormFromModel } from '../../lib/types'
import { getFormState } from '../../lib/utils'
import { fetchConnectedOptions } from '../GenericSelectField/utils'
import {
    WhatsAppValidateTokenResponse,
    WHATSAPP_CREDENTIALS_UPDATED_EVENT,
} from './types'

const BUSINESS_ACCOUNT_FIELD = 'wbk_whatsapp_business_account_id'
const PHONE_NUMBER_FIELD = 'wbk_whatsapp_phone_number_id'

type ApplyWhatsAppTokenValidationParams = {
    accessToken: string
    form: FormFromModel<any>
    setFieldOptions: (model: string, field: string, payload: unknown) => void
}

type ApplyWhatsAppTokenValidationResult = {
    success: boolean
    message: string
}

export const applyWhatsAppTokenValidation = async ({
    accessToken,
    form,
    setFieldOptions,
}: ApplyWhatsAppTokenValidationParams): Promise<ApplyWhatsAppTokenValidationResult> => {
    const token = String(accessToken || '').trim()
    if (token === '') {
        return {
            success: false,
            message: __('Please connect WhatsApp first.', 'webba-booking-lite'),
        }
    }

    const result = (await apiFetch({
        path: '/wbk/v2/whatsapp-validate-token/',
        method: 'POST',
        data: {
            access_token: token,
        },
    })) as WhatsAppValidateTokenResponse

    if (result?.status !== 'success' || !result.data) {
        return {
            success: false,
            message:
                result?.message ||
                __(
                    'Failed to validate WhatsApp access token.',
                    'webba-booking-lite'
                ),
        }
    }

    const {
        business_account_id,
        phone_number_id,
        business_account_options,
        phone_number_options,
    } = result.data

    const hasBusinessOptions =
        business_account_options &&
        !Array.isArray(business_account_options) &&
        Object.keys(business_account_options).length > 0
    const hasPhoneOptions =
        phone_number_options &&
        !Array.isArray(phone_number_options) &&
        Object.keys(phone_number_options).length > 0

    if (hasBusinessOptions) {
        setFieldOptions('settings', BUSINESS_ACCOUNT_FIELD, {
            settings: {
                [BUSINESS_ACCOUNT_FIELD]: business_account_options,
            },
        })
    }

    if (hasPhoneOptions) {
        setFieldOptions('settings', PHONE_NUMBER_FIELD, {
            settings: {
                [PHONE_NUMBER_FIELD]: phone_number_options,
            },
        })
    }

    if (business_account_id && form.fields[BUSINESS_ACCOUNT_FIELD]) {
        form.fields[BUSINESS_ACCOUNT_FIELD].setValue(business_account_id)
    }
    if (phone_number_id && form.fields[PHONE_NUMBER_FIELD]) {
        form.fields[PHONE_NUMBER_FIELD].setValue(phone_number_id)
    }

    if (business_account_id) {
        const formValues = getFormState(form).values as Record<string, string>
        await fetchConnectedOptions('settings', BUSINESS_ACCOUNT_FIELD, {
            ...formValues,
            wbk_whatsapp_access_token: token,
            [BUSINESS_ACCOUNT_FIELD]: business_account_id,
            [PHONE_NUMBER_FIELD]: phone_number_id || '',
        })
    }

    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent(WHATSAPP_CREDENTIALS_UPDATED_EVENT, {
                detail: {
                    businessAccountId: business_account_id,
                    phoneNumberId: phone_number_id,
                },
            })
        )
    }

    return {
        success: true,
        message:
            result.message ||
            __(
                'WhatsApp account loaded successfully.',
                'webba-booking-lite'
            ),
    }
}
