import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/product',
      components: {
        default: () => import('../views/ViewContainer.vue'),
      },
      children: [
        {
          path: '/sale',
          redirect: to => {
            return {
              path: '/sale/list',
              query: {
                tab : to.query.tab || 'running',
                page: to.query.page || 1,
                ...to.query,
              },
            };
          },
          children: [
            {
              path: '/sale/list',
              name: 'sale-list',
              meta: { title: 'Sale List - ComPOS' },
              component: () => import('../views/sales/SaleList.vue'),
            },
            {
              path: '/sale/detail/:id',
              name: 'sale-detail',
              meta: { title: 'Sale Detail - ComPOS' },
              component: () => import('../views/sales/SaleDetail.vue'),
            },
            {
              path: '/sale/add',
              name: 'sale-add',
              meta: { title: 'Add Sale - ComPOS' },
              component: () => import('../views/sales/SaleForm.vue'),
            },
            {
              path: '/sale/edit/:id',
              name: 'sale-edit',
              meta: { title: 'Edit Sale - ComPOS' },
              component: () => import('../views/sales/SaleForm.vue'),
            },
          ],
        },
        {
          path: '/product',
          redirect: to => {
            return {
              path: '/product/list',
              query: {
                tab : to.query.tab || 'product',
                page: to.query.page || 1,
                ...to.query,
              },
            };
          },
          children: [
            {
              path: '/product/list',
              name: 'product-list',
              meta: { title: 'Product List - ComPOS' },
              component: () => import('../views/products/ProductList.vue'),
            },
            {
              path: '/product/:id',
              name: 'product-detail',
              meta: { title: 'Product Detail - ComPOS' },
              component: () => import('../views/products/ProductDetail.vue'),
            },
            {
              path: '/product/edit/:id',
              name: 'product-edit',
              meta: { title : 'Edit Product - ComPOS' },
              component: () => import('../views/products/ProductForm.vue'),
            },
            {
              path: '/product/add',
              name: 'product-add',
              meta: { title: 'Add Product - ComPOS' },
              component: () => import('../views/products/ProductForm.vue'),
            },
            {
              path: '/bundle/:id',
              name: 'bundle-detail',
              meta: { title: 'Bundle Detail - ComPOS' },
              component: () => import('../views/products/BundleDetail.vue'),
            },
            {
              path: '/bundle/edit/:id',
              name: 'bundle-edit',
              meta: { title: 'Edit Bundle - ComPOS' },
              component: () => import('../views/products/BundleForm.vue'),
            },
            {
              path: '/bundle/add',
              name: 'bundle-add',
              meta: { title: 'Add Bundle - ComPOS' },
              component: () => import('../views/products/BundleForm.vue'),
            },
          ],
        },
        {
          path: '/setting',
          name: 'setting',
          meta: { title: 'Setting - ComPOS' },
          component: () => import('../views/settings/Setting.vue'),
        },
      ],
    },
    {
      path: '/sale/dashboard/:id',
      name: 'sale-dashboard',
      meta: { title: 'Sale Dashboard - ComPOS' },
      component: () => import('../views/sales/SaleDashboard.vue'),
    },
  ],
});

export default router;
