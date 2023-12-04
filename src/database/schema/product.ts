export default {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 10000,
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
    // category:{
    //   type: 'string',
    // },
    price: {
      type: 'integer',
    },
    stock: {
      type: 'integer',
    },
    sku: {
      type: 'string'
    },
    timestamp: {
      type: 'date-time',
    },
  },
  required: ['id', 'name', 'price', 'timestamp'],
};
