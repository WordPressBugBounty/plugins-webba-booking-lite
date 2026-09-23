import { Editor } from '@tinymce/tinymce-react'
import { InitOptions } from '@tinymce/tinymce-react/lib/cjs/main/ts/components/Editor'
import { useEffect, useMemo, useRef, useState } from 'react'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { Label } from '../Label/Label'
import { usePreset } from '../../../../hooks/usePreset'
import {
    GIFT_CARD_DESIGN_PLACEHOLDERS,
    GIFT_CARD_DESIGN_VARIANTS,
    getDefaultGiftCardDesign,
    getGiftCardDesignVariant,
    parseGiftCardDesign,
    serializeGiftCardDesign,
} from './giftCardDesigns'
import { GiftCardDesignValue } from './types'
import './GiftCardDesignField.scss'
import '../GenericFormField/GenericFormField.scss'

export const createGiftCardDesignField: FormComponentConstructor<any> = ({
    field,
}) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const { value, setValue } = useField(field)
        const { plugin_url } = usePreset() as { plugin_url?: string }
        const shellRef = useRef<HTMLDivElement>(null)
        const editorInstanceRef = useRef<any>(null)
        const designRef = useRef<GiftCardDesignValue>(getDefaultGiftCardDesign())
        const commitDesignRef = useRef<(next: GiftCardDesignValue) => void>(
            () => undefined
        )
        const [editorHeight, setEditorHeight] = useState(520)
        const [isVisual, setIsVisual] = useState(true)
        const isVisualRef = useRef(true)
        const textAreaRef = useRef<HTMLTextAreaElement>(null)
        const editorId = useRef(
            `wbk-gift-card-editor-${String(name).replace(
                /[^a-zA-Z0-9_-]/g,
                '_'
            )}-${Math.random().toString(36).slice(2, 9)}`
        ).current

        const design = useMemo(
            () => parseGiftCardDesign(value) || getDefaultGiftCardDesign(),
            [value]
        )
        designRef.current = design
        isVisualRef.current = isVisual

        const variant = getGiftCardDesignVariant(design.variant)
        const backgroundUrl = `${plugin_url || ''}/${variant.background}`

        const commitDesign = (nextDesign: GiftCardDesignValue) => {
            setValue(serializeGiftCardDesign(nextDesign))
        }
        commitDesignRef.current = commitDesign

        const insertPlaceholderInText = (placeholder: string) => {
            const textarea = textAreaRef.current
            const html = designRef.current.html
            const start = textarea?.selectionStart ?? html.length
            const end = textarea?.selectionEnd ?? html.length
            const nextHtml = html.slice(0, start) + placeholder + html.slice(end)
            const cursor = start + placeholder.length

            commitDesign({
                variant: designRef.current.variant,
                html: nextHtml,
            })

            window.setTimeout(() => {
                if (!textAreaRef.current) {
                    return
                }

                textAreaRef.current.focus()
                textAreaRef.current.setSelectionRange(cursor, cursor)
            }, 0)
        }

        const resetDesign = () => {
            commitDesign(getDefaultGiftCardDesign(designRef.current.variant))
        }

        useEffect(() => {
            if (!isVisual) {
                editorInstanceRef.current = null
                return
            }

            const shell = shellRef.current
            if (!shell) {
                return
            }

            const updateHeight = () => {
                if (!isVisualRef.current) {
                    return
                }

                const cardHeight = Math.round(
                    (shell.clientWidth * variant.height) / variant.width
                )
                const toolbar = shell.querySelector(
                    '.mce-toolbar-grp, .tox-editor-header'
                ) as HTMLElement | null
                const toolbarHeight = toolbar?.offsetHeight || 72

                setEditorHeight(Math.max(420, cardHeight + toolbarHeight))
            }

            updateHeight()
            const observer = new ResizeObserver(updateHeight)
            observer.observe(shell)

            return () => observer.disconnect()
        }, [isVisual, variant.width, variant.height])

        useEffect(() => {
            if (!isVisual) {
                editorInstanceRef.current = null
                return
            }

            const editor = editorInstanceRef.current
            const shell = shellRef.current
            if (
                !isVisualRef.current ||
                !editor ||
                editor.removed ||
                !editor.theme?.resizeTo ||
                !shell
            ) {
                return
            }

            editor.theme.resizeTo(shell.clientWidth, editorHeight)
        }, [editorHeight, isVisual])

        const editorConfigs = useMemo(
            () =>
                ({
                    height: 520,
                    width: '100%',
                    wpautop: false,
                    forced_root_block: false,
                    language: 'en',
                    valid_elements: '*[*]',
                    extended_valid_elements: '*[*]',
                    verify_html: false,
                    formats: {
                        alignleft: [
                            {
                                selector:
                                    'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
                                styles: { textAlign: 'left' },
                            },
                        ],
                        aligncenter: [
                            {
                                selector:
                                    'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
                                styles: { textAlign: 'center' },
                            },
                        ],
                        alignright: [
                            {
                                selector:
                                    'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
                                styles: { textAlign: 'right' },
                            },
                        ],
                        strikethrough: { inline: 'del' },
                    },
                    relative_urls: false,
                    remove_script_host: false,
                    convert_urls: false,
                    browser_spellcheck: true,
                    entities: '38,amp,60,lt,62,gt',
                    entity_encoding: 'raw',
                    keep_styles: true,
                    paste_webkit_styles:
                        'font-weight font-style color font-size font-family',
                    preview_styles:
                        'font-family font-size font-weight font-style text-decoration text-transform',
                    object_resizing: false,
                    resize: false,
                    menubar: false,
                    statusbar: false,
                    toolbar: [
                        'formatselect fontsizeselect forecolor underline bold italic strikethrough | alignleft aligncenter alignright alignjustify | link unlink | undo redo | wbk_placeholders wbk_reset_design',
                    ],
                    plugins: [
                        'charmap paste textcolor wordpress wpeditimage wplink wpdialogs wpview',
                    ],
                    external_plugins: {
                        wordpress:
                            '/wp-includes/js/tinymce/plugins/wordpress/plugin.min.js',
                        wpeditimage:
                            '/wp-includes/js/tinymce/plugins/wpeditimage/plugin.min.js',
                        wplink: '/wp-includes/js/tinymce/plugins/wplink/plugin.min.js',
                        wpdialogs:
                            '/wp-includes/js/tinymce/plugins/wpdialogs/plugin.min.js',
                        wpview: '/wp-includes/js/tinymce/plugins/wpview/plugin.min.js',
                    },
                    fontsize_formats:
                        '11px 12px 13px 14px 16px 18px 22px 24px 28px 32px 36px 42px 46px',
                    content_style: `@font-face { font-family: 'Ubuntu'; src: url('${plugin_url}/src/fonts/ubuntu/Ubuntu-Light.ttf') format('truetype'); font-weight: 300; font-style: normal; } @font-face { font-family: 'Ubuntu'; src: url('${plugin_url}/src/fonts/ubuntu/Ubuntu-LightItalic.ttf') format('truetype'); font-weight: 300; font-style: italic; } @font-face { font-family: 'Ubuntu'; src: url('${plugin_url}/src/fonts/ubuntu/Ubuntu-Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; } @font-face { font-family: 'Ubuntu'; src: url('${plugin_url}/src/fonts/ubuntu/Ubuntu-Italic.ttf') format('truetype'); font-weight: 400; font-style: italic; } @font-face { font-family: 'Ubuntu'; src: url('${plugin_url}/src/fonts/ubuntu/Ubuntu-Medium.ttf') format('truetype'); font-weight: 500; font-style: normal; } @font-face { font-family: 'Ubuntu'; src: url('${plugin_url}/src/fonts/ubuntu/Ubuntu-MediumItalic.ttf') format('truetype'); font-weight: 500; font-style: italic; } @font-face { font-family: 'Ubuntu'; src: url('${plugin_url}/src/fonts/ubuntu/Ubuntu-Bold.ttf') format('truetype'); font-weight: 700; font-style: normal; } @font-face { font-family: 'Ubuntu'; src: url('${plugin_url}/src/fonts/ubuntu/Ubuntu-BoldItalic.ttf') format('truetype'); font-weight: 700; font-style: italic; } html { height: 100%; font-size: 1vh; } body { height: 100%; margin: 0 !important; padding: 0 !important; font-size: 1em; position: relative; overflow: hidden; background-color: #f7f4ea; background-image: url("${backgroundUrl}"); background-repeat: no-repeat; background-position: center top; background-size: 100% 100%; font-family: Ubuntu, Arial, Helvetica, sans-serif; }`,
                    toolbar_mode: 'wrap',
                    setup(editor: any) {
                        editorInstanceRef.current = editor
                        editor.on('remove', () => {
                            if (editorInstanceRef.current === editor) {
                                editorInstanceRef.current = null
                            }
                        })

                        const placeholderItems =
                            GIFT_CARD_DESIGN_PLACEHOLDERS.map(
                                (placeholder) => ({
                                    text: placeholder.text,
                                    onclick: () => {
                                        editor.insertContent(
                                            placeholder.content
                                        )
                                    },
                                })
                            )

                        editor.addButton('wbk_placeholders', {
                            type: 'menubutton',
                            text: __('Placeholders', 'webba-booking-lite'),
                            icon: false,
                            menu: placeholderItems,
                        })

                        editor.addMenuItem('wbk_placeholders', {
                            text: __('Placeholders', 'webba-booking-lite'),
                            menu: placeholderItems,
                            prependToContext: true,
                        })

                        editor.addButton('wbk_reset_design', {
                            text: __('Reset', 'webba-booking-lite'),
                            icon: false,
                            onclick: () => {
                                const next = getDefaultGiftCardDesign(
                                    designRef.current.variant
                                )
                                editor.setContent(next.html)
                                commitDesignRef.current(next)
                            },
                        })
                    },
                }) as unknown as InitOptions,
            [backgroundUrl]
        )

        return (
            <div className="wbk_genericFormField__field wbk_giftCardDesignField">
                <Label
                    id={editorId}
                    title={label}
                    tooltip={
                        misc?.tooltip ||
                        __(
                            'Choose a gift card design. Edit the text on the preview, or switch to Text to edit the HTML. The selected design is attached as a PDF.',
                            'webba-booking-lite'
                        )
                    }
                />
                <div className="wbk_giftCardDesignField__variants">
                    {GIFT_CARD_DESIGN_VARIANTS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={classNames(
                                'wbk_giftCardDesignField__variant',
                                {
                                    'wbk_giftCardDesignField__variant--selected':
                                        item.id === design.variant,
                                }
                            )}
                            onClick={() =>
                                commitDesign(getDefaultGiftCardDesign(item.id))
                            }
                        >
                            <img
                                className={classNames(
                                    'wbk_giftCardDesignField__variantThumb',
                                    `wbk_giftCardDesignField__variantThumb--${item.id}`
                                )}
                                src={`${plugin_url || ''}/${item.background}`}
                                alt={item.label}
                            />
                            <span className="wbk_giftCardDesignField__variantLabel">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="wbk_genericFormField__editorToggle">
                    <div
                        className={classNames(
                            'wbk_genericFormField__editorToggleButton',
                            {
                                'wbk_genericFormField__editorToggleButton--active':
                                    isVisual,
                            }
                        )}
                        onClick={() => {
                            isVisualRef.current = true
                            setIsVisual(true)
                        }}
                    >
                        {__('Visual', 'webba-booking-lite')}
                    </div>
                    <div
                        className={classNames(
                            'wbk_genericFormField__editorToggleButton',
                            {
                                'wbk_genericFormField__editorToggleButton--active':
                                    !isVisual,
                            }
                        )}
                        onClick={() => {
                            isVisualRef.current = false
                            editorInstanceRef.current = null
                            setIsVisual(false)
                        }}
                    >
                        {__('Text', 'webba-booking-lite')}
                    </div>
                </div>
                <div
                    ref={shellRef}
                    className="wbk_genericFormField__editorShell wbk_giftCardDesignField__editorShell"
                >
                    {isVisual && (
                        <Editor
                            key={`${editorId}-${design.variant}-${backgroundUrl}`}
                            id={editorId}
                            value={design.html}
                            init={editorConfigs}
                            onEditorChange={(content: string) => {
                                commitDesign({
                                    variant: designRef.current.variant,
                                    html: content,
                                })
                            }}
                        />
                    )}
                    {!isVisual && (
                        <>
                            <div className="wbk_giftCardDesignField__textToolbar">
                                <select
                                    className="wbk_giftCardDesignField__placeholderSelect"
                                    defaultValue=""
                                    onChange={(event) => {
                                        if (!event.target.value) {
                                            return
                                        }

                                        insertPlaceholderInText(
                                            event.target.value
                                        )
                                        event.target.value = ''
                                    }}
                                >
                                    <option value="" disabled>
                                        {__(
                                            'Placeholders',
                                            'webba-booking-lite'
                                        )}
                                    </option>
                                    {GIFT_CARD_DESIGN_PLACEHOLDERS.map(
                                        (placeholder) => (
                                            <option
                                                key={placeholder.content}
                                                value={placeholder.content}
                                            >
                                                {placeholder.text}
                                            </option>
                                        )
                                    )}
                                </select>
                                <button
                                    type="button"
                                    className="wbk_giftCardDesignField__resetButton"
                                    onClick={resetDesign}
                                >
                                    {__('Reset', 'webba-booking-lite')}
                                </button>
                            </div>
                            <textarea
                                ref={textAreaRef}
                                className={classNames(
                                    'wbk_genericFormField__rawEditor',
                                    'wbk_genericFormField__input',
                                    'wbk_giftCardDesignField__rawEditor'
                                )}
                                name={name}
                                id={editorId}
                                spellCheck={false}
                                value={design.html}
                                onChange={(event) => {
                                    commitDesign({
                                        variant: designRef.current.variant,
                                        html: event.target.value,
                                    })
                                }}
                            />
                        </>
                    )}
                </div>
            </div>
        )
    }
}
