import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { RxDBAttachmentsPlugin } from 'rxdb/plugins/attachments';
import { wrappedAttachmentsCompressionStorage } from 'rxdb/plugins/attachments-compression';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'
import type { Database, DatabaseCollection } from './types';

// Development
import {
  createSampleProduct,
  createSampleBundle,
  createSampleSales,
  createSampleOrder,
} from './helpers';

// Database Schema
import {
  sales,
  order,
  product,
  variant,
  bundle,
} from './schema';

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

  await db.addCollections({
    sales: {
      schema: sales,
    },
    order: {
      schema: order,
    },
    product: {
      schema: product,
    },
    variant: {
      schema: variant,
    },
    bundle: {
      schema: bundle,
    },
  });

  const sampleProduct = await createSampleProduct();
  const { bundle: productBundle, result: productResult } = sampleProduct;
  const { success: productSuccess } = productResult;

  if (productSuccess.length) {
    const productSales = <string[]>[];

    productSuccess.slice(1, 2).map((product: any) => {
      const { id, variant } = product;

      productSales.push(variant.length ? variant[0] : id);
    });

    console.info('Sample product successfully created.');

    const sampleBundle = await createSampleBundle(productResult.success, productBundle);
    const { success: bundleSuccess } = sampleBundle;

    if (bundleSuccess.length) {
      console.info('Sample bundle successfully created.');

      console.log(productSales);

      const sampleSales = await createSampleSales(productSales);
      const { success: salesSuccess } = sampleSales;

      if (salesSuccess.length) {
        console.info('Sample sales successfully created.', salesSuccess);
      }
    }
  }
};

