import classNames from 'classnames'
import EditIcon from '../../../../public/images/edit-icon.svg'
import DeleteIcon from '../../../../public/images/delete-icon.svg'
import DuplicateIcon from '../../../../public/images/duplicate-icon.svg'
import CancelIcon from '../../../../public/images/icon-cancel.svg'
import MoreIcon from '../../../../public/images/icon-expand.svg'
import { ConfirmationButton } from '../ConfirmationButton/ConfirmationButton'
import styles from './Table.module.scss'
import { useCell } from './context/CellProvider'
import { __ } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { Button } from '../Button/Button'

interface Props {
    onDuplicate: () => void
    onDelete: () => void
    onEdit: () => void
    onCancel?: () => void
    collectionName?: string
}

export const Menu = ({
    onDelete,
    onDuplicate,
    onEdit,
    onCancel,
    collectionName,
}: Props) => {
    const cell = useCell()
    const showExpand = cell.row.getCanExpand()
    const { settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const hideForEmails =
        collectionName === 'email_templates' &&
        cell.row.original?.can_delete === false

    return (
        <div className={styles.menu}>
            {cell.row.original?.can_edit && (
                <button
                    className={styles.menuBtn}
                    type="button"
                    onClick={onEdit}
                    data-title={__('Edit', 'webba-booking-lite')}
                >
                    <img src={EditIcon} />
                </button>
            )}
            {settings?.is_admin && (
                <Button
                    className={styles.menuBtn}
                    onClick={onDuplicate}
                    tooltip={__('Duplicate', 'webba-booking-lite')}
                    type="no-border"
                >
                    <img src={DuplicateIcon} />
                </Button>
            )}
            {(cell.row.original.can_delete || settings?.is_admin) &&
                !hideForEmails && (
                    <ConfirmationButton
                        action={onDelete}
                        confirmationMessage={__(
                            'Yes, delete it',
                            'webba-booking-lite'
                        )}
                        classes={styles.menuBtn}
                        wrapperClass={styles.menuBtn}
                        icon={DeleteIcon}
                        tooltip={__('Delete', 'webba-booking-lite')}
                        position="left"
                    />
                )}
            {collectionName &&
                collectionName === 'appointments' &&
                onCancel && (
                    <ConfirmationButton
                        action={onCancel}
                        confirmationMessage={__(
                            'Yes, cancel it',
                            'webba-booking-lite'
                        )}
                        classes={styles.menuBtn}
                        wrapperClass={styles.menuBtn}
                        icon={CancelIcon}
                        tooltip={__('Cancel', 'webba-booking-lite')}
                        position="left"
                    />
                )}
            {showExpand && (
                <button
                    type="button"
                    className={classNames(styles.menuBtn, styles.expandButton, {
                        [styles.hidden]: !showExpand,
                        [styles.open]: cell.row.getIsExpanded(),
                    })}
                    onClick={() => cell.row.toggleExpanded()}
                    data-title={__('Show details', 'webba-booking-lite')}
                >
                    <img src={MoreIcon} />
                </button>
            )}
        </div>
    )
}
