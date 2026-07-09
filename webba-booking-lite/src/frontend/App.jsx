import '../assets/frontend.scss'
import { BookingForm } from './screens/BookingForm/BookingForm'
import { useAnalytics } from './hooks/useAnalytics'

const App = () => {
    useAnalytics()

    return <BookingForm />
}

export default App
