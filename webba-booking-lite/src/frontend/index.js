import UserDashboard from './UserDashboard'
import { render } from '@wordpress/element'

const container = document.getElementById('wbk_user_dashboard')
if (container) {
    render(<UserDashboard />, container)
}
