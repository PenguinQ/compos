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
    product: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          variant_id: {
            type: 'string',
          },
          active: {
            type: 'boolean',
          },
        },
      },
    },
    price: {
      type: 'integer',
    },
    fixed_price: {
      type: 'boolean',
      default: false,
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
