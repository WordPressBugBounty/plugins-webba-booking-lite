import { useField } from '../../Form/hooks/useField'
import { IFieldProps } from '../../Form/types'
import { useDropzone } from 'react-dropzone'
import { __ } from '@wordpress/i18n'
import './FileInput.scss'
import iconFileUpload from '../../../../../public/images/icon-file-upload.svg'
import { useState, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import { useWording } from '../../../hooks/useWording'

export const FileInput = ({ fieldConstructor, anyTouched }: IFieldProps) => {
    const wording = useWording()
    const { placeholder, errors, setValue, touched, setTouched, width } =
        useField(fieldConstructor)

    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [localError, setLocalError] = useState<string | null>(null)

    const showError =
        (errors && errors.length > 0 && (anyTouched || touched)) || !!localError

    const onDrop = useCallback(
        (accepted: File[], fileRejections: any[]) => {
            let validFiles: File[] = [...selectedFiles]
            let errorMsg = ''
            accepted.forEach((file) => {
                const isValidType =
                    file.type === 'application/pdf' ||
                    file.type === 'application/msword' ||
                    file.type ===
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    file.type === 'image/png' ||
                    file.type === 'image/jpeg' ||
                    file.type === 'image/jpg' ||
                    file.type === 'image/svg+xml' ||
                    file.type === 'image/bmp'
                const isValidSize = file.size <= 10 * 1024 * 1024
                if (!isValidType) {
                    errorMsg =
                        wording.only_pdf_doc ||
                        __(
                            'Only PDF, DOC/DOCX, and image files (PNG, JPG, JPEG, SVG, BMP) are allowed.',
                            'webba-booking-lite'
                        )
                } else if (!isValidSize) {
                    errorMsg =
                        wording.file_size_limit ||
                        __(
                            'File size must not exceed 10MB.',
                            'webba-booking-lite'
                        )
                } else {
                    validFiles.push(file)
                }
            })
            setLocalError(errorMsg)
            setSelectedFiles(validFiles)
        },
        [selectedFiles, wording]
    )

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                ['.docx'],
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/jpg': ['.jpg'],
            'image/svg+xml': ['.svg'],
            'image/bmp': ['.bmp'],
        },
        maxSize: 10 * 1024 * 1024,
        onDrop,
        multiple: true,
    })

    useEffect(() => {
        setValue([...selectedFiles])
    }, [selectedFiles])

    const removeFile = (fileName: string) => {
        setSelectedFiles((files) =>
            files.filter((file) => file.name !== fileName)
        )
    }

    const files = selectedFiles.map((file) => (
        <li key={file.name} className={'wbk_input__file__list__item'}>
            <span className={'wbk_input__file__list__item__name'}>
                {file.name}
            </span>
            <span className={'wbk_input__file__list__item__size'}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
            <button
                type="button"
                className={'wbk_input__file__list__item__remove-btn'}
                onClick={() => removeFile(file.name)}
                aria-label={
                    wording.remove_file ||
                    __('Remove file', 'webba-booking-lite')
                }
            >
                &times;
            </button>
        </li>
    ))

    return (
        <div
            className={classNames('wbk_input wbk_input__file', {
                'wbk_input--half-width': width === 'half-width',
            })}
        >
            <label className={'wbk_input__label'}>{placeholder}</label>
            <div {...getRootProps()}>
                <div
                    className={'wbk_input__file__drop-area'}
                    onClick={() => setTouched(true)}
                >
                    <input {...getInputProps()} />
                    <img
                        src={iconFileUpload}
                        alt={
                            wording.file_upload ||
                            __('File upload', 'webba-booking-lite')
                        }
                    />
                    <p>
                        {__(
                            'Click to upload or drag and drop',
                            'webba-booking-lite'
                        )}
                    </p>
                    <span>
                        {wording.pdf_doc_hint ||
                            __(
                                'PDF, DOC/DOCX, PNG, JPG, JPEG, SVG, BMP up to 10MB',
                                'webba-booking-lite'
                            )}
                    </span>
                </div>
            </div>
            {files && !!files.length && (
                <ul className={'wbk_input__file__list'}>{files}</ul>
            )}
            {showError && (
                <div className={'wbk_input__error'}>
                    {localError ? localError : errors ? errors[0] : null}
                </div>
            )}
        </div>
    )
}
