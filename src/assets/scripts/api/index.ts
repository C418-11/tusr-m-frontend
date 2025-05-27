import axios, {AxiosError, type AxiosInstance, type AxiosResponse} from 'axios'
import type {APIError, APIResult, GetAccounts, GetPermissions, GetRoles, GetRows, GetTables} from "./types"

// Axios 实例配置 ------------------------------------------------------------
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api', withCredentials: true,
})

// 请求拦截器：自动添加 CSRF Token
apiClient.interceptors.request.use((config) => {
    const csrfToken = document.cookie
        .split(' ')
        .find(row => row.startsWith('csrf_access_token='))
        ?.split('=')[1]

    // 使用 Axios 的 headers 操作方法
    config.headers.set('X-CSRF-TOKEN', csrfToken || '')
    return config
})

// 响应拦截器：业务逻辑处理 -------------------------------------------------
apiClient.interceptors.response.use((response: AxiosResponse<APIResult>) => {
    const {code} = response.data

    // 处理成功响应（从右往左状态码第一位为1）
    if ((code % 10) === 1) {
        return response.data
    }

    // 处理业务逻辑错误
    const error: APIError = new Error(response.data.message || 'Request failed')
    error.code = code
    error.data = response.data
    throw error
}, (error: AxiosError<APIResult>) => {
    // 处理 HTTP 错误
    const response = error.response
    const status = response?.status
    const code = response?.data?.code || status
    const message = response?.data?.message || `请求失败: ${response?.statusText || error.message}`

    const apiError: APIError = new Error(message)
    apiError.code = code
    apiError.status = status
    apiError.data = response?.data

    return Promise.reject(apiError)
})

// API 方法封装 --------------------------------------------------------------
const authAPI = {
    /** 用户登录 */
    login: (username: string, password: string): Promise<APIResult> => apiClient.post('/auth/login', {
        username, password
    }),

    /** 用户注销 */
    logout: (): Promise<APIResult> => apiClient.post('/auth/logout'),

    /** 获取当前用户信息 */
    whoami: (): Promise<GetAccounts> => apiClient.get('/auth/whoami'),

    /** 获取账户列表 */
    getAccounts: (filter?: {
        username?: string
        roles?: string[]
        active?: boolean
    }): Promise<GetAccounts> => apiClient.get('/auth/accounts', {params: filter}),

    /** 获取单个账户 */
    getAccount: (accountId: string): Promise<GetAccounts> => apiClient.get(`/auth/accounts/${accountId}`),

    /** 更新账户信息 */
    updateAccount: (accountId: string, userData: {
        username?: string
        password?: string
        roles?: string[]
        active?: boolean
    }): Promise<APIResult> => apiClient.put(`/auth/accounts/${accountId}`, userData),

    /** 创建账户 */
    createAccount: (userData: {
        username: string
        password: string
        roles: string[]
        active: boolean
    }): Promise<APIResult> => apiClient.post('/auth/accounts', userData),

    /** 删除账户 */
    deleteAccount: (accountId: string): Promise<APIResult> => apiClient.delete(`/auth/accounts/${accountId}`),

    /** 获取角色列表 */
    getRoles: (filter?: {
        name?: string
        description?: string
        permissions?: string[]
    }): Promise<GetRoles> => apiClient.get('/auth/roles', {params: filter}),

    /** 获取权限列表 */
    getPermissions: (filter?: {
        name?: string
        description?: string
    }): Promise<GetPermissions> => apiClient.get('/auth/permissions', {params: filter}),
}

const dataAPI = {
    /** 获取数据库表结构元数据 */
    getTables: (): Promise<GetTables> => apiClient.get('/data/tables'),

    /** 获取数据库表结构元数据 */
    getTable: (tableName: string): Promise<GetTables> => apiClient.get(`/data/tables/${tableName}`),

    /** 获取数据行 */
    getRows: (tableName: string, offset?: number, limit?: number): Promise<GetRows> => apiClient.get(`/data/tables/${tableName}/rows/${offset}/${limit}`),

    /** 创建数据行 */
    createRow: (tableName: string, rowData: Record<string, any>): Promise<APIResult> => apiClient.post(`/data/tables/${tableName}/rows`, rowData),
}

// noinspection JSUnusedGlobalSymbols
enum APICode {
    // --1
    // -1
    RequestSuccess = 111,

    // -2
    LoginSuccess = 121,
    LogoutSuccess = 221,
    GetAccounts = 321,
    GetRoles = 421,
    GetPermissions = 521,

    // -3
    GetTables = 131,
    GetRows = 231,

    // --2
    // -1
    APINotFound = 112,
    WrongMethod = 212,
    APIInternalError = 312,
    APIArgumentError = 412,

    // -2
    Unauthorized = 122,
    PermissionDenied = 222,
    AccountNotFound = 322,
    WrongUsernameOrPassword = 422,
    DisabledAccount = 423,

    // -3
    DataTableNotFound = 132,
}

// 增强错误处理 --------------------------------------------------------------
function handleAPIError(error: APIError): Promise<never> {
    let message = error.message

    switch (error.code) {
        case APICode.Unauthorized:
            message = '登录状态已过期，请重新登录'
            break
        case APICode.PermissionDenied:
            message = `权限不足，缺少权限: ${error.data?.missing_permissions?.join(', ') || ''}`
            break
        case APICode.APIArgumentError:
            const args = error.data?.arguments || {}
            message = Object.values(args)
                .flat()
                .join(' ')
            break
        case APICode.WrongUsernameOrPassword:
            message = '用户名或密码错误'
            break
        case APICode.DisabledAccount:
            message = '账户已被禁用'
            break
        case APICode.DataTableNotFound:
            message = `数据表不存在`
            break
    }

    console.error(`[API Error ${error.code}]`, message, error.data)
    return Promise.reject({...error, message})
}

// 挂载全局错误处理
apiClient.interceptors.response.use(response => response, error => handleAPIError(error))

export {apiClient, authAPI, dataAPI, APICode}
