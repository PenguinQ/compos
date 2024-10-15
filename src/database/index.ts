import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { RxDBAttachmentsPlugin } from 'rxdb/plugins/attachments';
import { wrappedAttachmentsCompressionStorage } from 'rxdb/plugins/attachments-compression';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'

// Types
import type { Database, DatabaseCollection, SalesDocProduct } from './types';

// Development
import {
  createSampleProduct,
  createSampleBundle,
  createSampleSales,
  getSampleVariants,
} from './helpers';

// Database Schema
import { sales, order, product, variant, bundle } from './schema';

// Database ORMs
import { productsORMs, variantsORMs, bundlesORMs } from './orms';

export let db: Database;

const createDB = async () => {
  const compressedStorage = wrappedAttachmentsCompressionStorage({
    // storage: getRxStorageDexie(),
    storage: getRxStorageMemory(), // Use storage memory during development mode, change to Dexie later
  });

  db = await createRxDatabase<DatabaseCollection>({
    name: 'compos',
    // storage: getRxStorageDexie(),
    storage: compressedStorage, // Use storage memory during development mode, change to Dexie later
    eventReduce: true,
  });
};

export const initDB = async () => {
  addRxPlugin(RxDBDevModePlugin);
  addRxPlugin(RxDBUpdatePlugin);
  addRxPlugin(RxDBAttachmentsPlugin);

  if (!db) await createDB();

  const collections = await db.addCollections({
    sales: {
      schema: sales,
    },
    order: {
      schema: order,
    },
    product: {
      schema: product,
      methods: productsORMs,
    },
    variant: {
      schema: variant,
      methods: variantsORMs,
    },
    bundle: {
      schema: bundle,
      methods: bundlesORMs,
    },
  });

  // Product Hooks
  collections.product.preRemove(async (data) => {
    const product = await collections.product.findOne(data.id).exec();

    if (product) {
      const { variants } = product;

      if (variants.length) {
        await product.removeVariants();
        await product.removeFromBundles(true);
        await product.removeFromSales();
      } else {
        await product.removeFromBundles();
        await product.removeFromSales();
      }
    }
  }, false);

  // Variant Hooks
  collections.variant.preRemove(async (data) => {
    const variant = await collections.variant.findOne(data.id).exec();

    if (variant) {
      await variant.removeFromBundles();
      await variant.removeFromSales();
    }
  }, false);

  // Bundle Hooks
  collections.bundle.preRemove(async (data) => {
    const bundle = await collections.bundle.findOne(data.id).exec();

    if (bundle) {
      await bundle.removeFromSales();
    }
  }, false);

  /**
   * -------------------------------
   * Create sample development data.
   * -------------------------------
   */
  const sampleProduct = await createSampleProduct();
  const { bundle: productBundle, result: productResult } = sampleProduct;
  const { success: productSuccess } = productResult;

  if (productSuccess.length) {
    const productSales = <SalesDocProduct[]>[];
    const products = productSuccess.slice(0, 2);

    for (const product of products) {
      const { id } = product;
      const variants = await getSampleVariants(id);

      if (variants.length) {
        productSales.push({ id: variants[0].id, quantity: 1 })
      } else {
        productSales.push({ id, quantity: 1 });
      }
    }

    console.info('Sample product successfully created.', productSuccess);

    const sampleBundle = await createSampleBundle(productResult.success, productBundle);
    const { success: bundleSuccess } = sampleBundle;

    if (bundleSuccess.length) {
      console.info('Sample bundle successfully created.', bundleSuccess);

      const sampleSales = await createSampleSales(productSales);
      const { success: salesSuccess } = sampleSales;

      if (salesSuccess.length) {
        console.info('Sample sales successfully created.', salesSuccess);
      }
    }
  }
};
