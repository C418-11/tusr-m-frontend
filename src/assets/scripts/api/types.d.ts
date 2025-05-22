export type APIResult<T = any> = {
    code: number
    message: string
} & T

// 账户相关类型
export interface Account {
    id: string
    username: string
    roles: string[]
    active: boolean
}

export interface GetAccounts extends APIResult {
    accounts: Array<Account>
}

// 角色相关类型
export interface Role {
    id: string
    name: string
    description: string
    permissions: string[]
}

export interface GetRoles extends APIResult {
    roles: Array<Role>
}

// 权限相关类型
export interface Permission {
    id: string
    name: string
    description: string
}

export interface GetPermissions extends APIResult {
    permissions: Array<Permission>
}

// 错误处理类型
export interface APIError extends Error {
    code?: number
    data?: any
    status?: number
}

// 表结构元数据类型
export interface TableColumnMeta {
    default: string | null
    length: number | null
    foreign_key: string | null
    nullable: boolean
    primary_key: boolean
    type: string
    unique: boolean
}

export interface TableMeta{
    [columnName: string]: TableColumnMeta
}

export interface GetTables extends APIResult {
    tables: {
        [tableName: string]: TableMeta
    }
}

export interface GetRows extends APIResult {
    rows: Record<string, any>[]
}
