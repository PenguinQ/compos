import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/product',
      components: {
        default: () => import('../views/ViewContainer.vue'),
        navigation: () => import('../views/ViewNavigation.vue'),
      },
      children: [
        {
          path: '/sale',
          redirect: '/sale/list',
          // component: () => import('../views/sales/SalesViewContainer.vue'),
          children: [
            {
              path: '/sale/list',
              name: 'sale-list',
              meta: { title: 'Sale List - ComPOS' },
              component: () => import('../views/sales/SaleList.vue'),
              beforeEnter: (to, _, next) => {;
                if (to.query.tab && to.query.page) {
                  next();
                }
                else {
                  const query = { tab: 'running', page: 1 };
                  const updatedQuery = { ...to.query, ...query };

                  next({ ...to, query: updatedQuery });
                }
              },
            },
            {
              path: '/sale/detail/:id',
              name: 'sale-detail',
              meta: {
                title: 'Sale Detail',
              },
              component: () => import('../views/sales/SaleDetail.vue'),
            },
            {
              path: '/sale/add',
              name: 'sale-add',
              meta: {
                title: 'Add Sale',
              },
              component: () => import('../views/sales/SaleForm.vue'),
            },
            {
              path: '/sale/edit/:id',
              name: 'sale-edit',
              meta: {
                title: 'Edit Sale',
                hideNavbar: true,
              },
              component: () => import('../views/sales/SaleForm.vue'),
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
              beforeEnter: (to, _, next) => {
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
                title: 'Edit Bundle - ComPOS',
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

// --- WIP ---
// router.beforeEach(async (_to, from) => {
//   // 1. Set last visited page meta data on sales route
//   if (from.path.startsWith('/sales')) {
//     const salesRoot = from.matched.find(record => record.path === '/sales');

//     if (salesRoot) salesRoot.meta.lastVisited = from.fullPath;

//     // console.log('sales beforeEach', salesRoot?.meta.lastVisited);
//   }

//   // 2. Set last visited page meta data on product route
//   if (from.path.startsWith('/product') || from.path.startsWith('/bundle')) {
//     const productRoot = from.matched.find(record => record.path === '/product');

//     if (productRoot) productRoot.meta.lastVisited = from.fullPath;

//     // console.log('product beforeEach', productRoot?.meta.lastVisited);
//   }
// });

export default router;
