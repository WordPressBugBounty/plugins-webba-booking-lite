import { useEffect, useState } from 'react'
import { __ } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import apiFetch from '@wordpress/api-fetch'
import { store_name } from '../../../../../store/frontend'
import { PackagePurchaseForm } from '../../../Packages/PackagePurchaseForm'
import { Button } from '../../../../components/Button/Button'
import styles from './Packages.module.scss'

const formatDate = (timestamp) => {
    if (!timestamp) {
        return __('No expiry', 'webba-booking-lite')
    }
    return new Date(timestamp * 1000).toLocaleDateString()
}

export const Packages = () => {
    const preset = useSelect((select) => select(store_name).getPreset(), [])
    const presetReady = !!preset && Object.keys(preset).length > 0
    const isLoggedIn = !!preset?.user

    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [buying, setBuying] = useState(false)

    const load = async () => {
        setLoading(true)
        setMessage('')
        try {
            const pkgRes = await apiFetch({
                path: '/wbk/v2/get-user-packages/',
            })
            setPackages(pkgRes?.packages || [])
        } catch (e) {
            setMessage(
                e?.message ||
                    __('Could not load packages.', 'webba-booking-lite')
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!presetReady || !isLoggedIn) {
            setLoading(false)
            return
        }
        load()
    }, [presetReady, isLoggedIn])

    if (!presetReady || loading) {
        return <p>{__('Loading…', 'webba-booking-lite')}</p>
    }

    if (buying) {
        return (
            <div className={styles.wrapper}>
                <Button type="generic" onClick={() => setBuying(false)}>
                    {__('Back to my packages', 'webba-booking-lite')}
                </Button>
                <PackagePurchaseForm />
            </div>
        )
    }

    return (
        <div className={styles.wrapper}>
            {message && <p className={styles.message}>{message}</p>}

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>{__('My Packages', 'webba-booking-lite')}</h3>
                    <Button onClick={() => setBuying(true)}>
                        {__('Buy a package', 'webba-booking-lite')}
                    </Button>
                </div>
                {packages.length === 0 && (
                    <p>
                        {__(
                            'You do not have any visit packages yet.',
                            'webba-booking-lite'
                        )}
                    </p>
                )}
                <ul className={styles.list}>
                    {packages.map((pkg) => (
                        <li key={pkg.id} className={styles.card}>
                            <strong>{pkg.name}</strong>
                            <div>
                                {__('Remaining visits:', 'webba-booking-lite')}{' '}
                                {pkg.remaining_credits}/{pkg.total_credits}
                            </div>
                            <div>
                                {__('Status:', 'webba-booking-lite')}{' '}
                                {pkg.status}
                            </div>
                            <div>
                                {__('Expires:', 'webba-booking-lite')}{' '}
                                {formatDate(pkg.expires_at)}
                            </div>
                            {(pkg.rules?.min_interval_days > 0 ||
                                pkg.rules?.max_visits_per_week > 0 ||
                                pkg.rules?.max_visits_per_month > 0) && (
                                <div className={styles.rules}>
                                    {pkg.rules.min_interval_days > 0 && (
                                        <span>
                                            {__(
                                                'Min days between visits:',
                                                'webba-booking-lite'
                                            )}{' '}
                                            {pkg.rules.min_interval_days}
                                        </span>
                                    )}
                                    {pkg.rules.max_visits_per_week > 0 && (
                                        <span>
                                            {__(
                                                'Max / week:',
                                                'webba-booking-lite'
                                            )}{' '}
                                            {pkg.rules.max_visits_per_week}
                                        </span>
                                    )}
                                    {pkg.rules.max_visits_per_month > 0 && (
                                        <span>
                                            {__(
                                                'Max / month:',
                                                'webba-booking-lite'
                                            )}{' '}
                                            {pkg.rules.max_visits_per_month}
                                        </span>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    )
}
