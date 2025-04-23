export default {
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 1000,
    },
    sale_id: {
      ref: 'sale',
      type: 'string',
    },
    canceled: {
      type: 'boolean',
      default: false,
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
          price: {
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
          sku: {
            type: 'string',
            uniqueItems: true,
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
    note: {
      type: 'string',
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
    'sale_id',
    'canceled',
    'name',
    'products',
    'tendered',
    'change',
    'total',
    'created_at',
    'updated_at',
  ],
};
