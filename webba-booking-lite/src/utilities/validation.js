export const isEmail = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(input)
}
export const isPostiveInteger = (input) => {
    if (!Number.isInteger(input)) {
        result = true
    } else {
        if (parseInt(input) < 0) {
            result = true
        }
    }
}
