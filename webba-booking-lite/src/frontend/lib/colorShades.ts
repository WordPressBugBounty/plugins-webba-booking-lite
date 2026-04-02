/**
 * Generates color shades for a given hex color (like PHP's generateColorShades).
 * Returns an object with shade numbers as keys and hex color strings as values.
 */
export function generateColorShades(baseColor: string): {
    [shade: number]: string
} {
    // Normalize hex color
    let cleanColor = baseColor.replace('#', '').toUpperCase()
    if (cleanColor.length === 3) cleanColor = cleanColor.replace(/(.)/g, '$1$1')
    // Compliant with PHP output, 11 shades:
    const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
    const lightnessOffsets = {
        50: 42,
        100: 34,
        200: 24,
        300: 14,
        400: 6,
        500: 0,
        600: -7,
        700: -17,
        800: -27,
        900: -37,
        950: -44,
    }
    const blendRatios: { [shade: number]: number } = {
        50: 0.95,
        100: 0.9,
        200: 0.8,
        300: 0.7,
        400: 0.6,
    }
    // Hex to RGB
    const hexToRgb = (hex: string) =>
        [0, 2, 4].map((i) => parseInt(hex.substr(i, 2), 16))
    // RGB to Hex
    const rgbToHex = (r: number, g: number, b: number) =>
        '#' +
        [r, g, b]
            .map((n) => n.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase()
    // Blend helper
    const blend = (c1: number[], c2: number[], ratio: number) =>
        c1.map((v, i) => Math.round(v * (1 - ratio) + c2[i] * ratio))
    // RGB to HSL
    const rgbToHsl = (
        r: number,
        g: number,
        b: number
    ): [number, number, number] => {
        r /= 255
        g /= 255
        b /= 255
        const max = Math.max(r, g, b),
            min = Math.min(r, g, b)
        let h = 0,
            s = 0,
            l = (max + min) / 2
        if (max !== min) {
            const d = max - min
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0)
                    break
                case g:
                    h = (b - r) / d + 2
                    break
                case b:
                    h = (r - g) / d + 4
                    break
            }
            h /= 6
        }
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
    }
    // HSL to RGB
    const hslToRgb = (
        h: number,
        s: number,
        l: number
    ): [number, number, number] => {
        h /= 360
        s /= 100
        l /= 100
        let r: number, g: number, b: number
        if (s === 0) {
            r = g = b = l
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1
                if (t > 1) t -= 1
                if (t < 1 / 6) return p + (q - p) * 6 * t
                if (t < 1 / 2) return q
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
                return p
            }
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s
            const p = 2 * l - q
            r = hue2rgb(p, q, h + 1 / 3)
            g = hue2rgb(p, q, h)
            b = hue2rgb(p, q, h - 1 / 3)
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
    }

    const [baseR, baseG, baseB] = hexToRgb(cleanColor)
    const [h0, s0, l0] = rgbToHsl(baseR, baseG, baseB)
    const isGray = s0 <= 2

    let result: { [shade: number]: string } = {}
    shadeKeys.forEach((shade) => {
        if (shade === 500) {
            result[shade] = '#' + cleanColor
        } else if (blendRatios[shade] !== undefined) {
            const white = [255, 255, 255]
            result[shade] = rgbToHex(
                ...blend([baseR, baseG, baseB], white, blendRatios[shade])
            )
        } else {
            let adjH = h0,
                adjS = s0
            if (isGray) {
                adjH = 0
                adjS = 0
            } else {
                if (shade <= 200) adjS = Math.max(20, s0 - 20)
                else if (shade <= 400) adjS = Math.max(40, s0 - 10)
            }
            const newL = Math.max(
                0,
                Math.min(100, l0 + lightnessOffsets[shade])
            )
            result[shade] = rgbToHex(...hslToRgb(adjH, adjS, newL))
        }
    })
    return result
}

/**
 * Generates text contrast color (#22292F or #FFFFFF) for each shade, as in PHP
 */
export function generateTextColors(shades: { [shade: number]: string }): {
    [shade: number]: string
} {
    const getLuminance = (hex: string) => {
        hex = hex.replace('#', '')
        const r = parseInt(hex.substr(0, 2), 16)
        const g = parseInt(hex.substr(2, 2), 16)
        const b = parseInt(hex.substr(4, 2), 16)
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255
    }
    const result: { [shade: number]: string } = {}
    Object.entries(shades).forEach(([shade, hex]) => {
        result[Number(shade)] = getLuminance(hex) > 0.55 ? '#22292F' : '#FFFFFF'
    })
    return result
}
