import React, { useState } from 'react'
import { select } from '@wordpress/data'
import { store_name } from '../../store/frontend'

const Button = ({ label, onClick, disabled, loadingLabel = label }) => {
    const [isLoading, setIsLoading] = useState(false)
    const { appearance } = select(store_name).getPreset()

    const handleClick = async () => {
        try {
            setIsLoading(true)
            await onClick()
        } catch (error) {
            console.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <button
            className={`button-wbk ${isLoading ? 'loading-wbk' : ''}`}
            onClick={handleClick}
            disabled={disabled}
            style={{ backgroundColor: appearance[1] }}
        >
            {isLoading ? loadingLabel : label}
        </button>
    )
}

export default Button
