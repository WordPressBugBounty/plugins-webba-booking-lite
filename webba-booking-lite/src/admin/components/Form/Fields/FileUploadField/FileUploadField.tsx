import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import classNames from 'classnames'
import { InputHTMLAttributes, useEffect, useState, useRef } from 'react'
import './FileUploadField.scss'
import { Label } from '../Label/Label'
import { FormFieldMisc } from '../../types'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
// @ts-ignore
// eslint-disable-next-line
declare global { interface Window { wp: any } }

interface FileUploadFieldProps {
    value: any
    onChange: (value: any) => void
    errors?: string[] | readonly string[]
    label: string
    id: string
    misc?: FormFieldMisc
}

const FileUploadInput = ({
    errors = [],
    label,
    id,
    value,
    onChange,
    misc,
}: FileUploadFieldProps) => {
    const [touched, setTouched] = useState(false)
    const isValid = !errors.length
    const showErrors = !isValid && touched
    const [firstError] = errors
    const { is_pro } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const [fileInfo, setFileInfo] = useState<{ id: number; filename: string; url?: string } | null>(null)
    const [loading, setLoading] = useState(false)
    const mediaFrameRef = useRef<any>(null)

    // Helper function to check if value is a valid attachment ID
    const isValidAttachmentId = (val: any): val is number => {
        const numVal = Number(val)
        return !isNaN(numVal) && numVal > 0 && isFinite(numVal)
    }

    // Fetch file info if value is set
    useEffect(() => {
        
        if (value && window.wp && window.wp.media) {
            const attachmentId = Number(value)
            if (isValidAttachmentId(attachmentId)) {
                setLoading(true)
                
                const attachment = window.wp.media.attachment(attachmentId)
                
                attachment.fetch().then(() => {
                    try {
                        const att = attachment.toJSON()
                        
                        let previewUrl = att.url;
                        
                        // Try to get the best preview size
                        if (att.sizes) {
                            if (att.sizes.thumbnail) {
                                previewUrl = att.sizes.thumbnail.url;
                            } else if (att.sizes.medium) {
                                previewUrl = att.sizes.medium.url;
                            } else if (att.sizes.full) {
                                previewUrl = att.sizes.full.url;
                            }
                        }
                        
                        setFileInfo({ 
                            id: attachmentId, 
                            filename: att.filename || att.title || `Attachment ${attachmentId}`, 
                            url: previewUrl 
                        });
                    } catch (error) {
                        setFileInfo(null);
                    }
                    setLoading(false);
                }).catch((error: any) => {
                    setFileInfo(null);
                    setLoading(false);
                });
            } else {
                setFileInfo(null)
                setLoading(false)
            }
        } else {
            setFileInfo(null)
            setLoading(false)
        }
    }, [value])

    const openMediaModal = () => {
        if (!window.wp || !window.wp.media) return
        if (mediaFrameRef.current) {
            mediaFrameRef.current.open()
            return
        }
        const frame = window.wp.media({
            title: 'Select or Upload Image',
            button: { text: 'Use this image' },
            multiple: false,
            library: { type: 'image' }, // Only allow images
        })
        frame.on('select', () => {
            const attachment = frame.state().get('selection').first().toJSON()
            onChange(attachment.id)
        })
        mediaFrameRef.current = frame
        frame.open()
    }

    const removeFile = () => {
        setFileInfo(null)
        onChange(null) // Changed from new File([], '') to null
    }

    if (loading) {
        return (
            <div className={classNames('wbk_fileUploadField__field')}>
                <div className={"wbk_fileUploadField__inputContainer"}>
                    <Label title={label} id={id} tooltip={misc?.tooltip} />
                </div>
                <div className={"wbk_fileUploadField__inputContainer"}>
                    <div className={"wbk_fileUploadField__uploadArea"} style={{ opacity: 0.5 }}>
                        <div className={"wbk_fileUploadField__uploadContent"}>
                            <div className={"wbk_fileUploadField__uploadText"}>
                                <span className={"wbk_fileUploadField__uploadTitle"}>Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className={classNames('wbk_fileUploadField__field', {
                ['wbk_fileUploadField__field--invalid']: showErrors,
            })}
        >
            <div className={"wbk_fileUploadField__inputContainer"}>
                <Label title={label} id={id} tooltip={misc?.tooltip} />
            </div>
            <div className={"wbk_fileUploadField__inputContainer"}>
                {!fileInfo ? (
                    <div
                        className={"wbk_fileUploadField__uploadArea"}
                        onClick={openMediaModal}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer', opacity: misc?.disabled || (misc?.pro_version && !is_pro) ? 0.5 : 1 }}
                        aria-disabled={misc?.disabled || (misc?.pro_version && !is_pro)}
                    >
                        <div className={"wbk_fileUploadField__uploadContent"}>
                            <div className={"wbk_fileUploadField__uploadIcon"}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 16L12 8M12 8L15 11M12 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M3 15V16C3 18.8284 3 20.2426 3.87868 21.1213C4.75736 22 6.17157 22 9 22H15C17.8284 22 19.2426 22 20.1213 21.1213C21 20.2426 21 18.8284 21 16V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className={"wbk_fileUploadField__uploadText"}>
                                <span className={"wbk_fileUploadField__uploadTitle"}>Select or upload an image</span>
                                <span className={"wbk_fileUploadField__uploadSubtitle"}>Only image files are accepted</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={"wbk_fileUploadField__filePreview"}>
                        <div className={"wbk_fileUploadField__fileInfo"}>
                            <div className={"wbk_fileUploadField__fileIcon"}>
                                {fileInfo.url && fileInfo.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                                    <img src={fileInfo.url} alt={fileInfo.filename} style={{ maxWidth: 96, maxHeight: 96, borderRadius: 4 }} />
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </div>
                            <span className={"wbk_fileUploadField__fileName"}>{fileInfo.filename} (ID: {fileInfo.id})</span>
                        </div>
                        <button
                            type="button"
                            className={"wbk_fileUploadField__removeButton"}
                            onClick={removeFile}
                            disabled={
                                misc?.disabled ||
                                (misc?.pro_version && !is_pro)
                            }
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>
            {showErrors && (
                <div className={"wbk_fileUploadField__errorContainer"}>{firstError}</div>
            )}
        </div>
    )
}

export const createFileUploadField: FormComponentConstructor<File> = ({
    field,
    fieldConfig,
}) => {
    // Remove file size and type validation (not supported by FormFieldMisc)
    field.setValidators([])

    return ({ name, label, misc }) => {
        const { value, setValue, errors } = useField(field)
        const [touched, setTouched] = useState(false)
        const isValid = !errors.length
        const showErrors = !isValid && touched
        const [firstError] = errors
        const { is_pro } = useSelect(
            // @ts-ignore
            (select) => select(store_name).getPreset(),
            []
        )
        const [fileInfo, setFileInfo] = useState<{ id: number; filename: string; url?: string } | null>(null)
        const [loading, setLoading] = useState(false)
        const mediaFrameRef = useRef<any>(null)

        // Helper function to check if value is a valid attachment ID
        const isValidAttachmentId = (val: any): val is number => {
            const numVal = Number(val)
            return !isNaN(numVal) && numVal > 0 && isFinite(numVal)
        }

        // Fetch file info if value is set
        useEffect(() => {
            
            if (value && window.wp && window.wp.media) {
                const attachmentId = Number(value)
                if (isValidAttachmentId(attachmentId)) {
                    setLoading(true)
                    
                    const attachment = window.wp.media.attachment(attachmentId)
                    
                    attachment.fetch().then(() => {
                        try {
                            const att = attachment.toJSON()
                            
                            let previewUrl = att.url;
                            
                            // Try to get the best preview size
                            if (att.sizes) {
                                if (att.sizes.thumbnail) {
                                    previewUrl = att.sizes.thumbnail.url;
                                } else if (att.sizes.medium) {
                                    previewUrl = att.sizes.medium.url;
                                } else if (att.sizes.full) {
                                    previewUrl = att.sizes.full.url;
                                }
                            }
                            
                            setFileInfo({ 
                                id: attachmentId, 
                                filename: att.filename || att.title || `Attachment ${attachmentId}`, 
                                url: previewUrl 
                            });
                        } catch (error) {
                            setFileInfo(null);
                        }
                        setLoading(false);
                    }).catch((error: any) => {
                        setFileInfo(null);
                        setLoading(false);
                    });
                } else {
                    setFileInfo(null)
                    setLoading(false)
                }
            } else {
                setFileInfo(null)
                setLoading(false)
            }
        }, [value])

        const openMediaModal = () => {
            if (!window.wp || !window.wp.media) return
            if (mediaFrameRef.current) {
                mediaFrameRef.current.open()
                return
            }
            const frame = window.wp.media({
                title: 'Select or Upload Image',
                button: { text: 'Use this image' },
                multiple: false,
                library: { type: 'image' }, // Only allow images
            })
            frame.on('select', () => {
                const attachment = frame.state().get('selection').first().toJSON()
                setValue(attachment.id)
            })
            mediaFrameRef.current = frame
            frame.open()
        }

        const removeFile = () => {
            setFileInfo(null)
            setValue('') // Changed from new File([], '') to null
        }

        if (loading) {
            return (
                <div className={classNames('wbk_fileUploadField__field')}>
                    <div className={"wbk_fileUploadField__inputContainer"}>
                        <Label title={label} id={name} tooltip={misc?.tooltip} />
                    </div>
                    <div className={"wbk_fileUploadField__inputContainer"}>
                        <div className={"wbk_fileUploadField__uploadArea"} style={{ opacity: 0.5 }}>
                            <div className={"wbk_fileUploadField__uploadContent"}>
                                <div className={"wbk_fileUploadField__uploadText"}>
                                    <span className={"wbk_fileUploadField__uploadTitle"}>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div
                className={classNames('wbk_fileUploadField__field', {
                    ['wbk_fileUploadField__field--invalid']: showErrors,
                })}
            >
                <div className={"wbk_fileUploadField__inputContainer"}>
                    <Label title={label} id={name} tooltip={misc?.tooltip} />
                </div>
                <div className={"wbk_fileUploadField__inputContainer"}>
                    {!fileInfo ? (
                        <div
                            className={"wbk_fileUploadField__uploadArea"}
                            onClick={openMediaModal}
                            role="button"
                            tabIndex={0}
                            style={{ cursor: 'pointer', opacity: misc?.disabled || (misc?.pro_version && !is_pro) ? 0.5 : 1 }}
                            aria-disabled={misc?.disabled || (misc?.pro_version && !is_pro)}
                        >
                            <div className={"wbk_fileUploadField__uploadContent"}>
                                <div className={"wbk_fileUploadField__uploadIcon"}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 16L12 8M12 8L15 11M12 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M3 15V16C3 18.8284 3 20.2426 3.87868 21.1213C4.75736 22 6.17157 22 9 22H15C17.8284 22 19.2426 22 20.1213 21.1213C21 20.2426 21 18.8284 21 16V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div className={"wbk_fileUploadField__uploadText"}>
                                    <span className={"wbk_fileUploadField__uploadTitle"}>Select or upload an image</span>
                                    <span className={"wbk_fileUploadField__uploadSubtitle"}>Only image files are accepted</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={"wbk_fileUploadField__filePreview"}>
                            <div className={"wbk_fileUploadField__fileInfo"}>
                                <div className={"wbk_fileUploadField__fileIcon"}>
                                    {fileInfo.url && fileInfo.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                                        <img src={fileInfo.url} alt={fileInfo.filename} style={{ maxWidth: 96, maxHeight: 96, borderRadius: 4 }} />
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </div>
                                <span className={"wbk_fileUploadField__fileName"}>{fileInfo.filename} (ID: {fileInfo.id})</span>
                            </div>
                            <button
                                type="button"
                                className={"wbk_fileUploadField__removeButton"}
                                onClick={removeFile}
                                disabled={
                                    misc?.disabled ||
                                    (misc?.pro_version && !is_pro)
                                }
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
                {showErrors && (
                    <div className={"wbk_fileUploadField__errorContainer"}>{firstError}</div>
                )}
            </div>
        )
    }
}