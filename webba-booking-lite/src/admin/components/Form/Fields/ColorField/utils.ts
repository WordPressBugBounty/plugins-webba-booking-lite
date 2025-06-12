export const generateRandomColor = (ignoreList: string[] = []): string => {
    const letters = '0123456789ABCDEF'
    let color = '#'

    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }

    while (ignoreList.includes(color)) {
        color = '#'
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)]
        }
    }

    return color
}

export const increaseOpacity = (
    color: string,
    opacityIncrease: number
): string => {
    if (
        !/^#[0-9A-F]{6}$/i.test(color) ||
        opacityIncrease < 0 ||
        opacityIncrease > 1
    ) {
        return color
    }

    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    const a = 1 - opacityIncrease

    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`
}
