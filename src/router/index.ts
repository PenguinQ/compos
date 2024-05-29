import { createRouter, createWebHistory } from 'vue-router';

const ls = localStorage.getItem('compos-init');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/landing',
      name: 'landing',
      component: () => import('../views/Landing.vue'),
    },
    {
      path: '/sales/dashboard/:id',
      name: 'sales-dashboard',
      meta: { title: 'Sales **Name** - ComPOS' },
      component: () => import('../views/sales/SalesRunning.vue'),
    },
    {
      path: '/',
      redirect: '/sales',
      components: {
        default: () => import('../views/ViewContainer.vue'),
        navigation: () => import('../views/ViewNavigation.vue'),
      },
      children: [
        {
          path: '/sales',
          redirect: '/sales/list',
          // component: () => import('../views/sales/SalesViewContainer.vue'),
          children: [
            {
              path: '/sales/list',
              name: 'sales-list',
              meta: { title: 'Sales - ComPOS' },
              component: () => import('../views/sales/SalesList.vue'),
            },
            {
              path: '/sales/detail/:id',
              name: 'sales-detail',
              meta: {
                title: 'Sales Detail',
              },
              component: () => import('../views/sales/SalesDetail.vue'),
            },
            {
              path: '/sales/add',
              name: 'sales-add',
              meta: {
                title: 'Add Sales',
              },
              component: () => import('../views/sales/SalesForm.vue'),
            },
            {
              path: '/sales/edit/:id',
              name: 'sales-edit',
              meta: {
                title: 'Edit Sales',
                hideNavbar: true,
              },
              component: () => import('../views/sales/SalesForm.vue'),
            },
          ],
        },
        {
          path: '/product',
          redirect: '/product/list',
          // component: () => import('../views/products/ProductViewContainer.vue'),
          children: [
            {
              path: '/product/list',
              name: 'product-list',
              meta: { title: 'Product List - ComPOS' },
              component: () => import('../views/products/ProductList.vue'),
              // beforeEnter: (to, _from, next) => {;
              //   if (!to.query.tab && !to.query.page) {
              //     const query = { tab: 'product', page: '1' };
              //     const updatedQuery = { ...to.query, ...query };

              //     next({ ...to, query: updatedQuery });
              //   } else {
              //     next();
              //   }
              // },
            },
            {
              path: '/product/:id',
              name: 'product-detail',
              meta: {
                title: 'Product Detail - ComPOS',
                hideNavbar: true,
              },
              component: () => import('../views/products/ProductDetail.vue'),
            },
            {
              path: '/product/edit/:id',
              name: 'product-edit',
              meta: {
                title: 'Edit Product - ComPOS',
                hideNavbar: true,
              },
              component: () => import('../views/products/ProductForm.vue'),
            },
            {
              path: '/product/add',
              name: 'product-add',
              meta: {
                title: 'Add Product - ComPOS',
                hideNavbar: true,
              },
              component: () => import('../views/products/ProductForm.vue'),
            },
            {
              path: '/bundle/:id',
              name: 'bundle-detail',
              meta: {
                title: 'Bundle Detail - ComPOS',
                hideNavbar: true,
              },
              component: () => import('../views/products/BundleDetail.vue'),
            },
            {
              path: '/bundle/edit/:id',
              name: 'bundle-edit',
              meta: {
                title: 'Bundle Edit - ComPOS',
                hideNavbar: true,
              },
              component: () => import('../views/products/BundleForm.vue'),
            },
            {
              path: '/bundle/add',
              name: 'bundle-add',
              meta: {
                title: 'Add Bundle - ComPOS',
                hideNavbar: true,
              },
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

router.beforeEach(async (to, from) => {

});

export default router;
