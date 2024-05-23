export default {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 1000,
    },
    name: {
      type: 'string',
      maxLength: 1000,
    },
    products: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'string',
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
          quantity: {
            type: 'integer',
            minimum: 0,
            default: 0,
          },
        },
      },
      default: [],
    },
    orders: {
      type: 'array',
      ref: 'order',        // Refer to populate order schema. Usage: populate('orders');
      uniqueItems: true,
      items: {
        type: 'string',
      },
      default: [],
    },
    revenue: {
      type: 'number',
      minimum: 0,
      default: 0,
    },
    finished: {
      type: 'boolean',
      default: false,
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
    'name',
    'orders',
    'products',
    'revenue',
    'finished',
    'created_at',
    'updated_at',
  ],
};
