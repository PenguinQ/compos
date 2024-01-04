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
    image: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    by: {
      type: 'string',
    },
    price: {
      type: 'integer',
    },
    stock: {
      type: 'integer',
    },
    variant: {
      type: 'array',
      ref: 'variant',
      uniqueItems: true,
      items: {
        type: 'string',
      },
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

/**
 * 1. If variant exist and it doesn't have a price, it will follow the default price of the product
 * 2. If variant exist and have a price, the default price will be ignored.
 */
