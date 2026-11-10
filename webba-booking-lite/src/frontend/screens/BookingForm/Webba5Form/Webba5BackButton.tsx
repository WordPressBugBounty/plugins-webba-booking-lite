import { IWebba5BackButtonProps } from './types'

export const Webba5BackButton = ({ label, onClick }: IWebba5BackButtonProps) => {
    return (
        <button
            type="button"
            className="wbk_webba5_form__back"
            onClick={onClick}
        >
            <svg
                className="wbk_webba5_form__back-icon"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <path
                    d="M14.25 9H3.75M7.5 4.5 3 9l4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span>{label}</span>
        </button>
    )
}
