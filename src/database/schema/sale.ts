export default {
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 1000,
    },
    finished: {
      type: 'boolean',
      default: false,
    },
    name: {
      type: 'string',
      maxLength: 1000,
    },
    order_notes: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'string',
        maxLength: 1000,
      },
      default: [],
    },
    products: {
      type: 'array',
      uniqueItems: true,
      items : {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          quantity: {
            type: 'integer',
            minimum: 1,
          },
        },
      },
      default: [],
    },
    products_sold: {
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
            type: 'integer',
            minimum: 0,
          },
          quantity: {
            type: 'integer',
            minimum: 1,
          },
          sku: {
            type: 'string',
          },
          items: {
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
                  type: 'number',
                  minimum: 0,
                  default: 0,
                },
                sku: {
                  type: 'string',
                  uniqueItems: true,
                },
              },
            },
          },
          total: {
            type: 'string',
          },
        },
      },
      default: [],
    },
    orders: {
      type: 'array',
      ref: 'order',
      uniqueItems: true,
      items: {
        type: 'string',
      },
      default: [],
    },
    initial_balance: {
      type: 'string',
    },
    final_balance: {
      type: 'string',
    },
    revenue: {
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
    'finished',
    'name',
    'products',
    'products_sold',
    'orders',
    'revenue',
    'created_at',
    'updated_at',
  ],
};
