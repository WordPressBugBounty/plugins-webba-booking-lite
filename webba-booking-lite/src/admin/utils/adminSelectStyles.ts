/**
 * Shared react-select styles that follow admin theme CSS variables.
 * Inline emotion styles from react-select otherwise force light backgrounds.
 */
export const getAdminSelectStyles = (overrides: Record<string, any> = {}) => {
    const themedStyles: Record<string, any> = {
        control: (base: Record<string, unknown>) => ({
            ...base,
            backgroundColor: 'var(--wbk-admin-field-background)',
            borderColor: 'var(--wbk-admin-field-border)',
            boxShadow: 'none',
            minHeight: 'inherit',
            '&:hover': {
                borderColor: 'var(--wbk-admin-border-dark)',
            },
        }),
        valueContainer: (base: Record<string, unknown>) => ({
            ...base,
            color: 'var(--wbk-admin-input-text)',
        }),
        singleValue: (base: Record<string, unknown>) => ({
            ...base,
            color: 'var(--wbk-admin-input-text)',
        }),
        multiValue: (base: Record<string, unknown>) => ({
            ...base,
            backgroundColor: 'var(--wbk-admin-bg-offwhite)',
            maxWidth: '100px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }),
        multiValueLabel: (base: Record<string, unknown>) => ({
            ...base,
            color: 'var(--wbk-admin-input-text)',
        }),
        multiValueRemove: (base: Record<string, unknown>) => ({
            ...base,
            color: 'var(--wbk-admin-text-grey)',
            ':hover': {
                backgroundColor: 'var(--wbk-admin-row-border)',
                color: 'var(--wbk-admin-off-black)',
            },
        }),
        input: (base: Record<string, unknown>) => ({
            ...base,
            color: 'var(--wbk-admin-input-text)',
        }),
        placeholder: (base: Record<string, unknown>) => ({
            ...base,
            color: 'var(--wbk-admin-light-grey)',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        dropdownIndicator: (base: Record<string, unknown>) => ({
            ...base,
            color: 'var(--wbk-admin-light-grey)',
            ':hover': {
                color: 'var(--wbk-admin-off-black)',
            },
        }),
        clearIndicator: (base: Record<string, unknown>) => ({
            ...base,
            color: 'var(--wbk-admin-light-grey)',
        }),
        menu: (base: Record<string, unknown>) => ({
            ...base,
            backgroundColor: 'var(--wbk-admin-bg-white)',
            border: '1px solid var(--wbk-admin-input-border)',
            boxShadow: '0 8px 24px var(--wbk-admin-shadow)',
            zIndex: 999999,
        }),
        menuList: (base: Record<string, unknown>) => ({
            ...base,
            backgroundColor: 'var(--wbk-admin-bg-white)',
        }),
        option: (
            base: Record<string, unknown>,
            state: { isFocused?: boolean; isSelected?: boolean }
        ) => ({
            ...base,
            backgroundColor: state.isSelected
                ? 'var(--wbk-admin-primary)'
                : state.isFocused
                  ? 'var(--wbk-admin-bg-offwhite)'
                  : 'transparent',
            color: state.isSelected
                ? 'var(--wbk-admin-text-white)'
                : 'var(--wbk-admin-input-text)',
            cursor: 'pointer',
            ':active': {
                backgroundColor: 'var(--wbk-admin-primary-soft)',
            },
        }),
        menuPortal: (base: Record<string, unknown>) => ({
            ...base,
            zIndex: 999999,
        }),
    }

    const merged: Record<string, any> = { ...themedStyles }

    Object.keys(overrides).forEach((key) => {
        const overrideFn = overrides[key]
        const baseFn = themedStyles[key]

        if (typeof overrideFn === 'function' && typeof baseFn === 'function') {
            merged[key] = (base: Record<string, unknown>, state: unknown) =>
                overrideFn(baseFn(base, state), state)
        } else {
            merged[key] = overrideFn
        }
    })

    return merged
}
