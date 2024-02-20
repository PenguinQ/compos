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
    price: {
      type: 'number',
      minimum: 0,
      default: 0,
    },
    stock: {
      type: 'integer',
      minimum: 0,
      default: 0,
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
  attachments: {
    encrypted: false,
    compression: 'gzip',
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
