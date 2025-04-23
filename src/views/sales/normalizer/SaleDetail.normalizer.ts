import { getUpdateTime, toIDR } from '@/helpers';
import type { QueryReturn } from '@/database/query/sale/getSaleDetail';

export const saleDetailNormalizer = (data: QueryReturn) => {
  const {
    finished,
    name,
    products,
    products_sold,
    orders,
    order_notes,
    initial_balance,
    final_balance,
    revenue,
    updated_at,
  } = data || {};
  const saleProducts     = [];
  const saleOrders       = [];
  const saleProductsSold = [];

  for (const product of products) {
    const { active, name, price, images, quantity, items, sku } = product;
    const saleProductsItems = [];

    if (items) {
      for (const item of items) {
        const { name, quantity, sku } = item;

        saleProductsItems.push({
          name,
          quantity,
          ...(sku ? { sku } : {}),
        });
      }
    }

    saleProducts.push({
      priceFormatted: toIDR(price),
      active,
      images,
      name,
      price,
      quantity,
      ...(sku ? { sku } : {}),
      ...(items ? { items: saleProductsItems } : {}),
    });
  }

  for (const order of orders) {
    const { id, canceled, name, products, tendered, change, total, note }  = order;
    const orderProducts = [];

    for (const product of products) {
      const { id, name, price, quantity, total } = product;

      orderProducts.push({
        priceFormatted: toIDR(price),
        totalFormatted: toIDR(total),
        id,
        name,
        price,
        quantity,
        total,
      });
    }

    saleOrders.push({
      products         : orderProducts,
      tenderedFormatted: toIDR(tendered),
      changeFormatted  : toIDR(change),
      totalFormatted   : toIDR(total),
      id,
      canceled,
      name,
      tendered,
      change,
      total,
      ...(note ? { note } : {}),
    });
  }

  for (const product of products_sold) {
    const { name, quantity, total, items, sku } = product;
    const product_items = [];

    if (items) {
      for (const item of items) {
        const { name, quantity } = item;

        product_items.push({ name, quantity });
      }
    }

    saleProductsSold.push({
      totalFormatted: toIDR(total),
      name,
      total,
      quantity,
      ...(sku ? { sku } : {}),
      ...(items ? { items: product_items } : {}),
    });
  }

  return {
    products        : saleProducts,
    productsSold    : saleProductsSold,
    orders          : saleOrders,
    revenueFormatted: toIDR(revenue),
    updatedAt       : getUpdateTime(updated_at),
    orderNotes      : order_notes,
    name,
    finished,
    revenue,
    ...(initial_balance ? { initialBalance: initial_balance } : {}),
    ...(initial_balance ? { initialBalanceFormatted: toIDR(initial_balance) } : {}),
    ...(final_balance ? { finalBalance: final_balance } : {}),
    ...(final_balance ? { finalBalanceFormatted: toIDR(final_balance) } : {}),
  };
};
