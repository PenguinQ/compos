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
      maxLength: 1000,
    },
    description: {
      type: 'string',
    },
    by: {
      type: 'string',
    },
    variant: {
      type: 'array',
      ref: 'variant',
      uniqueItems: true,
      items: {
        type: 'string',
      },
      default: [],
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
    'name',
    'price',
    'stock',
    'created_at',
    'updated_at',
  ],
};
