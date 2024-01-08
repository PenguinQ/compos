export default {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 1000,
    },
    product_id: {
      ref: 'product',
      type: 'string',
    },
    active: {
      type: 'boolean',
    },
    name: {
      type: 'string',
    },
    attachment: {
      encrypted: false,
      compression: 'gzip',
    },
    image: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    price: {
      type: 'integer',
    },
    stock: {
      type: 'integer',
    },
    sku: {
      type: 'string'
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
    'product_id',
    'name',
    'price',
    'stock',
    'created_at',
    'updated_at',
  ],
};
