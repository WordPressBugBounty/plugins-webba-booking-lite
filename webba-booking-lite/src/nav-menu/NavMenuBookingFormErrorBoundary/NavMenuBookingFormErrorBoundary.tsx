import { Component } from 'react'
import { __ } from '@wordpress/i18n'
import {
    INavMenuBookingFormErrorBoundaryProps,
    INavMenuBookingFormErrorBoundaryState,
} from './types'

export class NavMenuBookingFormErrorBoundary extends Component<
    INavMenuBookingFormErrorBoundaryProps,
    INavMenuBookingFormErrorBoundaryState
> {
    public state: INavMenuBookingFormErrorBoundaryState = {
        hasError: false,
    }

    public static getDerivedStateFromError(): INavMenuBookingFormErrorBoundaryState {
        return { hasError: true }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <p>
                    {__(
                        'Booking form options could not be loaded. Refresh the page and try again.',
                        'webba-booking-lite'
                    )}
                </p>
            )
        }

        return this.props.children
    }
}
