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
    },
    product_id: {
      ref: 'product',
      type: 'string',
    },
    product_name: {
      type: 'string',
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
