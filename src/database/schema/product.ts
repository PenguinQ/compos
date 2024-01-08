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
    'name',
    'created_at',
    'updated_at',
  ],
};
