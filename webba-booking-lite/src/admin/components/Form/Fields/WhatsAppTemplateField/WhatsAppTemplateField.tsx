import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Select from 'react-select'
import apiFetch from '@wordpress/api-fetch'
import { __ } from '@wordpress/i18n'
import { useSnapshot } from 'valtio'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { useField } from '../../lib/hooks/useField'
import { useForm } from '../../lib/FormProvider'
import { Label } from '../Label/Label'
import { WHATSAPP_CREDENTIALS_UPDATED_EVENT } from '../WhatsAppValidateField/types'
import plusIcon from '../../../../../../public/images/icon-plus-green.svg'
import {
  WhatsAppTemplateFieldStatusMessage,
  WhatsAppTemplateItem,
  WhatsAppTemplateMutationResponse,
  WhatsAppTemplateSelectOption,
  WhatsAppTemplatesListResponse,
} from './types'
import './WhatsAppTemplateField.scss'

const CATEGORY_OPTIONS: WhatsAppTemplateSelectOption[] = [
  { value: 'UTILITY', label: 'UTILITY' },
  { value: 'MARKETING', label: 'MARKETING' },
  { value: 'AUTHENTICATION', label: 'AUTHENTICATION' },
]

const getStatusClassName = (status: string) => {
  const normalized = String(status || '').toUpperCase()
  if (normalized === 'APPROVED') {
    return 'wbk_whatsappTemplateField__statusBadge--approved'
  }
  if (normalized === 'PENDING' || normalized === 'IN_APPEAL') {
    return 'wbk_whatsappTemplateField__statusBadge--pending'
  }
  if (
    normalized === 'REJECTED' ||
    normalized === 'DISABLED' ||
    normalized === 'DELETED'
  ) {
    return 'wbk_whatsappTemplateField__statusBadge--rejected'
  }
  return 'wbk_whatsappTemplateField__statusBadge--neutral'
}

export const createWhatsAppTemplateField: FormComponentConstructor<string> = ({
  field,
}) => {
  return ({ name, label, misc }: FormFieldProps) => {
    const form = useForm()
    const { value, setValue } = useField(field)
    const businessAccountField = form.fields.wbk_whatsapp_business_account_id
    const businessAccountSnapshot = businessAccountField
      ? useSnapshot(businessAccountField.value)
      : { value: '' }
    const businessAccountId = String(
      businessAccountSnapshot.value ||
        form.defaultValue?.wbk_whatsapp_business_account_id ||
        ''
    )
    const selectedBusinessAccountRef = useRef(businessAccountId)
    selectedBusinessAccountRef.current = businessAccountId
    const [templates, setTemplates] = useState<WhatsAppTemplateItem[]>([])
    const [selectedTemplate, setSelectedTemplate] =
      useState<WhatsAppTemplateItem | null>(null)
    const [isCreateMode, setIsCreateMode] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [bodyText, setBodyText] = useState('')
    const [originalBodyText, setOriginalBodyText] = useState('')
    const [newTemplateName, setNewTemplateName] = useState('')
    const [newTemplateLanguage, setNewTemplateLanguage] = useState('en_US')
    const [newTemplateCategory, setNewTemplateCategory] = useState('UTILITY')
    const [statusMessage, setStatusMessage] =
      useState<WhatsAppTemplateFieldStatusMessage | null>(null)
    const selectedValueRef = useRef(value)
    selectedValueRef.current = value

    const loadTemplates = useCallback(
      async (preferredSelection?: string) => {
        setIsLoading(true)
        setStatusMessage(null)

        const accountId = String(
          selectedBusinessAccountRef.current || ''
        ).trim()

        if (!accountId || accountId === 'wbk_null' || accountId === '0') {
          setTemplates([])
          setStatusMessage({
            type: 'error',
            message: __(
              'Select a WhatsApp business account to load templates.',
              'webba-booking-lite'
            ),
          })
          setIsLoading(false)
          return
        }

        try {
          const result = (await apiFetch({
            path: `/wbk/v2/whatsapp-templates/?business_account_id=${encodeURIComponent(
              accountId
            )}`,
            method: 'GET',
          })) as WhatsAppTemplatesListResponse

          if (result?.status !== 'success') {
            setTemplates([])
            setStatusMessage({
              type: 'error',
              message:
                result?.message ||
                __('Failed to load WhatsApp templates.', 'webba-booking-lite'),
            })
            return
          }

          const nextTemplates = Array.isArray(result.templates)
            ? result.templates
            : []
          setTemplates(nextTemplates)

          if (nextTemplates.length === 0) {
            setStatusMessage({
              type: 'error',
              message: __(
                'No templates found for this WhatsApp business account. Create one with +, or switch to another business account that already has templates.',
                'webba-booking-lite'
              ),
            })
          }

          const selectionToUse =
            preferredSelection || String(selectedValueRef.current || '')
          const matched = nextTemplates.find(
            (template) => template.selection_value === selectionToUse
          )

          if (matched) {
            setIsCreateMode(false)
            setSelectedTemplate(matched)
            setBodyText(matched.body_text || '')
            setOriginalBodyText(matched.body_text || '')
            setValue(matched.selection_value)
          } else if (!preferredSelection && !selectedValueRef.current) {
            setSelectedTemplate(null)
            setBodyText('')
            setOriginalBodyText('')
          }
        } catch (error: any) {
          setTemplates([])
          setStatusMessage({
            type: 'error',
            message:
              error?.message ||
              __('Failed to load WhatsApp templates.', 'webba-booking-lite'),
          })
        } finally {
          setIsLoading(false)
        }
      },
      [setValue]
    )

    useEffect(() => {
      if (
        !businessAccountId ||
        businessAccountId === 'wbk_null' ||
        businessAccountId === '0'
      ) {
        setTemplates([])
        setStatusMessage({
          type: 'error',
          message: __(
            'Select a WhatsApp business account to load templates.',
            'webba-booking-lite'
          ),
        })
        return
      }

      void loadTemplates()
    }, [businessAccountId, loadTemplates])

    useEffect(() => {
      const handleCredentialsUpdated = () => {
        void loadTemplates()
      }

      window.addEventListener(
        WHATSAPP_CREDENTIALS_UPDATED_EVENT,
        handleCredentialsUpdated
      )

      return () => {
        window.removeEventListener(
          WHATSAPP_CREDENTIALS_UPDATED_EVENT,
          handleCredentialsUpdated
        )
      }
    }, [loadTemplates])

    const selectOptions = useMemo<WhatsAppTemplateSelectOption[]>(() => {
      return templates.map((template) => ({
        value: template.selection_value,
        label: `${template.label} — ${template.status || 'UNKNOWN'}`,
      }))
    }, [templates])

    const selectedOption = useMemo(() => {
      if (isCreateMode) {
        return null
      }
      return (
        selectOptions.find((option) => option.value === String(value || '')) ||
        null
      )
    }, [isCreateMode, selectOptions, value])

    const hasBodyChanges =
      !isCreateMode &&
      selectedTemplate !== null &&
      bodyText.trim() !== originalBodyText.trim()

    const handleSelectTemplate = (option: WhatsAppTemplateSelectOption | null) => {
      setStatusMessage(null)
      setIsCreateMode(false)

      if (!option) {
        setSelectedTemplate(null)
        setBodyText('')
        setOriginalBodyText('')
        setValue('')
        return
      }

      const matched = templates.find(
        (template) => template.selection_value === option.value
      )
      if (!matched) {
        return
      }

      setSelectedTemplate(matched)
      setBodyText(matched.body_text || '')
      setOriginalBodyText(matched.body_text || '')
      setValue(matched.selection_value)
    }

    const handleStartCreate = () => {
      setStatusMessage(null)
      setIsCreateMode(true)
      setSelectedTemplate(null)
      setBodyText('')
      setOriginalBodyText('')
      setNewTemplateName('')
      setNewTemplateLanguage('en_US')
      setNewTemplateCategory('UTILITY')
    }

    const handleCancelCreate = () => {
      setIsCreateMode(false)
      setStatusMessage(null)
      if (value) {
        loadTemplates(String(value))
      } else {
        setBodyText('')
        setOriginalBodyText('')
        setSelectedTemplate(null)
      }
    }

    const handleSubmit = async () => {
      setStatusMessage(null)

      if (!bodyText.trim()) {
        setStatusMessage({
          type: 'error',
          message: __('Template body text is required.', 'webba-booking-lite'),
        })
        return
      }

      setIsSubmitting(true)

      try {
        if (isCreateMode) {
          if (!newTemplateName.trim()) {
            setStatusMessage({
              type: 'error',
              message: __(
                'Template name is required.',
                'webba-booking-lite'
              ),
            })
            setIsSubmitting(false)
            return
          }

          const result = (await apiFetch({
            path: '/wbk/v2/whatsapp-templates/create/',
            method: 'POST',
            data: {
              name: newTemplateName.trim(),
              language: newTemplateLanguage.trim() || 'en_US',
              category: newTemplateCategory,
              body_text: bodyText.trim(),
            },
          })) as WhatsAppTemplateMutationResponse

          if (result?.status !== 'success') {
            setStatusMessage({
              type: 'error',
              message:
                result?.message ||
                __(
                  'Failed to create WhatsApp template.',
                  'webba-booking-lite'
                ),
            })
            return
          }

          const selectionValue =
            result.template?.selection_value ||
            `${newTemplateName.trim()}|||${newTemplateLanguage.trim() || 'en_US'}`
          setValue(selectionValue)
          setIsCreateMode(false)
          setStatusMessage({
            type: 'success',
            message:
              result.message ||
              __('Template submitted for approval.', 'webba-booking-lite'),
          })
          await loadTemplates(selectionValue)
          return
        }

        if (!selectedTemplate?.id) {
          setStatusMessage({
            type: 'error',
            message: __(
              'Please select a template first.',
              'webba-booking-lite'
            ),
          })
          return
        }

        const result = (await apiFetch({
          path: '/wbk/v2/whatsapp-templates/update/',
          method: 'POST',
          data: {
            id: selectedTemplate.id,
            body_text: bodyText.trim(),
            category: selectedTemplate.category || '',
            components: selectedTemplate.components || [],
          },
        })) as WhatsAppTemplateMutationResponse

        if (result?.status !== 'success') {
          setStatusMessage({
            type: 'error',
            message:
              result?.message ||
              __(
                'Failed to update WhatsApp template.',
                'webba-booking-lite'
              ),
          })
          return
        }

        setOriginalBodyText(bodyText.trim())
        setStatusMessage({
          type: 'success',
          message:
            result.message ||
            __(
              'Template update submitted for approval.',
              'webba-booking-lite'
            ),
        })
        await loadTemplates(selectedTemplate.selection_value)
      } catch (error: any) {
        setStatusMessage({
          type: 'error',
          message:
            error?.message ||
            __('Failed to submit WhatsApp template.', 'webba-booking-lite'),
        })
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <div className="wbk_whatsappTemplateField">
        {label && (
          <Label title={label} id={name} tooltip={misc?.tooltip} />
        )}

        <div className="wbk_whatsappTemplateField__toolbar">
          <div className="wbk_whatsappTemplateField__selectWrap">
            <Select
              className="wbk_whatsappTemplateField__select"
              classNamePrefix="wbk_whatsappTemplateFieldSelect"
              inputId={name}
              isClearable
              isDisabled={isLoading || isSubmitting || isCreateMode}
              isLoading={isLoading}
              options={selectOptions}
              value={selectedOption}
              placeholder={__(
                'Select a WhatsApp template',
                'webba-booking-lite'
              )}
              noOptionsMessage={() =>
                isLoading
                  ? __('Loading templates...', 'webba-booking-lite')
                  : __(
                      'No templates for this business account',
                      'webba-booking-lite'
                    )
              }
              onChange={(option) =>
                handleSelectTemplate(
                  option as WhatsAppTemplateSelectOption | null
                )
              }
            />
          </div>
          <button
            type="button"
            className="wbk_whatsappTemplateField__addButton"
            onClick={handleStartCreate}
            disabled={isLoading || isSubmitting}
            aria-label={__('Add WhatsApp template', 'webba-booking-lite')}
            title={__('Add WhatsApp template', 'webba-booking-lite')}
          >
            <img src={plusIcon} alt="" />
          </button>
        </div>

        {isCreateMode && (
          <div className="wbk_whatsappTemplateField__createPanel">
            <div className="wbk_whatsappTemplateField__createGrid">
              <div className="wbk_whatsappTemplateField__fieldGroup">
                <label className="wbk_whatsappTemplateField__fieldLabel">
                  {__('Template name', 'webba-booking-lite')}
                </label>
                <input
                  type="text"
                  className="wbk_whatsappTemplateField__input"
                  value={newTemplateName}
                  placeholder="booking_confirmation"
                  onChange={(event) => setNewTemplateName(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="wbk_whatsappTemplateField__fieldGroup">
                <label className="wbk_whatsappTemplateField__fieldLabel">
                  {__('Language', 'webba-booking-lite')}
                </label>
                <input
                  type="text"
                  className="wbk_whatsappTemplateField__input"
                  value={newTemplateLanguage}
                  placeholder="en_US"
                  onChange={(event) =>
                    setNewTemplateLanguage(event.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="wbk_whatsappTemplateField__fieldGroup">
                <label className="wbk_whatsappTemplateField__fieldLabel">
                  {__('Category', 'webba-booking-lite')}
                </label>
                <Select
                  className="wbk_whatsappTemplateField__categorySelect"
                  classNamePrefix="wbk_whatsappTemplateFieldSelect"
                  isDisabled={isSubmitting}
                  options={CATEGORY_OPTIONS}
                  value={
                    CATEGORY_OPTIONS.find(
                      (option) => option.value === newTemplateCategory
                    ) || CATEGORY_OPTIONS[0]
                  }
                  onChange={(option) =>
                    setNewTemplateCategory(
                      (option as WhatsAppTemplateSelectOption)?.value ||
                        'UTILITY'
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}

        {(isCreateMode || selectedTemplate) && (
          <div className="wbk_whatsappTemplateField__editor">
            {!isCreateMode && selectedTemplate && (
              <div className="wbk_whatsappTemplateField__metaRow">
                <span
                  className={`wbk_whatsappTemplateField__statusBadge ${getStatusClassName(
                    selectedTemplate.status
                  )}`}
                >
                  {selectedTemplate.status || 'UNKNOWN'}
                </span>
                {selectedTemplate.category && (
                  <span className="wbk_whatsappTemplateField__metaChip">
                    {selectedTemplate.category}
                  </span>
                )}
                {selectedTemplate.status !== 'APPROVED' && (
                  <span className="wbk_whatsappTemplateField__metaHint">
                    {__(
                      'Only APPROVED templates can be sent to customers.',
                      'webba-booking-lite'
                    )}
                  </span>
                )}
              </div>
            )}

            <label className="wbk_whatsappTemplateField__fieldLabel">
              {__('Template body', 'webba-booking-lite')}
            </label>
            <textarea
              className="wbk_whatsappTemplateField__textarea"
              rows={5}
              value={bodyText}
              placeholder={__(
                'Hello {{1}}, your booking for {{2}} on {{3}} at {{4}} is confirmed.',
                'webba-booking-lite'
              )}
              onChange={(event) => setBodyText(event.target.value)}
              disabled={isSubmitting}
            />

            <div className="wbk_whatsappTemplateField__actions">
              {isCreateMode && (
                <button
                  type="button"
                  className="wbk_whatsappTemplateField__secondaryButton"
                  onClick={handleCancelCreate}
                  disabled={isSubmitting}
                >
                  {__('Cancel', 'webba-booking-lite')}
                </button>
              )}
              <button
                type="button"
                className="wbk_whatsappTemplateField__primaryButton"
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  isLoading ||
                  (!isCreateMode && !hasBodyChanges)
                }
              >
                {isSubmitting
                  ? __('Submitting...', 'webba-booking-lite')
                  : isCreateMode
                    ? __('Submit for approval', 'webba-booking-lite')
                    : __('Submit changes for approval', 'webba-booking-lite')}
              </button>
              {!isCreateMode && (
                <button
                  type="button"
                  className="wbk_whatsappTemplateField__secondaryButton"
                  onClick={() =>
                    loadTemplates(selectedTemplate?.selection_value)
                  }
                  disabled={isSubmitting || isLoading}
                >
                  {__('Refresh status', 'webba-booking-lite')}
                </button>
              )}
            </div>
          </div>
        )}

        {statusMessage && (
          <p
            className={`wbk_whatsappTemplateField__message wbk_whatsappTemplateField__message--${statusMessage.type}`}
          >
            {statusMessage.message}
          </p>
        )}
      </div>
    )
  }
}
