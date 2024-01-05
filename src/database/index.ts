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
  variant,
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

