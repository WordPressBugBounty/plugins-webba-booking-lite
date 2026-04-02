import classNames from 'classnames'
import { useField } from '../../Form/hooks/useField'
import { IFieldProps } from '../../Form/types'
import './PhoneInput.scss'
import { Validators } from '../../Form/validation'
import 'react-phone-number-input/style.css'
import PhoneInputLib from 'react-phone-number-input'
import { Country } from 'react-phone-number-input'
import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import { useLocale } from '../../../hooks/useLocale'
import { timezoneToCountry } from '../../../../utilities/timezones'

export const PhoneInput = ({ fieldConstructor, anyTouched }: IFieldProps) => {
    fieldConstructor.addValidators([Validators.phone])
    const { placeholder, value, errors, setValue, touched, setTouched, width } =
        useField(fieldConstructor)
    const { localeCode } = useLocale()

    const defaultCountry = useMemo(() => {
        return (
            timezoneToCountry[
                Intl.DateTimeFormat().resolvedOptions().timeZone
            ] ||
            (localeCode as Country) ||
            'US'
        )
    }, [])

    const showError = errors && errors.length > 0 && (anyTouched || touched)

    return (
        <div
            className={classNames('wbk_input wbk_input__phone', {
                'wbk_input--half-width': width === 'half-width',
            })}
        >
            <PhoneInputLib
                placeholder={placeholder || 'Enter phone number'}
                value={value as string}
                onChange={(value) => setValue(value as string)}
                onBlur={() => setTouched(true)}
                className={classNames(
                    'wbk_input__main wbk_input__phone__input',
                    {
                        'wbk_input__main--error': showError,
                    }
                )}
                defaultCountry={defaultCountry}
            />
            {showError && <div className={'wbk_input__error'}>{errors[0]}</div>}
        </div>
    )
}
