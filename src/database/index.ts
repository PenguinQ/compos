import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'

// Development
import { createSampleProduct, createSampleBundle } from './query/product';

// Database Schema
import {
  product,
  bundle,
} from './schema';

export let db: any;

const createDB = async () => {
  db = await createRxDatabase({
    name: 'compos',
    // storage: getRxStorageDexie(),
    storage: getRxStorageMemory(), // Use storage memory during development mode, change to Dexie later
    eventReduce: true,
  });
};

export const initDB = async () => {
  addRxPlugin(RxDBDevModePlugin);
  addRxPlugin(RxDBUpdatePlugin);

  if (!db) await createDB();

  await db.addCollections({
    product: {
      schema: product,
    },
    bundle: {
      schema: bundle,
    },
  });

  // Development
  createSampleProduct().then((productResult: any) => {
    const { success, error } = productResult;

    if (error && error.length) return false;

    console.info('Sample product successfully created');

    createSampleBundle(success).then(() => {
      console.info('Sample bundle successfully created');
    });
  });
};

