import '../assets/frontend.scss'
import { BookingForm } from './screens/BookingForm/BookingForm'
import { useAnalytics } from './hooks/useAnalytics'

const App = ({ formType }) => {
    useAnalytics()

    return <BookingForm formType={formType} />
}

export default App
