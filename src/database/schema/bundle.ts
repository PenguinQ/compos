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
          active: {
            type: 'boolean',
          },
          quantity: {
            type: 'number',
          }
        },
      },
      default: [],
    },
    price: {
      type: 'number',
      minimum: 0,
      default: 0,
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
    'product',
    'created_at',
    'upudated_at',
  ],
};

// If price is filled, the price will be fixed, if not, it will sum the prices of the product.
