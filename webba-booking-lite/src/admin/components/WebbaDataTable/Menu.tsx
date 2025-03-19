import classNames from 'classnames'
import EditIcon from '../../../../public/images/edit-icon.png'
import DeleteIcon from '../../../../public/images/delete-icon.png'
import DuplicateIcon from '../../../../public/images/duplicate-icon.png'
import MoreIcon from '../../../../public/images/more-icon.png'
import { ConfirmationButton } from '../ConfirmationButton/ConfirmationButton'
import styles from './Table.module.scss'
import { useCell } from './context/CellProvider'
import { __ } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'

interface Props {
    onDuplicate: () => void
    onDelete: () => void
    onEdit: () => void
}

export const Menu = ({ onDelete, onDuplicate, onEdit }: Props) => {
    const cell = useCell()
    const showExpand = cell.row.getCanExpand()
    const { settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

    return (
        <div className={styles.menu}>
            {cell.row.original?.can_edit && (
                <button
                    className={styles.menuBtn}
                    type="button"
                    onClick={onEdit}
                >
                    <img src={EditIcon} />
                </button>
            )}
            {settings?.is_admin && (
                <button
                    className={styles.menuBtn}
                    type="button"
                    onClick={onDuplicate}
                >
                    <img src={DuplicateIcon} />
                </button>
            )}
            {settings?.is_admin && (
                <ConfirmationButton
                    action={onDelete}
                    confirmationMessage={__(
                        'Yes, delete it',
                        'webba-booking-lite'
                    )}
                    classes={styles.menuBtn}
                    icon={DeleteIcon}
                />
            )}
            <button
                type="button"
                className={classNames(styles.menuBtn, {
                    [styles.hidden]: !showExpand,
                    [styles.open]: cell.row.getIsExpanded(),
                })}
                onClick={() => cell.row.toggleExpanded()}
            >
                <img src={MoreIcon} />
            </button>
        </div>
    )
}
