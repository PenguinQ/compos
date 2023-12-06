import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'

// Development
import { setSampleData, createSampleBundle } from '@database/query/product';

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
  setSampleData().then((productResult: any) => {
    const { success, error } = productResult;

    if (error && error.length) return false;

    console.info('Sample product successfully created');

    createSampleBundle(success).then((bundleResult: any) => {
      console.info('Sample bundle successfully created');
    });
  });
};

