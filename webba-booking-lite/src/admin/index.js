const { render } = wp.element
import { StrictMode } from 'react'
import App from './App'
import { SidebarProvider } from './components/Sidebar/SidebarContext'
import { Sidebar } from './components/Sidebar/Sidebar'

const container = document.getElementById('wbk_spa_dashboard')

if (container) {
    render(
        <StrictMode>
            <SidebarProvider>
                <App />
                <Sidebar />
            </SidebarProvider>
        </StrictMode>,
        container
    )
}
