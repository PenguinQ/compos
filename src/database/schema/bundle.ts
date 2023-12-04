export default {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 10000,
    },
    product_id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    price: {
      type: 'integer',
    },
    sku: {
      type: 'string'
    },
    timestamp: {
      type: 'date-time',
    },
  },
  required: ['id', 'product_id', 'name', 'price', 'timestamp'],
};
