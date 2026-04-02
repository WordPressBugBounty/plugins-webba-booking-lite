export const capitalize = (word: string) => {
    return String(word.charAt(0).toUpperCase() + word.slice(1))
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
}
