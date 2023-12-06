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
    product_id: {
      type: 'string',
    },
    product_image: {
      type: 'string',
    },
    price: {
      type: 'integer',
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
    'product_id',
    'name',
    'price',
    'created_at',
    'updated_at',
  ],
};
