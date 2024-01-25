import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { RxDBAttachmentsPlugin } from 'rxdb/plugins/attachments';
import { wrappedAttachmentsCompressionStorage } from 'rxdb/plugins/attachments-compression';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'
import type { Database, DatabaseCollection } from './types';

// Development
import { createSampleProduct, createSampleBundle } from './query/product';

// Database Schema
import { product, variant, bundle } from './schema';

export let db: Database;

const createDB = async () => {
  const compressedStorage = wrappedAttachmentsCompressionStorage({
    // storage: getRxStorageDexie(),
    storage: getRxStorageMemory(),
  });

  db = await createRxDatabase<DatabaseCollection>({
    name: 'compos',
    // storage: getRxStorageDexie(),
    // storage: compressedStorage, // Use storage memory during development mode, change to Dexie later
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

  // Development
  createSampleProduct().then((productResult: any) => {
    const { bundle, result } = productResult;

    if (result.error && result.error.length) return false;

    console.info('Sample product successfully created');

    createSampleBundle(result.success, bundle).then((res: any) => {
      console.info('Sample bundle successfully created');
    });
  });
};

