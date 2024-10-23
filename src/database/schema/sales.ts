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
            type: 'string',
          },
          name: {
            type: 'string',
          },
          price: {
            type: 'integer',
            minimum: 0,
          },
          quantity: {
            type: 'integer',
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
    // OLD
    // discount: {
    //   type: 'number',
    //   minimum: 0,
    //   default: 0,
    // },
    discount: {
      type: 'string',
      default: '0',
    },
    discount_type: {
      type: 'string',
      maxLength: 100,
      default: 'percentage',
    },
    // OLD
    // revenue: {
    //   type: 'integer',
    //   minimum: 0,
    //   default: 0,
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
