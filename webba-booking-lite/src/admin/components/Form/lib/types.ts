import { ComponentType } from 'react'
import { Model } from '../../../types'
import { FormFieldMisc, FormFieldProps } from '../types'
import { ValidatorFn } from '../utils/validation'

export interface Primitive<T> {
    value: T
}

export type FormValueFromModel<
    T extends Model,
    P extends T['properties'] = T['properties'],
> = T extends Model
    ? {
          [K in keyof P]: any
      }
    : never

export type FormErrorsFromModel<
    T extends Model,
    P extends T['properties'] = T['properties'],
> = T extends Model
    ? {
          [K in keyof P]: string[]
      }
    : never

export interface CreateFieldParams<T> {
    name: string
    label: string
    defaultValue: T
    validators: ValidatorFn<T>[]
    required?: boolean
}

export interface FormField<T> {
    name: string
    label: string
    value: Primitive<T>
    validators: Primitive<ValidatorFn<T>[]>
    required: boolean
    errors: Primitive<string[]>
    isIgnored: Primitive<boolean>
    setValue: (value: T) => void
    setValidators: (valdiators: ValidatorFn<T>[]) => void
    addValidator: (validator: ValidatorFn<T>) => void
    resetValidators: () => void
}

export type UnwrapField<T extends FormField<any>> = T extends FormField<any>
    ? {
          [K in keyof T]: T[K] extends Primitive<infer P> ? P : T[K]
      }
    : never

export type UnwrappedField<T> = UnwrapField<FormField<T>>

export interface FormFromModel<T extends Model = any> {
    fields: FormStateFromModel<T>
    defaultValue: FormValueFromModel<T>
    dependencyMap: Record<string, Dependency[]>
    patchValue: (value: FormValueFromModel<T>) => void
    reset: () => void
    clear: () => void
}

export type FormStateFromModel<
    T extends Model,
    P extends T['properties'] = T['properties'],
> = T extends Model
    ? {
          [K in keyof P]: FormField<any>
      }
    : never

// export type FormValueFromModel<T extends Model> = {}
export interface FieldConfig {
    input_type: string
    misc?: FormFieldMisc
    modelName?: string
    prefix?: string
}

export interface FormComponentContstructorConfig<T> {
    field: FormField<T>
    fieldConfig: FieldConfig
}

export type FormComponentConstructor<
    T,
    P extends FormFieldProps = FormFieldProps,
> = (config: FormComponentContstructorConfig<T>) => ComponentType<P>

export type Operator = '=' | '!=' | '>' | '<'

type FieldName = string

type ToMatch = string

export type Dependency = [FieldName, Operator, ToMatch]
