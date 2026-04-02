import { __ } from '@wordpress/i18n'

export const t = (message: string) => __(message, 'webba-booking-lite')

export const createTranslations = <T extends Record<string, string>>(
    mod: T
) => {
    const res: any = {}

    for (const key of Object.keys(mod)) {
        res[key] = t(mod[key])
    }

    return res as T
}
