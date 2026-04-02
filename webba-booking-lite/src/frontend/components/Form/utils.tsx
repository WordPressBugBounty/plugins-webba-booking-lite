import {
    IFieldConfig,
    IFieldConstructor,
    TFieldConstructor,
    ValidatorFn,
} from './types'
import { PhoneInput } from '../Fields/PhoneInput/PhoneInput'
import { EmailInput } from '../Fields/EmailInput/EmailInput'
import { FileInput } from '../Fields/FileInput/FileInput'
import { NumberInput } from '../Fields/NumberInput/NumberInput'
import { TextArea } from '../Fields/TextArea/TextArea'
import { Checkbox } from '../Fields/Checkbox/Checkbox'
import { TextInput } from '../Fields/TextInput/TextInput'
import { SelectInput } from '../Fields/SelectInput/SelectInput'
import { Validators } from './validation'
import { FormNotice } from '../FormNotice/FormNotice'
import { DescriptionField } from '../Fields/DescriptionField/DescriptionField'
import { RadioInput } from '../Fields/RadioInput/RadioInput'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'

export const createFormFields = (
    fields: IFieldConfig[],
    anyTouched?: boolean
) => {
    const fieldsElements: JSX.Element[] = []

    fields.forEach((fieldConfig: IFieldConfig) => {
        const fieldConstructor = constructField(fieldConfig)

        switch (fieldConstructor.type) {
            case 'text':
                fieldsElements.push(
                    <TextInput
                        key={fieldConstructor.slug}
                        fieldConstructor={fieldConstructor}
                        anyTouched={anyTouched}
                    />
                )
                break
            case 'email':
                fieldsElements.push(
                    <EmailInput
                        key={fieldConstructor.slug}
                        fieldConstructor={fieldConstructor}
                        anyTouched={anyTouched}
                    />
                )
                break
            case 'textarea':
                fieldsElements.push(
                    <TextArea
                        key={fieldConstructor.slug}
                        fieldConstructor={fieldConstructor}
                        anyTouched={anyTouched}
                    />
                )
                break
            case 'number':
                fieldsElements.push(
                    <NumberInput
                        key={fieldConstructor.slug}
                        fieldConstructor={fieldConstructor}
                        anyTouched={anyTouched}
                    />
                )
                break
            case 'phone':
                fieldsElements.push(
                    <PhoneInput
                        key={fieldConstructor.slug}
                        fieldConstructor={fieldConstructor}
                        anyTouched={anyTouched}
                    />
                )
                break
            case 'select':
            case 'dropdown':
                fieldsElements.push(
                    <SelectInput
                        key={fieldConstructor.slug}
                        fieldConstructor={fieldConstructor}
                        anyTouched={anyTouched}
                    />
                )
                break
            case 'checkbox':
                fieldsElements.push(
                    <Checkbox
                        key={fieldConstructor.slug}
                        fieldConstructor={fieldConstructor}
                        anyTouched={anyTouched}
                    />
                )
                break
            case 'file':
                fieldsElements.push(
                    <FileInput
                        key={fieldConstructor.slug}
                        fieldConstructor={fieldConstructor}
                        anyTouched={anyTouched}
                    />
                )
                break
            case 'radio':
                fieldsElements.push(
                    <RadioInput
                        key={fieldConstructor.slug}
                        fieldConstructor={fieldConstructor}
                        anyTouched={anyTouched}
                    />
                )
                break
            case 'description':
                fieldsElements.push(
                    <DescriptionField
                        key={fieldConstructor.slug}
                        fieldConstructor={fieldConstructor}
                        anyTouched={anyTouched}
                    />
                )
                break
            default:
                fieldsElements.push(
                    <TextInput
                        key={fieldConstructor.slug}
                        fieldConstructor={fieldConstructor}
                        anyTouched={anyTouched}
                    />
                )
        }
    })

    return fieldsElements
}

export const constructField = (
    fieldConfig: IFieldConfig
): IFieldConstructor => {
    const field = fieldConfig

    const addValidators = (validators: ValidatorFn<any>[]) => {
        field.validators = [...(field.validators || []), ...validators]
    }

    return {
        ...fieldConfig,
        addValidators,
        validators: [...(field.required ? [Validators.required] : [])],
        name: fieldConfig.slug,
    }
}
