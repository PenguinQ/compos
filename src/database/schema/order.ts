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
          // ID of the product/variant/bundle WHEN the sales happened.
          id: {
            type: 'string',
          },
          // Name of the product/variant/bundle WHEN the sales happened.
          name: {
            type: 'string',
          },
          // Price of the product/variant/bundle WHEN the sales happened.
          price: {
            type: 'string',
          },
          // Items are used if the order product is a bundle.
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                // Bundle item ID WHEN the sales happened.
                id: {
                  type: 'string',
                },
                // Bundle item name WHEN the sales happened.
                name: {
                  type: 'string',
                },
                // Bundle item price WHEN the sales happened.
                price: {
                  type: 'string',
                },
                // Bundle item quantity WHEN the sales happened.
                quantity: {
                  type: 'string',
                  minimum: 0,
                  default: 0,
                },
                // Bundle item SKU WHEN the sales happened.
                sku: {
                  type: 'string',
                  uniqueItems: true,
                },
              },
            },
          },
          // SKU of the product/variant WHEN the sales happened, bundle doesn't have SKU.
          sku: {
            type: 'string',
            uniqueItems: true,
          },
          // Quantity of the product/variant/bundle WHEN the sales happened.
          quantity: {
            type: 'integer',
            minimum: 0,
            default: 0,
          },
          // Total price of the product/variant/bundle WHEN the sales happened.
          total: {
            type: 'integer',
            minimum: 0,
            default: 0,
          },
        },
      },
      default: [],
    },
    // discount: {
    //   type: 'string',
    //   default: '0',
    // },
    // discount_type: {
    //   type: 'string',
    //   maxLength: 100,
    //   default: 'percentage',
    // },
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
