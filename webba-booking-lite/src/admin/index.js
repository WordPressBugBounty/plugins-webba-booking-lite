const { render } = wp.element
import { StrictMode } from 'react'
import { App } from './App'
import './App.scss'
import '../assets/frontend.scss'

const container = document.getElementById('wbk_spa_dashboard')

if (container) {
    render(
        <StrictMode>
            <App />
        </StrictMode>,
        container
    )
}
