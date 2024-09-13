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
      redirect: '/product',
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
              beforeEnter: (to, _, next) => {;
                // If have tab & page query, go through
                if (to.query.tab && to.query.page) {
                  next();
                }
                // If doesn't have tab & page query, set the query with default tab to product and page to 1
                else {
                  const query = { tab: 'running', page: 1 };
                  const updatedQuery = { ...to.query, ...query };

                  next({ ...to, query: updatedQuery });
                }
              },
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
              beforeEnter: (to, _, next) => {;
                // If have tab & page query, go through
                if (to.query.tab && to.query.page) {
                  next();
                }
                // If doesn't have tab & page query, set the query with default tab to product and page to 1
                else {
                  const query = { tab: 'product', page: 1 };
                  const updatedQuery = { ...to.query, ...query };

                  next({ ...to, query: updatedQuery });
                }
              },
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

router.beforeEach(async (_to, from) => {
  // 1. Set last visited page meta data on sales route
  if (from.path.startsWith('/sales')) {
    const salesRoot = from.matched.find(record => record.path === '/sales');

    if (salesRoot) salesRoot.meta.lastVisited = from.fullPath;

    // console.log('sales beforeEach', salesRoot?.meta.lastVisited);
  }

  // 2. Set last visited page meta data on product route
  if (from.path.startsWith('/product') || from.path.startsWith('/bundle')) {
    const productRoot = from.matched.find(record => record.path === '/product');

    if (productRoot) productRoot.meta.lastVisited = from.fullPath;

    // console.log('product beforeEach', productRoot?.meta.lastVisited);
  }
});

export default router;
