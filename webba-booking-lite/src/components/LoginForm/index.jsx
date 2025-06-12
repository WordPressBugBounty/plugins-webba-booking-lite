import React, { useState, useEffect } from 'react'
import apiFetch from '@wordpress/api-fetch'
import Button from '../Button/'
import { select } from '@wordpress/data'
import { store_name } from '../../store/frontend'

const LoginForm = ({ onSuccess }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoginDisabled, setIsLoginDisabled] = useState(true)
    const { wording, appearance } = select(store_name).getPreset()

    // Check login button state whenever username or password changes
    useEffect(() => {
        setIsLoginDisabled(username.trim() === '' || password.trim() === '')
    }, [username, password])

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !isLoginDisabled) {
            login()
        }
    }
    const login = async (event) => {
        setError('')
        setIsLoading(true)
        try {
            const response = await apiFetch({
                path: '/wbk/v2/login',
                method: 'POST',
                data: {
                    username,
                    password,
                },
            })
            onSuccess(response)
        } catch (loginError) {
            setError(
                loginError.message ||
                    'Login failed. Please check your credentials.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="wbk-form">
            <div className="wbk-form__heading">
                <h2 className="wbk-form__title" style={{ color: appearance[0], borderColor: appearance[0] }}>{wording.label_login_title}</h2>
            </div>
            
            <div className="wbk-form__input-wrapper">
                <div className="wbk-form__group">
                    <label className="wbk-form__label">{wording.label_login_user}</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                </div>
                <div className="wbk-form__group">
                    <label className="wbk-form__label">{wording.label_login_password}</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                </div>
            </div>

            {error && <div className="wbk-form__error">{error}</div>}
            <div className="wbk-form__button-holder">
                <Button
                    onClick={login}
                    label={wording.label_login_button}
                    loadingLabel={wording.loading}
                    disabled={isLoginDisabled || isLoading}
                />
            </div>
        </div>
    )
}

export default LoginForm
