import { Editor } from '@tinymce/tinymce-react'
import { InitOptions } from '@tinymce/tinymce-react/lib/cjs/main/ts/components/Editor'
import { FormFieldProps } from '../../types'
import { __ } from '@wordpress/i18n'
import { Label } from '../Label/Label'
import { useState } from 'react'
import styles from './../GenericFormField/GenericFormField.module.scss'
import { FormComponentConstructor } from '../../lib/types'
import { useField } from '../../lib/hooks/useField'
import classNames from 'classnames'

const placeHolders: Record<
    'name' | 'text' | 'content',
    string | ((editor: any) => string)
>[] = [
    {
        name: 'wbk_service_name_button',
        text: __('Service Name', 'webba-booking-lite'),
        content: '#service_name',
    },
    {
        name: 'wbk_category_names_button',
        text: __('Category names', 'webba-booking-lite'),
        content: '#category_names',
    },
    {
        name: 'wbk_customer_name_button',
        text: __('Customer Name', 'webba-booking-lite'),
        content: '#customer_name',
    },
    {
        name: 'wbk_booking_order_button',
        text: __('Booking order', 'webba-booking-lite'),
        content: '#booking_order',
    },
    {
        name: 'wbk_appointment_day_button',
        text: __('Booking date', 'webba-booking-lite'),
        content: '#appointment_day',
    },
    {
        name: 'wbk_appointment_time_button',
        text: __('Booking time', 'webba-booking-lite'),
        content: '#appointment_time',
    },
    {
        name: 'wbk_appointment_local_day_button',
        text: __('Booking local date', 'webba-booking-lite'),
        content: '#appointment_local_date',
    },
    {
        name: 'wbk_appointment_local_time_button',
        text: __('Booking local time', 'webba-booking-lite'),
        content: '#appointment_local_time',
    },
    {
        name: 'wbk_appointment_id_button',
        text: __('Appointment ID', 'webba-booking-lite'),
        content: '#appointment_id',
    },
    {
        name: 'wbk_customer_phone_button',
        text: __('Customer phone', 'webba-booking-lite'),
        content: '#customer_phone',
    },
    {
        name: 'wbk_customer_email_button',
        text: __('Customer email', 'webba-booking-lite'),
        content: '#customer_email',
    },
    {
        name: 'wbk_customer_comment_button',
        text: __('Customer comment', 'webba-booking-lite'),
        content: '#customer_comment',
    },
    {
        name: 'wbk_customer_custom_button',
        text: __('Custom data', 'webba-booking-lite'),
        content: '#customer_custom',
    },
    {
        name: 'wbk_items_count',
        text: __('Items count', 'webba-booking-lite'),
        content: '#items_count',
    },
    {
        name: 'wbk_total_amount',
        text: __('Total amount', 'webba-booking-lite'),
        content: '#total_amount',
    },
    {
        name: 'wbk_payment_link',
        text: __('Payment link', 'webba-booking-lite'),
        content: '#payment_link',
    },
    {
        name: 'wbk_cancel_link',
        text: __('Cancel link', 'webba-booking-lite'),
        content: '#cancel_link',
    },
    {
        name: 'wbk_tomorrow_agenda',
        text: __('Agenda for tomorrow', 'webba-booking-lite'),
        content: '#tomorrow_agenda',
    },
    {
        name: 'wbk_group_customer',
        text: __('Group customer name', 'webba-booking-lite'),
        content: '#group_customer_name',
    },
    {
        name: 'wbk_admin_cancel_link',
        text: __('Administrator cancel link', 'webba-booking-lite'),
        content: '#admin_cancel_link',
    },
    {
        name: 'wbk_admin_approve_link',
        text: __('Administrator approval link', 'webba-booking-lite'),
        content: '#admin_approve_link',
    },
    {
        name: 'wbk_customer_ggcl_link',
        text: __('Customer Google Calendar link', 'webba-booking-lite'),
        content: '#add_event_link',
    },
    {
        name: 'wbk_time_range',
        text: __('Booking time range', 'webba-booking-lite'),
        content: '#time_range',
    },
    {
        name: 'wbk_user_email_button',
        text: __('User email (account)', 'webba-booking-lite'),
        content: '#user_email',
    },
    {
        name: 'wbk_user_pass_button',
        text: __('User password (account)', 'webba-booking-lite'),
        content: '##user_pass',
    },
    {
        name: 'wbk_multiple_loop',
        text: __('Create loop', 'webba-booking-lite'),
        content: (editor) => {
            var selected = editor.selection.getContent({
                format: 'html',
            })
            selected =
                '[appointment_loop_start]' + selected + '[appointment_loop_end]'

            return selected
        },
    },
]

const editorConfigs: InitOptions = {
    height: 150,
    wpautop: true,
    language: 'en',
    valid_elements: '*[*]',
    formats: {
        alignleft: [
            {
                selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
                styles: { textAlign: 'left' },
            },
            {
                selector: 'img,table,dl.wp-caption',
                classes: 'alignleft',
            },
        ],
        aligncenter: [
            {
                selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
                styles: { textAlign: 'center' },
            },
            {
                selector: 'img,table,dl.wp-caption',
                classes: 'aligncenter',
            },
        ],
        alignright: [
            {
                selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
                styles: { textAlign: 'right' },
            },
            {
                selector: 'img,table,dl.wp-caption',
                classes: 'alignright',
            },
        ],
        strikethrough: { inline: 'del' },
    },
    relative_urls: false,
    remove_script_host: false,
    convert_urls: false,
    browser_spellcheck: true,
    fix_list_elements: true,
    entities: '38,amp,60,lt,62,gt',
    entity_encoding: 'raw',
    keep_styles: true,
    paste_webkit_styles: 'font-weight font-style color',
    preview_styles:
        'font-family font-size font-weight font-style text-decoration text-transform',
    tabfocus_elements: ':prev,:next',
    plugins: [
        'charmap hr media paste tabfocus textcolor wordpress wpeditimage wpgallery wplink wpdialogs wpview',
    ],
    external_plugins: {
        wordpress: '/wp-includes/js/tinymce/plugins/wordpress/plugin.min.js',
        wpeditimage:
            '/wp-includes/js/tinymce/plugins/wpeditimage/plugin.min.js',
        wpgallery: '/wp-includes/js/tinymce/plugins/wpgallery/plugin.min.js',
        wplink: '/wp-includes/js/tinymce/plugins/wplink/plugin.min.js',
        wpdialogs: '/wp-includes/js/tinymce/plugins/wpdialogs/plugin.min.js',
        wpview: '/wp-includes/js/tinymce/plugins/wpview/plugin.min.js',
    },
    resize: true,
    menubar: false,
    toolbar: [
        'formatselect forecolor underline bold italic | bullist numlist | alignleft aligncenter alignright alignjustify | spellchecker fullscreen wp_adv outdent indent blockquote hr strikethrough wp_more pastetext removeformat charmap link unlink undo redo wbk_placeholders',
    ],
    body_class: 'id post-type-post post-status-publish post-format-standard',
    wpeditimage_disable_captions: false,
    wpeditimage_html5_captions: true,
    setup(editor: any) {
        let placeholderItems: Record<string, any>[] = []
        placeHolders.map((placeholder) => {
            placeholderItems.push({
                text: placeholder.text,
                onclick: () => {
                    editor.insertContent(
                        typeof placeholder.content === 'function'
                            ? placeholder.content(editor)
                            : placeholder.content
                    )
                },
            })
        })

        editor.addButton('wbk_placeholders', {
            type: 'menubutton',
            text: __('Webba Placeholders', 'webba-booking-lite'),
            menu: placeholderItems,
        })

        editor?.addMenuItem('wbk_placeholders', {
            text: __('Webba Placeholders', 'webba-booking-lite'),
            menu: placeholderItems,
            prependToContext: true,
        })
    },
    toolbar_mode: 'wrap',
}

export const createEditorField: FormComponentConstructor<any> = ({ field }) => {
    return ({ name, label, misc }) => {
        const { value, setValue, errors } = useField(field)
        const [touched, setTouched] = useState(false)

        const isValid = !errors.length
        const showErrors = !isValid && touched
        const [firstError] = errors
        const [isVisual, setIsVisual] = useState(true)

        return (
            <div>
                <div>
                    <Label id={name} title={label} tooltip={misc?.tooltip} />
                </div>
                <div className={styles.editorToggle}>
                    <div
                        className={classNames(styles.editorToggleButton, {
                            [styles.editorToggleButtonActive]: isVisual,
                        })}
                        onClick={() => setIsVisual(true)}
                    >
                        {__('Visual', 'webba-booking-lite')}
                    </div>
                    <div
                        className={classNames(styles.editorToggleButton, {
                            [styles.editorToggleButtonActive]: !isVisual,
                        })}
                        onClick={() => setIsVisual(false)}
                    >
                        {__('Text', 'webba-booking-lite')}
                    </div>
                </div>
                <div>
                    {isVisual && (
                        <Editor
                            id={name}
                            onEditorChange={(content: string): void =>
                                setValue(content)
                            }
                            value={value}
                            init={editorConfigs}
                            onClick={() => setTouched(true)}
                        />
                    )}
                    {!isVisual && (
                        <textarea
                            className={classNames(
                                styles.rawEditor,
                                styles.input
                            )}
                            name={name}
                            id={name}
                            onChange={(e) => setValue(e.target.value)}
                        >
                            {value}
                        </textarea>
                    )}
                </div>
                {showErrors && (
                    <div className={styles.errorContainer}>{firstError}</div>
                )}
            </div>
        )
    }
}
