import { IWebba5ActionButtonProps } from './types'

export const Webba5ActionButton = ({
    label,
    disabled = false,
    loading = false,
    tooltip,
    onClick,
}: IWebba5ActionButtonProps) => {
    const isDisabled = disabled || loading

    return (
        <span
            className="wbk_webba5_form__action"
            data-tooltip={isDisabled && tooltip ? tooltip : undefined}
        >
            <button
                type="button"
                className="wbk_webba5_form__action-button"
                disabled={isDisabled}
                aria-busy={loading}
                onClick={onClick}
            >
                <span>{label}</span>
                <svg
                    className="wbk_webba5_form__action-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path
                        d="M3.75 9h10.5M10.5 4.5 15 9l-4.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </span>
    )
}
