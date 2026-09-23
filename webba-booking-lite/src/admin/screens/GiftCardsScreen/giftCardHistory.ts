export type GiftCardHistoryEntry = {
    time: number
    amount: number
}

export const parseGiftCardHistory = (
    raw: unknown
): GiftCardHistoryEntry[] => {
    let decoded: unknown = raw

    if (typeof raw === 'string') {
        const trimmed = raw.trim()
        if (!trimmed) {
            return []
        }
        try {
            decoded = JSON.parse(trimmed)
        } catch {
            return []
        }
    }

    if (!Array.isArray(decoded)) {
        return []
    }

    return decoded
        .map((entry) => {
            if (!entry || typeof entry !== 'object') {
                return null
            }
            const amount = Number((entry as { amount?: unknown }).amount)
            if (!Number.isFinite(amount) || amount <= 0) {
                return null
            }
            const time = Number((entry as { time?: unknown }).time)
            return {
                time: Number.isFinite(time) ? time : 0,
                amount,
            }
        })
        .filter((entry): entry is GiftCardHistoryEntry => entry !== null)
}

export const getGiftCardRemainingAmount = (row: {
    amount?: unknown
    history?: unknown
}): number => {
    const amount = Number(row?.amount)
    const used = parseGiftCardHistory(row?.history).reduce(
        (sum, entry) => sum + entry.amount,
        0
    )
    const remaining =
        (Number.isFinite(amount) ? amount : 0) - used
    return Math.max(0, remaining)
}
