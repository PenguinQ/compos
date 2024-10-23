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
          // price: {
          //   type: 'integer',
          // },
          price: {
            type: 'string',
          },
          quantity: {
            type: 'integer',
            minimum: 0,
            default: 0,
          },
          total: {
            type: 'integer',
            minimum: 0,
            default: 0,
          },
        },
      },
      default: [],
    },
    // OLD
    // discount: {
    //   type: 'number',
    //   minimum: 0,
    //   default: 0,
    // },
    discount: {
      type: 'string',
      default: '0',
    },
    discount_type: {
      type: 'string',
      maxLength: 100,
      default: 'percentage',
    },
    // OLD
    // total: {
    //   type: 'number',
    //   minimum: 0,
    //   default: 0,
    // },
    total: {
      type: 'string',
      default: '0',
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
    'total',
    'created_at',
    'updated_at',
  ],
};
