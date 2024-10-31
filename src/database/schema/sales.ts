export default {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 1000,
    },
    finished: {
      type: 'boolean',
      default: false,
    },
    name: {
      type: 'string',
      maxLength: 1000,
    },
    products: {
      type: 'array',
      uniqueItems: true,
      items : {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          quantity: {
            type: 'integer',
            minimum: 1,
          },
        },
      },
      default: [],
    },
    products_sold: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string', // id can be product id, variant id, bundle id
          },
          name: {
            type: 'string',
          },
          price: {
            type: 'integer', // price is the price of product WHEN the sales happened
            minimum: 0,
          },
          quantity: {
            type: 'integer', // the total quantity of all orders on this sales for the product
            minimum: 1,
          },
          sku: {
            type: 'string',
          },
        },
      },
      default: [],
    },
    orders: {
      type: 'array',
      ref: 'order', // Refer to populate order schema. Usage: populate('orders');
      uniqueItems: true,
      items: {
        type: 'string',
      },
      default: [],
    },
    // discount: {
    //   type: 'string',
    //   default: '0',
    // },
    // discount_type: {
    //   type: 'string',
    //   maxLength: 100,
    //   default: 'percentage',
    // },
    initial_balance: {
      type: 'string',
    },
    final_balance: {
      type: 'string',
    },
    // balance: {
    //   type: 'string',
    // },
    revenue: {
      type: 'string',
      default: '0',
    },
    created_at: {
      type: 'date-time',
    },
    updated_at: {
      type: 'date-time',
    },
  },
  required: [
    'id',
    'finished',
    'name',
    'products',
    'products_sold',
    'orders',
    'revenue',
    'created_at',
    'updated_at',
  ],
};
