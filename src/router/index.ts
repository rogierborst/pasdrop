import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/passes'
    },
    {
        path: '/passes',
        component: () => import ('../views/PassesPage.vue')
    },
    {
        path: '/pass/:id',
        component: () => import('../views/ShowPassPage.vue'),
    },
    {
        path: '/pass/:id/edit',
        component: () => import('../views/EditPassPage.vue'),
    },
    {
        path: '/passes/new',
        component: () => import('../views/NewPassPage.vue'),
    },
    {
        path: '/add',
        redirect: '/passes',
    },
    {
        path: '/categories',
        component: () => import ('../views/CategoriesPage.vue')
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router
