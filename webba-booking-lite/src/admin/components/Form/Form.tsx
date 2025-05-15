import { FormEvent, useEffect, useState } from 'react'
import { useSidebar } from '../Sidebar/SidebarContext'
import { FormSections } from './types'
import classNames from 'classnames'
import { toast, ToastContainer, ToastContentProps } from 'react-toastify'
import { Model } from '../../types'
import styles from './Form.module.scss'
import { FormProvider } from './lib/FormProvider'
import { FormFromModel, FormValueFromModel } from './lib/types'
import { getFormState } from './lib/utils'
import { capitalize } from './utils/utils'
import { __ } from '@wordpress/i18n'
import { Button } from '../Button/Button'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { ConfirmationButton } from '../ConfirmationButton/ConfirmationButton'
import closeIcon2 from '../../../../public/images/close-icon2.png'
import deleteIcon from '../../../../public/images/delete-icon.png'
import duplicateIcon from '../../../../public/images/duplicate-icon.png'

interface Props<T extends Model> {
    id: string
    name: string
    form: FormFromModel<T>
    sections: FormSections
    defaultValue?: FormValueFromModel<T>
    onSubmit: (formValue: any) => void
    onDelete?: () => void
    onDuplicate?: () => void
}

interface ErrorNotificationProps {
    errors: string
}

const ErrorNotification = ({
    data,
}: ToastContentProps<ErrorNotificationProps>) => {
    return (
        <div className={styles.invalidFormNotificationContainer}>
            <div className={styles.invalidFormNotificationTitle}>
                {__('You have errors in your form', 'webba-booking-lite')}
            </div>
            <div>
                <div>
                    {__(
                        'Please, fix the following fields and try again:',
                        'webba-booking-lite'
                    )}
                </div>
                <div>{data.errors}</div>
            </div>
        </div>
    )
}

export const Form = function <T extends Model>({
    form,
    defaultValue,
    name,
    id,
    sections,
    onSubmit,
    onDelete,
    onDuplicate,
}: Props<T>) {
    const shouldShowSections = Object.keys(sections).length > 1
    const [activeSection, setActiveSection] = useState('general')
    const sidebar = useSidebar()
    // @ts-ignore
    const busy = useSelect((select) => select(store_name).isBusy(), [])

    useEffect(() => {
        if (defaultValue) {
            form.patchValue(defaultValue)
            form.defaultValue = defaultValue
        } else {
            form.defaultValue = {} as FormValueFromModel<T>
        }

        return form.reset
    }, [])

    const submitHandler = (e: FormEvent) => {
        e.preventDefault()
        const { values, errors, isValid } = getFormState(form)
        if (!isValid) {
            toast.dismiss()
            toast.error(ErrorNotification, {
                theme: 'colored',
                autoClose: 5000,
                data: {
                    errors: Object.keys(errors)
                        .map((key) => form.fields[key].label)
                        .join(', '),
                },
            })
        } else {
            onSubmit(values)
        }
    }

    const header = (
        <div className={styles.formHeader}>
            <div className={styles.formHeaderTitle}>{name}</div>
            <div>
                <button
                    type="button"
                    onClick={sidebar.close}
                    className={styles.closeBtn}
                >
                    <img src={closeIcon2} />
                </button>
            </div>
        </div>
    )

    const sectionNavigation = (
        <div className={styles.sectionNavigation}>
            {Object.keys(sections).map((section) => (
                <button
                    type="button"
                    onClick={() => setActiveSection(section)}
                    className={classNames(styles.sectionNavigationBtn, {
                        [styles.active]: activeSection === section,
                    })}
                >
                    <span className={styles.sectionNavigationBtnText}>
                        {capitalize(section)}
                    </span>
                </button>
            ))}
        </div>
    )

    return (
        <FormProvider form={form}>
            <div className={styles.formContainer}>
                {shouldShowSections ? (
                    <>
                        {header}
                        {sectionNavigation}
                    </>
                ) : (
                    header
                )}
                <form className={styles.form} onSubmit={submitHandler} id={id}>
                    {sections[activeSection].map((field) => (
                        <div key={field.name} className={styles.fieldWrapper}>
                            {field.element}
                        </div>
                    ))}
                </form>
                <div className={styles.buttons}>
                    <div className={styles.editButtons}>
                        {onDelete && defaultValue?.can_delete !== false && (
                            <ConfirmationButton
                                icon={deleteIcon}
                                classes={styles.closeBtn}
                                action={onDelete}
                                confirmationMessage={__(
                                    'Yes, delete it',
                                    'webba-booking-lite'
                                )}
                                position="left"
                            />
                        )}
                        {onDuplicate && (
                            <Button
                                onClick={onDuplicate}
                                className={styles.closeBtn}
                                type="secondary"
                            >
                                <img src={duplicateIcon} />
                            </Button>
                        )}
                    </div>
                    <Button
                        className="button-wb"
                        actionType="submit"
                        form={id}
                        isLoading={busy}
                    >
                        {__('Save', 'webba-booking-lite')}
                    </Button>
                </div>
            </div>
            <ToastContainer limit={1} />
        </FormProvider>
    )
}
