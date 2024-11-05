import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { RxDBAttachmentsPlugin } from 'rxdb/plugins/attachments';
import { wrappedAttachmentsCompressionStorage } from 'rxdb/plugins/attachments-compression';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'

import { sales, order, product, variant, bundle } from './schema';
import { productsORMs, variantsORMs, bundlesORMs, salesORMs } from './orms';
import { createSamples } from './helpers';
import type { Database, DatabaseCollection } from './types';

export let db: Database;

const createDB = async () => {
  const dbName    = import.meta.env.VITE_DB_NAME;
  const dbStorage = import.meta.env.MODE === 'production' ? getRxStorageDexie : getRxStorageMemory;

  const compressedStorage = wrappedAttachmentsCompressionStorage({
    storage: dbStorage() as any,
  });

  db = await createRxDatabase<DatabaseCollection>({
    name: dbName,
    storage: compressedStorage,
    eventReduce: true,
  });
};

export const initDB = async () => {
  if (import.meta.env.MODE === 'development') addRxPlugin(RxDBDevModePlugin);
  addRxPlugin(RxDBUpdatePlugin);
  addRxPlugin(RxDBAttachmentsPlugin);

  if (!db) await createDB();

  const collections = await db.addCollections({
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
    sales: {
      schema: sales,
      methods: salesORMs,
    },
    order: {
      schema: order,
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

  // Sales Hooks
  collections.sales.preRemove(async (data) => {
    const sales = await collections.sales.findOne(data.id).exec();

    if (sales) {
      await sales.removeOrders();
    }
  }, false);

  // Create sample data on development mode.
  if (import.meta.env.MODE === 'development') await createSamples();
};
