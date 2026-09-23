export type WhatsAppTemplateStatus =
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED'
  | 'PAUSED'
  | 'DISABLED'
  | 'IN_APPEAL'
  | 'DELETED'
  | 'PENDING_DELETION'
  | 'LIMIT_EXCEEDED'
  | string

export type WhatsAppTemplateCategory =
  | 'UTILITY'
  | 'MARKETING'
  | 'AUTHENTICATION'
  | string

export interface WhatsAppTemplateComponent {
  type?: string
  text?: string
  format?: string
  example?: Record<string, unknown>
  buttons?: Record<string, unknown>[]
  [key: string]: unknown
}

export interface WhatsAppTemplateItem {
  id: string
  name: string
  language: string
  status: WhatsAppTemplateStatus
  category: WhatsAppTemplateCategory
  body_text: string
  components: WhatsAppTemplateComponent[]
  selection_value: string
  label: string
}

export interface WhatsAppTemplatesListResponse {
  status: 'success' | 'error'
  message?: string
  templates?: WhatsAppTemplateItem[]
}

export interface WhatsAppTemplateMutationResponse {
  status: 'success' | 'error'
  message?: string
  template?: Partial<WhatsAppTemplateItem> & {
    success?: boolean
  }
}

export interface WhatsAppTemplateSelectOption {
  value: string
  label: string
}

export interface WhatsAppTemplateFieldStatusMessage {
  type: 'success' | 'error'
  message: string
}
