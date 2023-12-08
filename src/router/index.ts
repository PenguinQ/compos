import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/landing',
      name: 'landing',
      component: () => import('../views/BaseView.vue'),
    },
    {
      path: '/',
      redirect: '/product',
      component: () => import('../views/HomeView.vue'),
      children: [
        {
          path: '/sales',
          redirect: '/sales/dashboard',
          meta: { title: 'ComPOS - Sales' },
          component: () => import('../views/sales/ViewContainer.vue'),
          children: [
            {
              path: '/sales/dashboard',
              name: 'sales-dashboard',
              meta: { title: 'ComPOS - Sales Dashboard' },
              component: () => import('../views/sales/SalesDashboard.vue'),
            },
            {
              path: '/sales/running',
              name: 'sales-running',
              meta: { title: 'ComPOS - Sales **Name**' },
              component: () => import('../views/sales/SalesRunning.vue'),
            },
          ],
        },
        {
          path: '/product',
          redirect: '/product/list',
          component: () => import('../views/products/ViewContainer.vue'),
          children: [
            {
              path: '/product/list',
              name: 'product-list',
              meta: { title: 'ComPOS - Product List' },
              component: () => import('../views/products/Product.vue'),
            },
            {
              path: '/product/:id',
              name: 'product-detail',
              meta: { title: 'ComPOS - Product Detail' },
              component: () => import('../views/products/ProductDetail.vue'),
            },
            {
              path: '/product/add',
              name: 'product-add',
              meta: { title: 'ComPOS - Add Product' },
              component: () => import('../views/products/ProductForm.vue'),
            },
            {
              path: '/product/edit/:id',
              name: 'product-edit',
              meta: { title: 'ComPOS - Product Edit' },
              component: () => import('../views/products/ProductForm.vue'),
            },
            {
              path: '/product/bundle/:id',
              name: 'product-bundle-detail',
              meta: { title: 'ComPOS - Bundle Detail' },
              component: () => import('../views/products/BundleDetail.vue'),
            },
            {
              path: '/product/bundle/edit/:id',
              name: 'product-bundle-edit',
              meta: { title: 'ComPOS - Bundle Edit' },
              component: () => import('../views/products/BundleForm.vue'),
            },
          ],
        },
        {
          path: '/history',
          name: 'history',
          meta: { title: 'ComPOS - Sales History' },
          component: () => import('../views/history/HistoryView.vue'),
        },
      ],
    },
  ],
});

export default router;
