import classNames from 'classnames'
import { useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './Sidebar.module.css'
import { useSidebar } from './SidebarContext'

export const Sidebar = () => {
    const { element, shown, close: hide } = useSidebar()
    const sectionRef = useRef<HTMLElement | null>(null)

    return createPortal(
        <div
            id="sidebar"
            className={classNames(styles.sidebarContainer, {
                [styles.shown]: shown,
            })}
            onClick={() => {
                hide()
            }}
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
            <section
                className={styles.sidebar}
                ref={sectionRef}
                onClick={(e) => e.stopPropagation()}
            >
                {element}
            </section>
        </div>,
        document.getElementById('wpwrap')!
    )
}
