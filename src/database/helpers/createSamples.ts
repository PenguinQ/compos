import { monotonicFactory } from 'ulidx';
import Big from 'big.js';

import { db } from '../';
import { PRODUCT_ID_PREFIX, VARIANT_ID_PREFIX, BUNDLE_ID_PREFIX, SALES_ID_PREFIX } from '../constants'
import { BundleDoc, ProductDoc, SalesDoc, VariantDoc } from '../types';

type SampleProductVariant = {
  name: string;
  price: string;
  stock?: number;
};

type SampleProduct = Omit<ProductDoc, 'variants'> & {
  variants: SampleProductVariant[];
};

const sampleProducts = [
  {
    name: 'Jasmine Wishes',
    price: '135000',
    by: 'CESSA',
    stock: 100,
    sku: 'JWCESSA',
  },
  {
    name: 'Your Dirty Secrets',
    price: '150000',
    by: 'sa9x9',
    stock: 100,
  },
  {
    name: 'Hyperion Secret Log',
    price: '145000',
    by: 'CETEEE',
    stock: 100,
    sku: 'HSLCETEEE',
  },
  {
    name: 'The Fleeting Things',
    price: '165000',
    by: 'Ameyaki',
    stock: 100,
  },
  {
    name: 'Guru Binal Penyelamat Sekolah',
    price: '155000',
    by: 'NEIGE888',
    stock: 100,
    sku: 'GBPSNEIGE888',
  },
  {
    name: 'HSR Stickers',
    variants: [
      {
        name: 'Set 1',
        price: '25000',
        stock: 50,
      },
      {
        name: 'Set 2',
        price: '25000',
        stock: 50,
        sku: 'HSRSET2',
      },
      {
        name: 'Set 3',
        price: '25000',
        stock: 50,
      },
    ],
  },
];

const sampleBundles = [
  {
    name: 'Bundle 1',
    auto_price: true,
  },
  {
    name: 'Bundle 2',
    auto_price: true,
  },
];

const sampleSales = [
  {
    name: 'Comifuro (Day 1)',
    initial_balance: '1000000',
  },
  {
    name: 'Comifuro (Day 2)',
  },
];

const getRandomProduct = (products: any) => {
  return products[Math.floor(Math.random() * products.length)];
};

export default async () => {
  const ulid         = monotonicFactory();
  const productsData = [];
  const variantsData = [];
  const bundlesData  = [];
  const salesData    = [];

  /**
   * --------------------------------------
   * 1. Create sample product and variants.
   * --------------------------------------
   */
  for (const product of sampleProducts) {
    const productID = PRODUCT_ID_PREFIX + ulid();
    const {
      id,
      active,
      price,
      sku,
      stock,
      variants,
      created_at,
      updated_at,
      ...productRest
    } = product as SampleProduct;
    const productVariants = [];
    let isProductActive   = true;

    if (variants) {
      for (const variant of variants) {
        const { stock } = variant;
        const variantID     = VARIANT_ID_PREFIX + ulid();
        let isVariantActive = false;

        if (variant.stock) {
          isVariantActive = variant.stock > 0 ? true : false;
        }

        productVariants.push(variantID);

        variantsData.push({
          id        : variantID,
          product_id: productID,
          active    : isVariantActive,
          stock     : stock ? stock : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...variant,
        });
      }

      const isSomeActive = variantsData.some(variant => variant.active);

      isProductActive = isSomeActive ? true : false;

      await db.variant.bulkInsert(variantsData);
    } else {
      if (stock) isProductActive = stock > 0 ? true : false;
    }

    productsData.push({
      id        : productID,
      active    : isProductActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...(variants ? { variants: productVariants } : {}),
      ...(variants ? {} : { price }),
      ...(variants ? {} : { stock: stock ? stock : 0 }),
      ...(variants ? {} : { sku }),
      ...productRest,
    });
  }

  const insertProducts = await db.product.bulkInsert(productsData);

  console.info('Sample products:', insertProducts.success);

  /**
   * -------------------------
   * 2. Create sample bundles.
   * -------------------------
   */
  const activeProducts = productsData.filter(product => !product.variants && product.active);
  const activeVariants = variantsData.filter(variant => variant.active);

  for (const bundle of sampleBundles) {
    const bundleID = BUNDLE_ID_PREFIX + ulid();
    const {
      id,
      active,
      products,
      price,
      auto_price,
      created_at,
      updated_at,
      ...restBundle
    } = bundle as BundleDoc;
    const randomProducts  = <ProductDoc[] & VariantDoc[]>[];
    const randomProduct   = getRandomProduct(activeProducts);
    const randomVariant   = getRandomProduct(activeVariants);
    const bundleProducts  = [];
    const bundleAutoPrice = auto_price ? true : false;
    let bundlePrice       = price ? Big(price) : Big(0);
    let isBundleActive    = true;

    if (randomProduct) randomProducts.push(randomProduct);
    if (randomVariant) randomProducts.push(randomVariant);

    for (const product of randomProducts) {
      const { id, product_id, active, price, stock } = product;
      // const randomQuantity = Math.floor(Math.random() * (stock - 1 + 1)) + 1;

      if (!active) isBundleActive = false;

      if (bundleAutoPrice) {
        // bundlePrice = bundlePrice.plus(Big(price).times(randomQuantity));
        bundlePrice = bundlePrice.plus(Big(price).times(1));
      }

      bundleProducts.push({
        // quantity: randomQuantity,
        quantity: 1,
        id,
        active,
        ...(product_id ? { product_id } : {}),
      });
    };

    bundlesData.push({
      id        : bundleID,
      active    : isBundleActive,
      products  : bundleProducts,
      price     : bundlePrice.toString(),
      auto_price: bundleAutoPrice,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...restBundle,
    });
  };

  const insertBundles = await db.bundle.bulkInsert(bundlesData);

  console.info('Sample bundles:', insertBundles.success);

  /**
   * -----------------------
   * 3. Create sample sales.
   * -----------------------
   */
  const variantlessProducts = productsData.filter(product => !product.variants);

  for (const sale of sampleSales) {
    const saleID = SALES_ID_PREFIX + ulid();
    const {
      id,
      finished,
      initial_balance,
      final_balance,
      revenue,
      orders,
      products,
      products_sold,
      created_at,
      updated_at,
      ...restSale
    } = sale as SalesDoc;
    const randomProducts = <ProductDoc[] & VariantDoc[] & BundleDoc[]>[];
    const randomProduct  = getRandomProduct(variantlessProducts);
    const randomVariant  = getRandomProduct(variantsData);
    const randomBundle   = getRandomProduct(bundlesData);
    const saleProducts   = [];

    if (randomProduct) randomProducts.push(randomProduct);
    if (randomVariant) randomProducts.push(randomVariant);
    if (randomBundle)  randomProducts.push(randomBundle);

    for (const product of randomProducts) {
      const { id, stock } = product;
      const randomQuantity = Math.floor(Math.random() * ((stock ? stock : 1) - 1 + 1)) + 1;

      saleProducts.push({
        // quantity: randomQuantity,
        quantity: 1,
        id,
      });
    };

    salesData.push({
      id           : saleID,
      finished     : false,
      products     : saleProducts,
      products_sold: [],
      orders       : [],
      revenue      : '0',
      created_at   : new Date().toISOString(),
      updated_at   : new Date().toISOString(),
      ...(initial_balance ? { initial_balance } : {}),
      ...restSale,
    });
  };

  const insertSales = await db.sales.bulkInsert(salesData);

  console.info('Sample sales:', insertSales.success);
};
