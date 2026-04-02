import { AppearanceEditor } from '../../components/AppearanceEditor/AppearanceEditor'
import { AppearanceProvider } from '../../providers/AppearanceProvider/AppearanceProvider'
import { sections } from './sections'
import './AppearanceEditorScreen.scss'
import { BookingForm } from '../../../frontend/screens/BookingForm/BookingForm'
import { BookingFormProvider } from '../../../frontend/providers/BookingFormProvider/BookingFormProvider'
import { AppearanceFooter } from './components/AppearanceFooter/AppearanceFooter'
import { ToastContainer } from 'react-toastify'
import { useState, useRef, useEffect } from 'react'

export const AppearanceEditorScreen = () => {
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseEnter = () => {
            document.body.style.overflow = 'hidden'
            document.documentElement.style.overflow = 'hidden'
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }

        const handleMouseLeave = () => {
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
        }

        const wrapperElement = wrapperRef.current
        if (wrapperElement) {
            wrapperElement.addEventListener('mouseenter', handleMouseEnter)
            wrapperElement.addEventListener('mouseleave', handleMouseLeave)
        }

        return () => {
            if (wrapperElement) {
                wrapperElement.removeEventListener('mouseenter', handleMouseEnter)
                wrapperElement.removeEventListener('mouseleave', handleMouseLeave)
            }
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
        }
    }, [])

    return (
        <AppearanceProvider sections={sections}>
            <div ref={wrapperRef} className="wbk_appearanceEditorScreen__wrapper">
                <div className="wbk_appearanceEditorScreen__leftCol">
                    <AppearanceEditor />
                </div>
                <div className="wbk_appearanceEditorScreen__rightCol">
                    <BookingFormProvider attrService={'0'} attrCategory={'0'}>
                        <BookingForm />
                    </BookingFormProvider>
                </div>
            </div>
            <AppearanceFooter />
            <ToastContainer className="wbk_appearanceEditorScreen__toast" limit={1} />
        </AppearanceProvider>
    )
}
