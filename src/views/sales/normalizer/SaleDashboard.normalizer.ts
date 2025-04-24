import type { QueryReturn as SaleDetailQueryReturn } from '@/database/query/sale/getSaleDetail';
import type { QueryReturn as SaleOrdersQueryReturn } from '@/database/query/sale/getSaleOrders';
import type { QueryReturn as SaleProductsQueryReturn } from '@/database/query/sale/getSaleProducts';

import { getUpdateTime, toIDR } from '@/helpers';

export const dashboardDetailsNormalizer = (data: SaleDetailQueryReturn) => {
  const { finished, name, products, initial_balance, updated_at, order_notes } = data || {};
  const saleProducts = [];

  for (const product of products) {
    const { id, product_id, quantity } = product;

    saleProducts.push({ id, product_id, quantity });
  }

  return {
    products : saleProducts,
    updatedAt: getUpdateTime(updated_at),
    name,
    finished,
    ...(order_notes ? { orderNotes: order_notes } : {}),
    ...(initial_balance ? { balance: initial_balance } : {}),
  };
};

export const dashboardProductsNormalizer = (data: SaleProductsQueryReturn)=> {
  const { data: productsData, data_count } = data;
  const productList = [];

  for (const product of productsData) {
    const {
      active,
      id,
      images,
      name,
      price,
      quantity,
      sku,
      stock,
      items,
    } = product;
    let itemList  = [];
    let itemStock = stock;

    if (items) {
      const lowestStockedItem = items.reduce((acc, curr) => curr.stock < acc.stock ? curr : acc, items[0]);

      for (const item of items) {
        const { id, name, price, quantity, sku, stock } = item;

        itemList.push({
          priceFormatted: toIDR(price),
          id,
          name,
          price,
          quantity,
          stock,
          ...(sku ? { sku } : {}),
        });
      }

      itemStock = Math.floor(lowestStockedItem.stock / lowestStockedItem.quantity);
    }

    productList.push({
      items         : itemList.length ? itemList : undefined,
      priceFormatted: toIDR(price),
      stock         : itemStock!,
      id,
      active,
      images,
      name,
      price,
      quantity,
      ...(sku ? { sku } : {}),
    });
  }

  return {
    products     : productList,
    productsCount: data_count,
  };
};

export const dashboardOrdersNormalizer = (data: SaleOrdersQueryReturn) => {
  const { data: ordersData, data_count } = data;
  const { orders, orders_total_change }  = ordersData;
  const ordersList = [];

  for (const order of orders) {
    const { id, canceled, name, products, total, tendered, change, note } = order;
    const orderProductList = [];

    for (const product of products) {
      const { name, quantity, items } = product;
      const itemList = [];

      if (items) {
        for (const item of items) {
          const { name, quantity: item_quantity } = item;

          itemList.push({
            quantity: item_quantity * quantity,
            name,
          });
        }
      }

      orderProductList.push({
        items: itemList.length ? itemList : undefined,
        name,
        quantity,
      });
    }

    ordersList.push({
      products         : orderProductList,
      totalFormatted   : toIDR(total),
      tenderedFormatted: toIDR(tendered),
      changeFormatted  : toIDR(change),
      id,
      canceled,
      name,
      total,
      tendered,
      change,
      note,
    });
  }

  return {
    orders                    : ordersList,
    ordersTotalChange         : orders_total_change,
    ordersTotalChangeFormatted: toIDR(orders_total_change),
    ordersCount               : data_count,
  };
};
