import axios, {AxiosError, type AxiosInstance, type AxiosResponse} from 'axios';
import type {APIError, APIResult, GetAccounts, GetPermissions, GetRoles} from "./types";

// Axios 实例配置 ------------------------------------------------------------
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api', withCredentials: true,
});

// 请求拦截器：自动添加 CSRF Token
apiClient.interceptors.request.use((config) => {
    const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_access_token='))
        ?.split('=')[1];

    // 使用 Axios 的 headers 操作方法
    config.headers.set('X-CSRF-TOKEN', csrfToken || '');
    return config;
});

// 响应拦截器：业务逻辑处理 -------------------------------------------------
apiClient.interceptors.response.use((response: AxiosResponse<APIResult>) => {
    const {code} = response.data;

    // 处理成功响应（从右往左状态码第一位为1）
    if ((code % 10) === 1) {
        return response.data;
    }

    // 处理业务逻辑错误
    const error: APIError = new Error(response.data.message || 'Request failed');
    error.code = code;
    error.data = response.data;
    throw error;
}, (error: AxiosError<APIResult>) => {
    // 处理 HTTP 错误
    const response = error.response;
    const status = response?.status;
    const code = response?.data?.code || status;
    const message = response?.data?.message || `请求失败: ${response?.statusText || error.message}`;

    const apiError: APIError = new Error(message);
    apiError.code = code;
    apiError.status = status;
    apiError.data = response?.data;

    return Promise.reject(apiError);
});

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
        username?: string; roles?: string[]; active?: boolean;
    }): Promise<GetAccounts> => apiClient.get('/auth/accounts', {params: filter}),

    /** 获取单个账户 */
    getAccount: (accountId: string): Promise<GetAccounts> => apiClient.get(`/auth/accounts/${accountId}`),

    /** 更新账户信息 */
    updateAccount: (accountId: string, userData: {
        username?: string;
        password?: string;
        roles?: string[];
        active?: boolean;
    }): Promise<APIResult> => apiClient.put(`/auth/accounts/${accountId}`, userData),

    /** 创建账户 */
    createAccount: (userData: {
        username: string; password: string; roles: string[]; active: boolean;
    }): Promise<APIResult> => apiClient.post('/auth/accounts', userData),

    /** 删除账户 */
    deleteAccount: (accountId: string): Promise<APIResult> => apiClient.delete(`/auth/accounts/${accountId}`),

    /** 获取角色列表 */
    getRoles: (filter?: {
        name?: string; description?: string; permissions?: string[];
    }): Promise<GetRoles> => apiClient.get('/auth/roles', {params: filter}),

    /** 获取权限列表 */
    getPermissions: (filter?: {
        name?: string; description?: string;
    }): Promise<GetPermissions> => apiClient.get('/auth/permissions', {params: filter}),
}


// 增强错误处理 --------------------------------------------------------------
function handleAPIError(error: APIError): Promise<never> {
    let message = error.message;

    switch (error.code) {
        case 122: // Unauthorized
            message = '登录状态已过期，请重新登录';
            break;
        case 222: // PermissionDenied
            message = `权限不足，缺少权限: ${error.data?.missing_permissions?.join(', ') || ''}`;
            break;
        case 412: // APIArgumentError
            const args = error.data?.arguments || {};
            message = Object.values(args)
                .flat()
                .join('; ');
            break;
        case 422: // WrongUsernameOrPassword
            message = '用户名或密码错误';
            break;
        case 423: // DisabledAccount
            message = '账户已被禁用';
    }

    console.error(`[API Error ${error.code}]`, message, error.data);
    return Promise.reject({...error, message});
}

// 挂载全局错误处理
apiClient.interceptors.response.use(response => response, error => handleAPIError(error));

export {apiClient, authAPI};
