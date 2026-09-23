import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { useField } from '../../Form/hooks/useField'
import { IFieldProps } from '../../Form/types'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import './PriceInput.scss'

type CurrencyPosition = 'before' | 'after'

const isAmountText = (value: string) => /^\d*([.,]\d*)?$/.test(value)

const parseCurrencyFromPriceFormat = (priceFormat?: string) => {
    const format = priceFormat || '$#price'
    const token = '#price'
    const tokenIndex = format.indexOf(token)
    if (tokenIndex === -1) {
        return { symbol: '$', position: 'before' as CurrencyPosition }
    }

    const before = format.slice(0, tokenIndex).trim()
    const after = format.slice(tokenIndex + token.length).trim()
    if (before) {
        return { symbol: before, position: 'before' as CurrencyPosition }
    }
    if (after) {
        return { symbol: after, position: 'after' as CurrencyPosition }
    }
    return { symbol: '$', position: 'before' as CurrencyPosition }
}

const resolveCurrency = (
    settings?: {
        currency_symbol?: string
        currency_symbol_position?: string
    },
    priceFormat?: string
) => {
    const symbolFromSettings =
        typeof settings?.currency_symbol === 'string' &&
        settings.currency_symbol.trim()
            ? settings.currency_symbol.trim()
            : ''

    if (symbolFromSettings) {
        return {
            symbol: symbolFromSettings,
            position: (settings?.currency_symbol_position === 'after'
                ? 'after'
                : 'before') as CurrencyPosition,
        }
    }

    return parseCurrencyFromPriceFormat(priceFormat)
}

export const PriceInput = ({ fieldConstructor, anyTouched }: IFieldProps) => {
    const {
        slug,
        placeholder,
        value,
        errors,
        setValue,
        width,
        touched,
        setTouched,
    } = useField(fieldConstructor)
    const { preset, priceFormat } = useBookingContext()
    const inputRef = useRef<HTMLInputElement>(null)
    const currencyRef = useRef<HTMLSpanElement>(null)
    const cursorPositionRef = useRef<number | null>(null)
    const [symbolInset, setSymbolInset] = useState(36)

    const currency = useMemo(
        () => resolveCurrency(preset?.settings, priceFormat),
        [
            preset?.settings?.currency_symbol,
            preset?.settings?.currency_symbol_position,
            priceFormat,
        ]
    )

    const showError = errors && errors.length > 0 && (anyTouched || touched)

    useLayoutEffect(() => {
        const symbolWidth = currencyRef.current?.offsetWidth ?? 12
        setSymbolInset(Math.max(36, Math.ceil(symbolWidth) + 24))
    }, [currency.symbol])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextValue = event.target.value
        if (nextValue !== '' && !isAmountText(nextValue)) {
            return
        }
        cursorPositionRef.current = event.target.selectionStart
        setValue(nextValue)
    }

    useEffect(() => {
        if (cursorPositionRef.current !== null && inputRef.current) {
            const position = cursorPositionRef.current
            inputRef.current.setSelectionRange(position, position)
            cursorPositionRef.current = null
        }
    }, [value])

    const inputInsetStyle = {
        ['--wbk-price-symbol-inset' as string]: `${symbolInset}px`,
    }

    return (
        <div
            className={classNames('wbk_input', {
                'wbk_input--half-width': width === 'half-width',
            })}
        >
            <div className="wbk_input__price" style={inputInsetStyle}>
                <input
                    ref={inputRef}
                    name={slug}
                    type="text"
                    inputMode="decimal"
                    placeholder={placeholder}
                    onChange={handleChange}
                    value={(value as string) ?? ''}
                    className={classNames('wbk_input__main', {
                        'wbk_input__main--error': showError,
                        'wbk_input__main--currency-before':
                            currency.position === 'before',
                        'wbk_input__main--currency-after':
                            currency.position === 'after',
                    })}
                    onBlur={() => setTouched(true)}
                />
                <span
                    ref={currencyRef}
                    className={classNames('wbk_input__currency', {
                        'wbk_input__currency--before':
                            currency.position === 'before',
                        'wbk_input__currency--after':
                            currency.position === 'after',
                    })}
                    aria-hidden="true"
                >
                    {currency.symbol}
                </span>
            </div>
            {showError && <div className={'wbk_input__error'}>{errors[0]}</div>}
        </div>
    )
}
