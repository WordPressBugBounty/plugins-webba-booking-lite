export function normalizeToUnixSeconds(raw: number): number {
    if (!Number.isFinite(raw) || raw <= 0) {
        return raw
    }
    if (raw > 1e11) {
        return Math.floor(raw / 1000)
    }
    return Math.floor(raw)
}

export const getPlainTextFromHtml = (html: string): string => {
    if (typeof document === 'undefined') {
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    }
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return (doc.body?.textContent ?? '').trim().replace(/\s+/g, ' ')
}

export const extractDataAttrs = (element: HTMLElement) => {
    const dataAttrs: Record<string, string> = {}
    Array.from(element.attributes).forEach(({ name, value }) => {
        if (name.startsWith('data-')) {
            dataAttrs[name.slice(5)] = value
        }
    })

    return { ...dataAttrs }
}
