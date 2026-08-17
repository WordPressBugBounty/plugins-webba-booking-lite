export interface IQuantityFieldOption {
    label: string
    slug: string
}

export interface IQuantityFieldValue {
    [slug: string]: number
}

export const slugifyQuantityLabel = (label: string): string =>
    String(label || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')

export const normalizeQuantityFields = (
    fields?: Array<string | IQuantityFieldOption> | null
): IQuantityFieldOption[] => {
    if (!Array.isArray(fields) || fields.length === 0) {
        return []
    }

    return fields
        .map((field) => {
            if (typeof field === 'string') {
                const label = field.trim()
                return {
                    label,
                    slug: slugifyQuantityLabel(label),
                }
            }

            const label = String(field?.label || '').trim()
            const slug = String(field?.slug || '').trim() || slugifyQuantityLabel(label)

            return { label, slug }
        })
        .filter((field) => field.label && field.slug)
}

export const getDefaultQuantityFields = (): IQuantityFieldOption[] => [
    { label: 'Adult', slug: 'adult' },
    { label: 'Child', slug: 'child' },
    { label: 'Infant', slug: 'infant' },
]

export const allocateQuantityDefaults = (
    fields: IQuantityFieldOption[],
    selectedQuantity: number
): IQuantityFieldValue => {
    const safeQuantity = Math.max(0, Number(selectedQuantity) || 0)
    const result: IQuantityFieldValue = {}
    let remaining = safeQuantity

    fields.forEach((field) => {
        if (remaining > 0) {
            result[field.slug] = 1
            remaining -= 1
        } else {
            result[field.slug] = 0
        }
    })

    if (remaining > 0 && fields.length > 0) {
        result[fields[0].slug] += remaining
    }

    return result
}

export const getQuantityFieldsTotal = (
    value: IQuantityFieldValue | null | undefined
): number => {
    if (!value || typeof value !== 'object') {
        return 0
    }

    return Object.values(value).reduce(
        (sum, amount) => sum + (Number(amount) || 0),
        0
    )
}

export const buildNumberOfPeopleFromQuantityFields = (
    value: IQuantityFieldValue | null | undefined,
    fields: IQuantityFieldOption[] = []
): IQuantityFieldValue => {
    const result: IQuantityFieldValue = {}

    fields.forEach((field) => {
        result[field.slug] = Number(value?.[field.slug]) || 0
    })

    if (fields.length === 0 && value && typeof value === 'object') {
        Object.keys(value).forEach((slug) => {
            result[slug] = Number(value[slug]) || 0
        })
    }

    return result
}
