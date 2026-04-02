import { UniqueIdentifier } from '@dnd-kit/core'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { useSortable, UseSortableInput } from '@dnd-kit/react/sortable'
import { createContext, PropsWithChildren, ReactNode, useContext } from 'react'

type Item = { id: UniqueIdentifier }

interface RenderProps<T extends Item> {
    item: T
    index: number
    ref: (element: Element | null) => void
}

export interface SortableListProps<T extends Item> {
    items: T[]
    onChange: (items: T[]) => void
    renderItem: (props: RenderProps<T>) => ReactNode
    sortableConfig?: Omit<UseSortableInput, 'id' | 'index'>
}

interface SortableItemContextValue {
    handleRef: (element: Element | null) => void
}

const SortableContext = createContext<SortableItemContextValue | null>(null)

export const useSortableItem = () => {
    const ctx = useContext(SortableContext)

    if (!ctx) {
        throw new Error('`useSortableItem` must be used within SortableItem')
    }

    return ctx
}

export function SortableList<T extends Item>({
    items,
    onChange,
    renderItem,
    sortableConfig = {},
}: SortableListProps<T>) {
    return (
        <DragDropProvider
            onDragEnd={(event) => {
                onChange(move(items, event))
            }}
        >
            {items.map((item, index) => (
                <SortableItem
                    item={item}
                    id={item.id}
                    index={index}
                    input={sortableConfig}
                    renderItem={renderItem}
                />
            ))}
        </DragDropProvider>
    )
}

export function SortableItem<T extends Item>({
    id,
    index,
    input = {},
    item,
    renderItem,
}: PropsWithChildren<{
    id: UniqueIdentifier
    index: number
    item: T
    input?: Omit<UseSortableInput, 'id' | 'index'>
    renderItem: (props: RenderProps<T>) => ReactNode
}>) {
    const { ref, handleRef } = useSortable({ id, index, ...input })

    return (
        <SortableContext.Provider value={{ handleRef }}>
            {renderItem({ index, item, ref })}
        </SortableContext.Provider>
    )
}
