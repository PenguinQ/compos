export default {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 1000,
    },
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    image: {
      type: 'string',
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
