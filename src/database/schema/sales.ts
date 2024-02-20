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
      maxLength: 1000,
    },
    product: {
      type: 'array',
      ref: 'product',
      uniqueItems: true,
      items: {
        type: 'string', // Can be product, variant, or bundle id.
      },
      default: [],
    },
    order: {
      type: 'array',
      ref: 'order',
      uniqueItems: true,
      items: {
        type: 'string',
      },
      default: [],
    },
    income: {
      type: 'number',
      minimum: 0,
      default: 0,
    },
    finished: {
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
    'name',
    'product',
    'finished',
    'created_at',
    'updated_at',
  ],
};
