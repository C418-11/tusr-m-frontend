import { createRouter, createWebHistory } from 'vue-router'

// noinspection JSUnusedGlobalSymbols
const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Dashboard.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router