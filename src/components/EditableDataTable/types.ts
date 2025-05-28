export interface Handlers {
    edit: (index: number) => void
    delete: (index: number) => void
    index: number
    deletedId?: number
    diffStatus?: string
}
