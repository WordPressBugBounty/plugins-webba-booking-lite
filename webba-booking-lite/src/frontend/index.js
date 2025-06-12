const { render } = wp.element
import UserDashboard from './UserDashboard'
import App from './App'

const container = document.getElementById('wbk_user_dashboard')

if (container) {
    render(<UserDashboard />, container)
}
