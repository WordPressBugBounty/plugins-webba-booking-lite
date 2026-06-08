export interface ICategory {
    id: number
    name: string
    services: string[]
    units?: string[]
    selected?: boolean
    onSelect: () => void
}

export interface ICategoriesProps {
    categories: ICategory[]
}
