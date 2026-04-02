export const useLocale = () => {
    const locale = document.documentElement?.lang || 'en-US'
    const [lang, localeCode = ''] = locale.split('-')
    return { lang, locale, localeCode }
}
