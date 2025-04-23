export default {
  version: 1,
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
    variants: {
      type: 'array',
      ref: 'variant',
      uniqueItems: true,
      items: {
        type: 'string',
      },
      default: [],
    },
    price: {
      type: 'string',
    },
    stock: {
      type: 'integer',
      minimum: 0,
    },
    sku: {
      type: 'string',
      uniqueItems: true,
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
  },
  required: [
    'id',
    'active',
    'name',
    'created_at',
    'updated_at',
  ],
};
