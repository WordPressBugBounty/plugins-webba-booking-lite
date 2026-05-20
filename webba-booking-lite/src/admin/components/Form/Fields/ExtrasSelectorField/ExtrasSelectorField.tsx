import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { store, store_name } from '../../../../../store/backend'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { useField } from '../../lib/hooks/useField'
import { useForm } from '../../lib/FormProvider'
import { Label } from '../Label/Label'
import plusIcon from '../../../../../../public/images/icon-plus-green.svg'
import closeIcon from '../../../../../../public/images/icon-close.svg'
import './ExtrasSelectorField.scss'

type ExtraLine = {
    extra_id: string
    quantity: number
}

const toPositiveInt = (value: unknown, fallback: number) => {
    const n = Number(value)
    if (!Number.isFinite(n)) return fallback
    return Math.max(1, Math.floor(n))
}

const resolveFormNumericId = (raw: unknown): number => {
    if (raw === null || raw === undefined || raw === '') {
        return 0
    }
    if (typeof raw === 'object' && raw !== null && 'value' in raw) {
        return resolveFormNumericId((raw as { value: unknown }).value)
    }
    const n = Number(typeof raw === 'string' ? String(raw).trim() : raw)
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
}

const entityRowId = (row: Record<string, unknown>) =>
    String(row.id ?? row.value ?? '')

const normalizeExtraIdListItem = (item: unknown): string => {
    if (item === null || item === undefined) {
        return ''
    }
    if (typeof item === 'object' && item !== null) {
        const record = item as Record<string, unknown>
        const nested =
            record.value ?? record.id ?? record.extra_id ?? record.extraId
        return normalizeExtraIdListItem(nested)
    }
    const str = String(item).trim()
    if (!str || str === '0') {
        return ''
    }
    return str
}

const parseConnectedExtraIds = (
    entity: Record<string, unknown> | null | undefined
): string[] => {
    if (!entity) return []
    const raw =
        entity.extra_ids ??
        entity.extras ??
        entity.service_extras ??
        entity.unit_extras
    if (Array.isArray(raw)) {
        return raw
            .map((item) => normalizeExtraIdListItem(item))
            .filter((id) => id && id !== '0')
    }
    if (typeof raw === 'string' && raw.trim()) {
        try {
            const decoded = JSON.parse(raw) as unknown
            if (Array.isArray(decoded)) {
                return decoded
                    .map((item) => normalizeExtraIdListItem(item))
                    .filter((id) => id && id !== '0')
            }
        } catch {
            return []
        }
    }
    return []
}

const mergeStoreRowsWithPresetExtras = (
    storeRows: Record<string, unknown>[] | null | undefined,
    presetRows: Record<string, unknown>[] | undefined
): Record<string, unknown>[] => {
    const preset = Array.isArray(presetRows) ? presetRows : []
    const store = Array.isArray(storeRows)
        ? storeRows.filter(
            (row) =>
                row &&
                typeof row === 'object' &&
                !('error' in row && (row as { error?: unknown }).error)
        )
        : []
    if (store.length === 0) {
        return preset
    }
    return store.map((row) => {
        const idKey = entityRowId(row)
        if (!idKey) {
            return row
        }
        const presetMatch = preset.find(
            (candidate) => entityRowId(candidate as Record<string, unknown>) === idKey
        ) as Record<string, unknown> | undefined
        if (!presetMatch) {
            return row
        }
        const fromStore = parseConnectedExtraIds(row)
        const fromPreset = parseConnectedExtraIds(presetMatch)
        if (fromStore.length > 0) {
            return row
        }
        if (fromPreset.length === 0) {
            return row
        }
        return {
            ...row,
            extra_ids: presetMatch.extra_ids,
            extras: presetMatch.extras,
        }
    })
}

const parseLinesFromValue = (raw: unknown): ExtraLine[] => {
    if (raw === null || raw === undefined || raw === '') return []
    let parsed: unknown = raw
    if (typeof raw === 'string') {
        const trimmed = raw.trim()
        if (!trimmed) return []
        try {
            parsed = JSON.parse(trimmed)
        } catch {
            return []
        }
    }
    if (Array.isArray(parsed)) {
        return parsed.map((row: Record<string, unknown>) => ({
            extra_id: String(row?.extra_id ?? row?.id ?? ''),
            quantity: toPositiveInt(row?.quantity, 1),
        }))
    }
    if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed as Record<string, unknown>)
            .map(([extraId, quantity]) => ({
                extra_id: String(extraId),
                quantity: toPositiveInt(quantity, 1),
            }))
            .filter((row) => row.extra_id.trim() !== '')
    }
    if (
        parsed &&
        typeof parsed === 'object' &&
        Array.isArray((parsed as { booking_extras?: unknown }).booking_extras)
    ) {
        return parseLinesFromValue(
            (parsed as { booking_extras: unknown }).booking_extras
        )
    }
    return []
}

const serializeLines = (lines: ExtraLine[]) => {
    const map = lines.reduce((acc, line) => {
        const key = String(line.extra_id || '').trim()
        if (!key) {
            return acc
        }
        acc[key] = toPositiveInt(line.quantity, 1)
        return acc
    }, {} as Record<string, number>)
    if (Object.keys(map).length === 0) {
        return ''
    }
    return JSON.stringify(map)
}

const stripIncompleteExtrasPayload = (raw: string) => {
    return serializeLines(parseLinesFromValue(raw))
}

const getExtraRecordLabel = (extra: Record<string, unknown>) =>
    String(
        extra.name ??
        extra.extra_name ??
        extra.label ??
        extra.title ??
        `#${extra.id ?? ''}`
    )

export const stripIncompleteBookingExtrasForSubmit = stripIncompleteExtrasPayload

export const createExtrasSelectorField: FormComponentConstructor<string> = ({
    field,
}) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const form = useForm()
        const { value, setValue, errors } = useField(field)
        const formFields = form.fields as Record<string, any>
        const serviceField =
            formFields.service_id ?? formFields.appointment_service_id
        const unitField = formFields.unit_id ?? formFields.appointment_unit_id

        const { value: serviceIdRaw, isIgnored: serviceFieldIgnored } =
            useField(serviceField as any)
        const { value: unitIdRaw, isIgnored: unitFieldIgnored } = useField(
            unitField as any
        )

        const { services, units, extras, preset } = useSelect(
            (select: any) => ({
                services: select(store).getItems('services'),
                units: select(store).getItems('units'),
                extras: select(store).getItems('extras'),
                preset: select(store_name).getPreset(),
            }),
            []
        ) as {
            services: Record<string, unknown>[] | null
            units: Record<string, unknown>[] | null
            extras: Record<string, unknown>[] | null
            preset: { services?: Record<string, unknown>[] }
        }

        const presetTyped = preset as {
            services?: Record<string, unknown>[]
            units?: Record<string, unknown>[]
            extras?: Record<string, unknown>[]
        }

        const serviceList = useMemo(
            () =>
                mergeStoreRowsWithPresetExtras(
                    services as Record<string, unknown>[] | null,
                    presetTyped?.services
                ),
            [services, presetTyped?.services]
        )

        const unitList = useMemo(
            () =>
                mergeStoreRowsWithPresetExtras(
                    units as Record<string, unknown>[] | null,
                    presetTyped?.units
                ),
            [units, presetTyped?.units]
        )

        const extrasList = useMemo(() => {
            if (Array.isArray(extras) && extras.length > 0) {
                const cleaned = (extras as Record<string, unknown>[]).filter(
                    (row) =>
                        row &&
                        typeof row === 'object' &&
                        !('error' in row && (row as { error?: unknown }).error)
                )
                if (cleaned.length > 0) {
                    return cleaned
                }
            }
            return Array.isArray(presetTyped?.extras) ? presetTyped.extras : []
        }, [extras, presetTyped?.extras])

        const selectedUnitId = resolveFormNumericId(unitIdRaw)
        const selectedServiceId = resolveFormNumericId(serviceIdRaw)

        const activeUnitMode =
            !unitFieldIgnored && unitField && selectedUnitId > 0
        const activeServiceMode =
            !serviceFieldIgnored && serviceField && selectedServiceId > 0

        const selectedEntity = useMemo(() => {
            const serviceKey = String(selectedServiceId)
            const unitKey = String(selectedUnitId)
            if (activeUnitMode) {
                return (
                    unitList.find((unit) => entityRowId(unit) === unitKey) ?? null
                )
            }
            if (activeServiceMode) {
                return (
                    serviceList.find((svc) => entityRowId(svc) === serviceKey) ??
                    null
                )
            }
            return null
        }, [
            activeUnitMode,
            activeServiceMode,
            selectedUnitId,
            selectedServiceId,
            unitList,
            serviceList,
        ])

        const allowedExtraIds = useMemo(
            () => parseConnectedExtraIds(selectedEntity ?? undefined),
            [selectedEntity]
        )

        const allowedExtras = useMemo(() => {
            const idSet = new Set(allowedExtraIds.map(String))
            return extrasList.filter((extra) =>
                idSet.has(String(extra.id ?? ''))
            )
        }, [extrasList, allowedExtraIds])

        const [lines, setLines] = useState<ExtraLine[]>([])

        const hasSelectedEntity = activeUnitMode || activeServiceMode

        const extrasScopeKey = `${activeServiceMode ? selectedServiceId : 0}:${activeUnitMode ? selectedUnitId : 0}:${allowedExtraIds.join(',')}`
        const prevExtrasScopeKeyRef = useRef<string>('')

        useEffect(() => {
            if (!hasSelectedEntity) {
                prevExtrasScopeKeyRef.current = extrasScopeKey
                setLines([])
                return
            }
            if (allowedExtraIds.length === 0) {
                prevExtrasScopeKeyRef.current = extrasScopeKey
                setLines([])
                if (value) {
                    setValue('')
                }
                return
            }

            const scopeJustChanged =
                prevExtrasScopeKeyRef.current !== extrasScopeKey
            prevExtrasScopeKeyRef.current = extrasScopeKey

            const idSet = new Set(allowedExtraIds.map(String))
            const next = parseLinesFromValue(value).filter(
                (line) => !line.extra_id || idSet.has(String(line.extra_id))
            )

            const nextLines =
                next.length === 0 && scopeJustChanged && allowedExtraIds.length > 0
                    ? [{ extra_id: '', quantity: 1 }]
                    : next
            setLines(nextLines)

            const serialized = serializeLines(nextLines)
            const current = stripIncompleteExtrasPayload(
                typeof value === 'string' ? value : String(value ?? '')
            )

            if (serialized !== current) {
                setValue(serialized)
            }
        }, [
            extrasScopeKey,
            hasSelectedEntity,
            allowedExtraIds.join(','),
            selectedUnitId,
            selectedServiceId,
            setValue,
            value,
        ])

        const commitLines = useCallback(
            (next: ExtraLine[]) => {
                setLines(next)
                setValue(serializeLines(next))
            },
            [setValue]
        )

        const getExtraQuantityBounds = useCallback(
            (extraId: string) => {
                const record = allowedExtras.find(
                    (item) => String(item.id ?? '') === String(extraId)
                )
                const minQ = Math.max(1, toPositiveInt(record?.min_quantity, 1))
                const maxRaw = toPositiveInt(record?.max_quantity, minQ)
                const maxQ = Math.max(minQ, maxRaw)
                return { minQ, maxQ }
            },
            [allowedExtras]
        )

        const selectedIdsExcludingIndex = useCallback(
            (excludeIndex: number) => {
                const set = new Set<string>()
                lines.forEach((line, index) => {
                    if (index !== excludeIndex && line.extra_id) {
                        set.add(String(line.extra_id))
                    }
                })
                return set
            },
            [lines]
        )

        const addRow = () => {
            commitLines([...lines, { extra_id: '', quantity: 1 }])
        }

        const removeRow = (index: number) => {
            commitLines(lines.filter((_, rowIndex) => rowIndex !== index))
        }

        const updateRow = (index: number, patch: Partial<ExtraLine>) => {
            const current = lines[index]
            if (!current) return
            const merged = { ...current, ...patch }
            if (merged.extra_id) {
                const { minQ, maxQ } = getExtraQuantityBounds(merged.extra_id)
                merged.quantity = Math.min(maxQ, Math.max(minQ, merged.quantity))
            }
            commitLines(
                lines.map((line, rowIndex) =>
                    rowIndex === index ? merged : line
                )
            )
        }

        const selectedCount = new Set(
            lines
                .map((line) => String(line.extra_id || '').trim())
                .filter((id) => id !== '')
        ).size
        const canAddRow =
            allowedExtraIds.length > 0 && selectedCount < allowedExtraIds.length

        if (!hasSelectedEntity || allowedExtraIds.length === 0) {
            return null
        }

        return (
            <div className="wbk_extrasSelectorField">
                <Label title={label} id={name} tooltip={misc?.tooltip} />

                {
                    lines.length > 0 && (
                        <div className="wbk_extrasSelectorField__rows">
                            {lines.map((line, index) => {
                                const takenElsewhere = selectedIdsExcludingIndex(index)
                                const qtyBounds = line.extra_id
                                    ? getExtraQuantityBounds(line.extra_id)
                                    : { minQ: 1, maxQ: 9999 }
                                return (
                                    <div
                                        className="wbk_extrasSelectorField__row"
                                        key={`extra-line-${index}`}
                                    >
                                        <select
                                            className="wbk_extrasSelectorField__select"
                                            aria-label={__('Extra', 'webba-booking-lite')}
                                            value={line.extra_id}
                                            onChange={(event) =>
                                                updateRow(index, {
                                                    extra_id: event.target.value,
                                                })
                                            }
                                        >
                                            <option value="">
                                                {__('Select extra…', 'webba-booking-lite')}
                                            </option>
                                            {allowedExtras.map((extra) => {
                                                const id = String(extra.id ?? '')
                                                if (!id) return null
                                                if (takenElsewhere.has(id) && id !== line.extra_id) {
                                                    return null
                                                }
                                                return (
                                                    <option key={id} value={id}>
                                                        {getExtraRecordLabel(extra)}
                                                    </option>
                                                )
                                            })}
                                        </select>

                                        <label className="wbk_extrasSelectorField__qtyLabel">
                                            <span className="wbk_extrasSelectorField__qtyCaption">
                                                {__('Qty', 'webba-booking-lite')}
                                            </span>
                                            <input
                                                type="number"
                                                min={qtyBounds.minQ}
                                                max={qtyBounds.maxQ}
                                                className="wbk_extrasSelectorField__qtyInput"
                                                value={line.quantity}
                                                onChange={(event) =>
                                                    updateRow(index, {
                                                        quantity: Math.min(
                                                            qtyBounds.maxQ,
                                                            Math.max(
                                                                qtyBounds.minQ,
                                                                toPositiveInt(event.target.value, qtyBounds.minQ)
                                                            )
                                                        ),
                                                    })
                                                }
                                                disabled={!line.extra_id}
                                            />
                                        </label>

                                        <button
                                            type="button"
                                            className="wbk_extrasSelectorField__remove"
                                            onClick={() => removeRow(index)}
                                            aria-label={__('Remove row', 'webba-booking-lite')}
                                        >
                                            <img src={closeIcon} alt="" aria-hidden />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )
                }

                <button
                    type="button"
                    className="wbk_extrasSelectorField__addButton"
                    onClick={addRow}
                    disabled={!canAddRow}
                >
                    <img src={plusIcon} alt="" className="wbk_extrasSelectorField__plusIcon" />
                    <span>{__('Add extra', 'webba-booking-lite')}</span>
                </button>

                {errors.length > 0 && (
                    <div className="wbk_extrasSelectorField__error">{errors[0]}</div>
                )}
            </div>
        )
    }
}
