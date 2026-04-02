import { __ } from '@wordpress/i18n'

const borderRadiusOptions = [
    {
        value: 0,
        label: __('None', 'webba-booking-lite'),
    },
    {
        value: '2px',
        label: __('2px', 'webba-booking-lite'),
    },
    {
        value: '4px',
        label: __('4px', 'webba-booking-lite'),
    },
    {
        value: '6px',
        label: __('6px', 'webba-booking-lite'),
    },
    {
        value: '8px',
        label: __('8px (Default)', 'webba-booking-lite'),
    },
    {
        value: '10px',
        label: __('10px', 'webba-booking-lite'),
    },
    {
        value: '12px',
        label: __('12px', 'webba-booking-lite'),
    },
    {
        value: '14px',
        label: __('14px', 'webba-booking-lite'),
    },
    {
        value: '16px',
        label: __('16px', 'webba-booking-lite'),
    },
    {
        value: '18px',
        label: __('18px', 'webba-booking-lite'),
    },
    {
        value: '20px',
        label: __('20px', 'webba-booking-lite'),
    },
    {
        value: '22px',
        label: __('22px', 'webba-booking-lite'),
    },
    {
        value: '24px',
        label: __('24px', 'webba-booking-lite'),
    },
    {
        value: '26px',
        label: __('26px', 'webba-booking-lite'),
    },
    {
        value: '28px',
        label: __('28px', 'webba-booking-lite'),
    },
    {
        value: '30px',
        label: __('30px', 'webba-booking-lite'),
    },
    {
        value: '32px',
        label: __('32px', 'webba-booking-lite'),
    },
    {
        value: '34px',
        label: __('34px', 'webba-booking-lite'),
    },
    {
        value: '36px',
        label: __('36px', 'webba-booking-lite'),
    },
    {
        value: '38px',
        label: __('38px', 'webba-booking-lite'),
    },
    {
        value: '40px',
        label: __('40px', 'webba-booking-lite'),
    },
]

export const sections = [
    // MAIN SETTINGS
    {
        id: 'general',
        title: __('General Appearance Settings', 'webba-booking-lite'),
        fields: [
            {
                id: 'bg_accent',
                label: __('Accent Color', 'webba-booking-lite'),
                type: 'color',
                default: '#15B8A9',
            },
            {
                id: 'font',
                label: __('Font', 'webba-booking-lite'),
                type: 'select',
                options: [
                    {
                        value: '"Ubuntu", sans-serif',
                        label: __('Default Webba Font', 'webba-booking-lite'),
                    },
                    {
                        value: 'inherit',
                        label: __('Inherited From Theme', 'webba-booking-lite'),
                    },
                ],
                default: 'default',
                warning: __(
                    'Changes will  not reflect in preview',
                    'webba-booking-lite'
                ),
            },
            {
                id: 'border_radius',
                label: __('Form Border Radius', 'webba-booking-lite'),
                type: 'select',
                options: borderRadiusOptions,
                default: '8px',
            },
            {
                id: 'shadow',
                label: __('Form Shadow', 'webba-booking-lite'),
                type: 'shadow',
                default: '0px 0px 16px 0px #3f3f4629',
            },
        ],
    },
    // BUTTONS
    {
        id: 'advanced',
        title: __('Advanced Appearance Settings', 'webba-booking-lite'),
        requiredPlans: ['standard', 'premium', 'pro'],
        subsections: [
            {
                id: 'button_radius',
                fields: [
                    {
                        id: 'button_border_radius',
                        label: __(
                            "Buttons' Border Radius",
                            'webba-booking-lite'
                        ),
                        type: 'select',
                        options: borderRadiusOptions,
                        default: '8px',
                    },
                ],
            },
            {
                id: 'button_primary',
                title: __('Main Button', 'webba-booking-lite'),
                fields: [
                    {
                        id: 'bg_button_primary',
                        label: __('Default Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#15B8A9',
                    },
                    {
                        id: 'color_button_primary',
                        label: __('Default Text Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#ffffff',
                    },
                    {
                        id: 'bg_button_primary_hover',
                        label: __('Hover-on Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#1A5B57',
                    },
                    {
                        id: 'color_button_primary_hover',
                        label: __('Hover-on Text Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#ffffff',
                    },
                ],
            },
            {
                id: 'button_inactive',
                title: __(
                    'Inactive Button (when action is needed to activate)',
                    'webba-booking-lite'
                ),
                fields: [
                    {
                        id: 'bg_button_inactive',
                        label: __('Default Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#edeff3',
                    },
                    {
                        id: 'color_button_inactive',
                        label: __('Default Text Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#ffffff',
                    },
                ],
            },
            {
                id: 'button_selected',
                title: __(
                    'Selected Button (when selecting service in mobile)',
                    'webba-booking-lite'
                ),
                fields: [
                    {
                        id: 'bg_button_selected',
                        label: __('Default Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#15B8A9',
                    },
                    {
                        id: 'color_button_selected',
                        label: __('Default Text Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#ffffff',
                    },
                    {
                        id: 'bg_button_selected_hover',
                        label: __('Hover-on Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#1A5B57',
                    },
                    {
                        id: 'color_button_selected_hover',
                        label: __('Hover-on Text Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#ffffff',
                    },
                    {
                        id: 'bg_button_selected_selected',
                        label: __('Selected Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#ffffff',
                    },
                    {
                        id: 'color_button_selected_selected',
                        label: __('Selected Text Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#22292f',
                    },
                ],
            },
            {
                id: 'button_secondary',
                title: __(
                    '+Add More Button (in the Sidebar)',
                    'webba-booking-lite'
                ),
                fields: [
                    {
                        id: 'bg_button_secondary',
                        label: __('Default Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#edeff2',
                    },
                    {
                        id: 'color_button_secondary',
                        label: __('Default Text Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#ffffff',
                    },
                    {
                        id: 'bg_button_secondary_hover',
                        label: __('Hover-on Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#1A5B57',
                    },
                    {
                        id: 'color_button_secondary_hover',
                        label: __('Hover-on Text Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#ffffff',
                    },
                ],
            },
            {
                id: 'sidebar',
                title: __('Sidebar styling', 'webba-booking-lite'),
                fields: [
                    {
                        id: 'bg_sidebar',
                        label: __('Background Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#f9fafb',
                    },
                    {
                        id: 'color_sidebar',
                        label: __('Text Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#22292F',
                    },
                ],
            },
            {
                id: 'selected_elements',
                title: __(
                    'Selected Elements styling (service boxes, dates, timeslots)',
                    'webba-booking-lite'
                ),
                fields: [
                    {
                        id: 'color_border_selected',
                        label: __('Border Color', 'webba-booking-lite'),
                        type: 'color',
                        default: '#15B8A9',
                    },
                ],
            },
        ],
    },
]
