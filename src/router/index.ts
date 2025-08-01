/*
 * @Author: zhangjiewen 474350393@qq.com
 * @Date: 2024-12-28 20:27:40
 * @LastEditors: zhangtao13626 zhangtao13626@servyou.com.cn
 * @LastEditTime: 2025-03-08 13:21:19
 * @FilePath: /vue3-demo/src/router/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/openlayers',
      name: 'openlayers',
      component: () => import('../views/openlayers/index.vue'),
    },
    {
      path: '/openlayers2',
      name: 'openlayers2',
      component: () => import('../views/openlayers2/index.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/echarts',
      name: 'echarts',
      component: () => import('../views/echarts/EchartsView.vue'),
    },
    {
      path: '/codeeditor',
      name: 'codeeditor',
      component: () => import('../views/code-editor/index.vue'),
    },
    {
      path: '/elementui',
      name: 'elementui',
      component: () => import('../views/elementui/index.vue'),
    },
    {
      path: '/vaporMode',
      name: 'vaporMode',
      component: () => import('../views/vaporMode/index.vue'),
    },
  ],
})

export default router
