import { __ } from '@wordpress/i18n'
import React, { useCallback, useEffect, useState } from 'react'

// Store creation timestamps for each unique URL
const urlCreationTimes = new Map<string, number>()

// Custom hook for countdown timer - each URL has its own independent timer
const useCountdownTimer = (url: string, initialMinutes: number = 5) => {
    const getCreationTime = useCallback(() => {
        if (!urlCreationTimes.has(url)) {
            urlCreationTimes.set(url, Date.now())
        }
        return urlCreationTimes.get(url)!
    }, [url])

    const [currentTime, setCurrentTime] = useState(Date.now())
    const creationTime = getCreationTime()
    const expirationTime = creationTime + initialMinutes * 60 * 1000
    const timeLeft = Math.max(0, Math.floor((expirationTime - currentTime) / 1000))
    const isExpired = timeLeft <= 0

    useEffect(() => {
        if (isExpired) {
            return
        }

        const timer = setInterval(() => {
            setCurrentTime(Date.now())
        }, 1000)

        return () => clearInterval(timer)
    }, [isExpired])

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }, [])

    return {
        timeLeft,
        isExpired,
        formattedTime: formatTime(timeLeft),
    }
}

interface TimedLinkProps {
    href: string
    children: React.ReactNode
    className?: string
    target?: string
    rel?: string
    minutes?: number
}

export const TimedLink: React.FC<TimedLinkProps> = ({
    href,
    children,
    className,
    target = '_self',
    rel = 'noopener noreferrer',
    minutes = 5,
}) => {
    const { isExpired, formattedTime } = useCountdownTimer(href, minutes)

    if (isExpired) {
        return (
            <div className={className}>
                <span style={{ color: '#999', fontStyle: 'italic' }}>
                    {__(
                        'Link expired. Please reload the page to get a new link.',
                        'webba-booking-lite'
                    )}
                </span>
            </div>
        )
    }

    return (
        <div className={className}>
            <a href={href} target={target} rel={rel}>
                {children}
            </a>
            <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>
                {__('Link expires in:', 'webba-booking-lite')} {formattedTime}
            </div>
        </div>
    )
}

export default TimedLink


