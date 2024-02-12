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
    product: {
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
          price: {
            type: 'number',
            minimum: 0,
          },
          quantity: {
            type: 'integer',
          },
        },
      },
    },
    price: {
      type: 'number',
      minimum: 0,
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
    'created_at',
    'updated_at',
  ],
};
