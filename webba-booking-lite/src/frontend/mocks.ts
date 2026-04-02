import { IServiceProps } from './components/Services/types'
import { IField, IFieldConfig } from './components/Form/types'
import { ISidebarProps } from './components/Sidebar/types'

// @ts-ignore
export const mockCategories = [
    {
        id: 1,
        name: 'Beauty',
    },
    {
        id: 2,
        name: 'Massage',
    },
    {
        id: 3,
        name: 'Yoga',
    },
    {
        id: 4,
        name: 'Wellness',
    },
    {
        id: 5,
        name: 'Fitness',
    },
    {
        id: 6,
        name: 'Nutrition',
    },
    {
        id: 7,
        name: 'Meditation',
    },
    {
        id: 8,
        name: 'Therapy',
    },
]

export const mockServices: IServiceProps[] = [
    {
        id: 1,
        name: 'Haircut',
        duration: '30',
        price: '15',
        description:
            'A haircut is a cut or style of hair. It may refer to a specific style or technique of cutting, or to the result of such a cut. A haircut is a cut or style of hair. It may refer to a specific style or technique of cutting, or to the result of such a cut.',
        image: 'https://lh6.googleusercontent.com/proxy/G_p2LpvJ4Hfe2uBBUMBIl7H5caAYIhTTn7WK4xW0cHlwCONhWtYKBCJNMNjOVRBtwtCqxwv383KSroInLrnmLPDZugW5ZYSKQ9b0dEgGTg4dO8E-vHTP3ToFZBxTuObLC59Z9yIm7HE-ktbLeQ',
        setValue: () => {},
        value: [],
        quantity: 1,
        maxQuantity: 5,
        category: mockCategories[0],
    },
    {
        id: 2,
        name: 'Manicure',
        duration: '45',
        price: '20',
        description:
            'A manicure is a beauty treatment for the fingernails and hands. It usually involves shaping the nails, and applying nail polish.',
        // image: 'https://lh6.googleusercontent.com/proxy/G_p2LpvJ4Hfe2uBBUMBIl7H5caAYIhTTn7WK4xW0cHlwCONhWtYKBCJNMNjOVRBtwtCqxwv383KSroInLrnmLPDZugW5ZYSKQ9b0dEgGTg4dO8E-vHTP3ToFZBxTuObLC59Z9yIm7HE-ktbLeQ',
        setValue: () => {},
        value: [],
        category: mockCategories[0],
    },
    {
        id: 3,
        name: 'Massage',
        duration: '60',
        price: '30',
        description:
            'Massage is the manipulation of soft tissue in the body. Massage techniques are commonly applied with hands, fingers, elbows, knees, forearms, feet, or a massage device.',
        image: 'https://lh6.googleusercontent.com/proxy/G_p2LpvJ4Hfe2uBBUMBIl7H5caAYIhTTn7WK4xW0cHlwCONhWtYKBCJNMNjOVRBtwtCqxwv383KSroInLrnmLPDZugW5ZYSKQ9b0dEgGTg4dO8E-vHTP3ToFZBxTuObLC59Z9yIm7HE-ktbLeQ',
        setValue: () => {},
        value: [],
        category: mockCategories[1],
    },
]

export const mockFields: IFieldConfig[] = [
    {
        slug: 'email',
        label: 'Email Address',
        required: true,
        value: '',
        type: 'email',
        width: 'full-width',
        defaultValue: '',
    },
    {
        slug: 'phone',
        label: 'Phone Number',
        required: false,
        value: '',
        type: 'phone',
        width: 'half-width',
        defaultValue: '',
    },
    {
        slug: 'subscribe',
        label: 'Subscribe to Newsletter',
        required: false,
        value: false,
        type: 'checkbox',
        width: 'full-width',
        checkboxText: 'Yes, I want to subscribe',
        defaultValue: false,
    },
    {
        slug: 'name',
        label: 'Full Name',
        required: true,
        value: '',
        type: 'text',
        width: 'full-width',
        defaultValue: '',
    },
    {
        slug: 'feedback',
        label: 'Feedback',
        required: false,
        value: '',
        type: 'textarea',
        width: 'full-width',
        defaultValue: '',
    },
    {
        slug: 'age',
        label: 'Age',
        required: false,
        value: 0,
        type: 'number',
        width: 'half-width',
        defaultValue: 0,
    },
    {
        slug: 'resume',
        label: 'Resume',
        required: false,
        value: null,
        type: 'file',
        width: 'full-width',
        defaultValue: null,
    },
    {
        slug: 'services',
        label: 'Select Service',
        required: true,
        value: '',
        type: 'select',
        width: 'full-width',
        options: ['Haircut', 'Manicure', 'Massage'],
        defaultValue: 'Haircut',
    },
]

export const mockSidebar: ISidebarProps = {
    title: 'Summary',
    items: [
        {
            id: 1,
            serviceName: 'Haircut',
            timeslots: ['10:00 AM', '11:00 AM', '12:00 PM'],
            amount: '50',
        },
        {
            id: 2,
            serviceName: 'Manicure',
            timeslots: ['1:00 PM', '2:00 PM', '3:00 PM'],
            amount: '30',
        },
        {
            id: 3,
            serviceName: 'Massage',
            amount: '70',
        },
    ],
    onItemRemoved: () => {},
    onAddMore: () => {},
    helpTitle: 'Need help?',
    helpText:
        '<p>If you need help, please call us at <a href="tel:+1-800-123-4567">+1-800-123-4567</a> or email us at <a href="mailto:info@webba-booking.com">info@webba-booking.com</a></p>',
}
