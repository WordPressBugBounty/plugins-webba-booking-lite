const validateOrder = (originalLength: number, order: number[]) => {
    const seen = new Set<number>()

    for (const index of order) {
        if (index < 0 || index >= originalLength || seen.has(index)) {
            return false
        }

        seen.add(index)
    }

    return true
}

export const reorder = <T>(items: T[], order: number[] = []): T[] => {
    const n = items.length

    if (order.length !== n) return items

    const isOrderValid = validateOrder(n, order)

    if (!isOrderValid) {
        return items
    }

    return order.map((index) => items[index])
}
