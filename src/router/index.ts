import {createRouter, createWebHistory} from 'vue-router'
import {authAPI} from "@/assets/scripts/api";

// noinspection JSUnusedGlobalSymbols
const routes = [{
    path: '/', name: 'Home', component: () => import('@/views/Dashboard.vue'),
}, {
    path: '/manage/accounts', name: 'ManageAccounts', component: () => import('@/views/manage/Accounts.vue'), meta: {
        requiresAuth: true
    }
}, {
    path: '/test-table-v1', name: 'TestTable-v1', component: () => import('@/views/manage/TestTable.vue'), meta: {
        requiresAuth: true
    }
}, {
    path: '/test-table-v2', name: 'TestTable-v2', component: () => import('@/views/manage/TestTablev2.vue'), meta: {
        requiresAuth: true
    }
}, {
    path: '/test-table-v3', name: 'TestTable-v3', component: () => import('@/views/manage/TestTablev3.vue'), meta: {
        requiresAuth: true
    }
}, {
    path: '/test-table-v4', name: 'TestTable-v4', component: () => import('@/views/manage/TestTablev4.vue'), meta: {
        requiresAuth: true
    }
}, {
    path: '/test-table-v5', name: 'TestTable-v5', component: () => import('@/views/manage/TestTablev5.vue'), meta: {
        requiresAuth: true
    }
}, {
    path: '/test-table-v6', name: 'TestTable-v6', component: () => import('@/views/manage/TestTablev6.vue'), meta: {
        requiresAuth: true
    }
}, {
    path: '/login', name: 'Login', component: () => import('@/views/Login.vue'),
}, {
    path: '/:pathMatch(.*)', name: 'PageNotFound', component: () => import('@/views/404.vue'), hidden: true
}]

const router = createRouter({
    history: createWebHistory(), routes
})

router.beforeEach(async (to, _, next) => {
    if (!to.matched.some(record => record.meta.requiresAuth)) {
        next();
        return;
    }

    showNotification("正在检查页面访问权限...", 'checking');
    let response = undefined;
    try {
        response = await authAPI.whoami();
    } catch (error) {
    }

    next();
    if ((response === undefined) || (response?.accounts[0]?.active !== true)) {
        showNotification("未登录，正在跳转登录页面！", 'processing');
        requestAnimationFrame(() => setTimeout(() => router.push({name: "Login"}), 1000))
        return;
    }
});

export default router