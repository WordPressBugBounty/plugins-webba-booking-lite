export const WHATSAPP_CREDENTIALS_UPDATED_EVENT =
  'wbk-whatsapp-credentials-updated'

export interface WhatsAppValidateTokenResponse {
  status: 'success' | 'error'
  message?: string
  data?: {
    valid?: boolean
    business_account_id?: string
    phone_number_id?: string
    business_account_options?: Record<string, string>
    phone_number_options?: Record<string, string>
  }
}
