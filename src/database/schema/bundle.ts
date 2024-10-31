export default {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 1000,
    },
    active: {
      type: 'boolean',
    },
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    products: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          product_id: {
            type: 'string',
          },
          active: {
            type: 'boolean',
          },
          quantity: {
            type: 'integer',
          }
        },
      },
      default: [],
    },
    auto_price: {
      type: 'boolean',
      default: true,
    },
    price: {
      type: 'string',
      default: '0',
    },
    // sku: {
    //   type: 'string',
    //   uniqueItems: true,
    // },
    created_at: {
      type: 'date-time',
    },
    updated_at: {
      type: 'date-time',
    },
  },
  required: [
    'id',
    'active',
    'name',
    'price',
    'products',
    'auto_price',
    'created_at',
    'updated_at',
  ],
};
