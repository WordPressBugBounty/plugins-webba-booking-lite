import { useState, useEffect, useRef } from 'react'
import apiFetch from '@wordpress/api-fetch'
import { Button } from '../../frontend/components/Button/Button'
import { select } from '@wordpress/data'
import { store_name } from '../../store/frontend'
import styles from './LoginForm.module.scss'
import iconCalendar from '../../../public/images/icon-calendar.svg'
import { __ } from '@wordpress/i18n'

const LoginForm = ({ onSuccess }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoginDisabled, setIsLoginDisabled] = useState(true)
    const { wording, appearance } = select(store_name).getPreset()

    // Refs to always get latest username/password in login handler
    const usernameRef = useRef(username)
    const passwordRef = useRef(password)

    useEffect(() => {
        usernameRef.current = username
    }, [username])

    useEffect(() => {
        passwordRef.current = password
    }, [password])

    // Check login button state whenever username or password changes
    useEffect(() => {
        setIsLoginDisabled(username.trim() === '' || password.trim() === '')
    }, [username, password])

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !isLoginDisabled) {
            handleLogin(event)
        }
    }

    // Always use latest username/password from refs
    const handleLogin = async (event) => {
        if (event) {
            event.preventDefault?.()
        }
        setError('')
        setIsLoading(true)
        try {
            const response = await apiFetch({
                path: '/wbk/v2/login',
                method: 'POST',
                data: {
                    username: usernameRef.current,
                    password: passwordRef.current,
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
        <div className={styles.wrapper}>
            <div className={styles.heading}>
                <div className={styles.iconWrapper}>
                    <img
                        src={iconCalendar}
                        alt={__('Login icon', 'webba-booking-lite')}
                    />
                </div>
                <h2>{wording.label_login_title}</h2>
                <p>
                    {__('Access your booking dashboard', 'webba-booking-lite')}
                </p>
            </div>

            <div className={styles.form}>
                <div className={styles.fieldWrapper}>
                    <label className="wbk-form__label">
                        {wording.label_login_user}
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                </div>
                <div className="wbk-form__group">
                    <label className="wbk-form__label">
                        {wording.label_login_password}
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                </div>
            </div>
            <div className={styles.optionsWrapper}>
                <label htmlFor="remember" className={styles.rememberLabel}>
                    <input type="checkbox" id="remember" disabled={isLoading} />
                    {__('Remember me', 'webba-booking-lite')}
                </label>
            </div>
            <div className={styles.buttonWrapper}>
                <Button
                    onClick={handleLogin}
                    title={wording.label_login_button}
                    disabled={isLoginDisabled || isLoading}
                    isLoading={isLoading}
                    classes={styles.button}
                />
            </div>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    )
}

export default LoginForm
