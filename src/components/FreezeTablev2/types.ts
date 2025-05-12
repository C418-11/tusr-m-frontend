export type FieldType = 'text' | 'number' | 'select' | 'date' | 'custom'

export interface TableColumn {
    key: string
    title: string
    width?: string
    fieldType: FieldType
    options?: Array<{ label: string; value: any }>
    customComponent?: any
    readonly?: boolean
}
