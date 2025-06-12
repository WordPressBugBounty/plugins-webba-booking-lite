import classNames from 'classnames'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './Sidebar.module.scss'
import { useSidebar } from './SidebarContext'

export const Sidebar = () => {
    const { element, shown } = useSidebar()
    const sectionRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        document.body.style.overflow = shown ? 'hidden' : 'unset'
    }, [shown])

    return createPortal(
        <div
            id="sidebar"
            className={classNames(styles.sidebarContainer, {
                [styles.shown]: shown,
            })}
            ref={(ref) => {
                if (!ref) return

                if (shown) {
                    document.body.classList.add(styles.scrollLock)
                    setTimeout(() => {
                        sectionRef.current?.classList.add(styles.shown)
                    }, 150)
                } else {
                    sectionRef.current?.classList.remove(styles.shown)
                    document.body.classList.remove(styles.scrollLock)
                }
            }}
        >
            <div
                className={styles.sidebar}
                ref={sectionRef as any}
                onClick={(e) => e.stopPropagation()}
            >
                {element}
            </div>
        </div>,
        document.getElementById('wpwrap')!
    )
}
