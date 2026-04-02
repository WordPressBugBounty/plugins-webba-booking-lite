export const wbkDecodeString = (str: string) => {
    if (typeof str !== 'string') return str

    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#34;': '"',
        '&#39;': "'",
        '&#039;': "'",
        '&apos;': "'",
        '&nbsp;': ' ',
        '&#160;': ' ',
        '&copy;': '©',
        '&#169;': '©',
        '&reg;': '®',
        '&#174;': '®',
        '&trade;': '™',
        '&#8482;': '™',
        '&hellip;': '…',
        '&#8230;': '…',
        '&ndash;': '–',
        '&#8211;': '–',
        '&mdash;': '—',
        '&#8212;': '—',
        '&lsquo;': `'`,
        '&#8216;': `'`,
        '&rsquo;': `'`,
        '&#8217;': `'`,
        '&ldquo;': '"',
        '&#8220;': '"',
        '&rdquo;': '"',
        '&#8221;': '"',
        '&cent;': '¢',
        '&#162;': '¢',
        '&pound;': '£',
        '&#163;': '£',
        '&euro;': '€',
        '&#8364;': '€',
        '&yen;': '¥',
        '&#165;': '¥',
    }

    let result = str

    // Decode HTML entities
    for (const [entity, char] of Object.entries(entities)) {
        result = result.replace(new RegExp(entity, 'gi'), char)
    }

    // Decode decimal and hex entities
    result = result.replace(/&#(\d+);/g, (match, dec) =>
        String.fromCharCode(dec)
    )
    result = result.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) =>
        String.fromCharCode(parseInt(hex, 16))
    )

    // Remove backslashes before single quotes (unescape \')
    result = result.replace(/\\'/g, "'")

    return result
}
