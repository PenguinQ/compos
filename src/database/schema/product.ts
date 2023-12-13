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
      uniqueItems: true,
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          image: {
            type: 'array',
          },
          price: {
            type: 'integer',
          },
          stock: {
            type: 'integer',
          },
        },
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
    'price',
    'created_at',
    'updated_at',
  ],
};
