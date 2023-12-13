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
          name: {
            type: 'string',
          },
          image: {
            type: 'string',
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
    product_id: {
      ref: 'product',
      type: 'array',
      items: {
        type: 'string',
      },
    },
    product_image: {
      type: 'string',
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
    'product_id',
    'name',
    'product',
    'created_at',
    'updated_at',
  ],
};
