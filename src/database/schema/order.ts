export default {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 1000,
    },
    sales_id: {
      ref: 'sales',
      type: 'string',
    },
    name: {
      type: 'string',
      maxLength: 1000,
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
          name: {
            type: 'string',
          },
          total: {
            type: 'number',
            minimum: 0,
            default: 0,
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
    subtotal: {
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
    'sales_id',
    'name',
    'products',
    'subtotal',
    'created_at',
    'updated_at',
  ],
};
