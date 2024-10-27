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
            type: 'string', // id of the product in order, can be product id, variant id, or bundle id
          },
          name: {
            type: 'string',
          },
          price: {
            type: 'string', // price of the product in question WHEN the sales happened
          },
          items: {  // if the product is a bundle store the product detail here
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
                price: {
                  type: 'string',
                },
                quantity: {
                  type: 'string',
                  minimum: 0,
                  default: 0,
                },
              },
            },
          },
          quantity: {
            type: 'integer', // quantity of the product WHEN the sales happened
            minimum: 0,
            default: 0,
          },
          total: {
            type: 'integer', // total price of the product WHEN the sales happened
            minimum: 0,
            default: 0,
          },
        },
      },
      default: [],
    },
    discount: {
      type: 'string',
      default: '0',
    },
    discount_type: {
      type: 'string',
      maxLength: 100,
      default: 'percentage',
    },
    tendered: {
      type: 'string',
      default: '0',
    },
    change: {
      type: 'string',
      default: '0',
    },
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
    'tendered',
    'change',
    'total',
    'created_at',
    'updated_at',
  ],
};
