export type DataRow = Record<string, any>;
export type FieldType = 'pure-text' | 'text' | 'number' | 'select' | 'date' | 'custom'

export interface TableColumn {
    key: string
    title: string
    width?: string
    fieldType: FieldType
    options?: Array<{ label: string; value: any }>
    customComponent?: any
    readonly?: boolean
    sort?: (a: any, b: any) => number
}