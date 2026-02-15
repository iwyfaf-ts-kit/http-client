import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import FetchPage from '@/pages/FetchPage.vue';

export const routes: Array<RouteRecordRaw> = [
  { name: 'Главная', path: '/', component: HomePage },
  { name: 'Fetch', path: '/fetch', component: FetchPage },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
