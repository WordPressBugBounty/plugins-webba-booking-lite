import { Row } from '@tanstack/react-table'
import classNames from 'classnames'
import EditIcon from '../../../../public/images/edit-icon.png'
import DeleteIcon from '../../../../public/images/delete-icon.png'
import DuplicateIcon from '../../../../public/images/duplicate-icon.png'
import MoreIcon from '../../../../public/images/more-icon.png'

import styles from './Table.module.css'

interface Props {
    row: Row<any>
    showExpand?: boolean
    onEdit: (edited: any) => void
    onDelete: () => void
    onDuplicate: () => void
}

export const Menu = ({
    row,
    showExpand = false,
    onEdit,
    onDelete,
    onDuplicate,
}: Props) => {
    return (
        <div className={styles.menu}>
            <button
                className={styles.menuBtn}
                type="button"
                onClick={() => onEdit({ test: 'test' })}
            >
                <img src={EditIcon} />
            </button>
            <button
                className={styles.menuBtn}
                type="button"
                onClick={onDuplicate}
            >
                <img src={DuplicateIcon} />
            </button>
            <button className={styles.menuBtn} type="button" onClick={onDelete}>
                <img src={DeleteIcon} />
            </button>
            <button
                type="button"
                className={classNames(styles.menuBtn, {
                    [styles.hidden]: !showExpand,
                    [styles.open]: row.getIsExpanded(),
                })}
                onClick={() => row.toggleExpanded()}
            >
                <img src={MoreIcon} className={classNames({})} />
            </button>
        </div>
    )
}
