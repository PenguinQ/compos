import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
import { RxDBAttachmentsPlugin } from 'rxdb/plugins/attachments';
import { wrappedAttachmentsCompressionStorage } from 'rxdb/plugins/attachments-compression';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'
import type { DexieSettings } from 'rxdb';
import type { RxStorageDexie } from 'rxdb/plugins/storage-dexie';
import type { RxStorageMemory, RxStorageMemorySettings } from 'rxdb/plugins/storage-memory';

import { sale, order, product, variant, bundle } from './schema';
import { productORMs, variantORMs, bundleORMs, saleORMs } from './orms';

import type { Database, DatabaseCollection } from './types';

type Storage = ((settings?: DexieSettings) => RxStorageDexie) | ((settings?: RxStorageMemorySettings) => RxStorageMemory);

export let db: Database;

const createDB = async () => {
  const dbName  = import.meta.env.VITE_DB_NAME;
  let dbStorage: Storage = getRxStorageDexie;

  if (import.meta.env.MODE === 'development') {
    await import('rxdb/plugins/storage-memory').then(module => {
      dbStorage = module.getRxStorageMemory;
    });
  }

  const compressedStorage = wrappedAttachmentsCompressionStorage({
    storage: dbStorage(),
  });

  db = await createRxDatabase<DatabaseCollection>({
    name         : dbName,
    storage      : compressedStorage,
    eventReduce  : true,
    cleanupPolicy: {
      minimumDeletedTime     : 1000 * 60 * 60 * 24 * 7, // 7 days
      minimumCollectionAge   : 1000 * 60 * 60 * 24 * 7, // 7 days
      runEach                : 1000 * 60 * 60 * 24,     // once a day
      awaitReplicationsInSync: true,
      waitForLeadership      : true,
    },
  });
};

export const recreateDB = () => {
  /**
   * Yeah this is somehow stupid, but rxStorageDexie doesn't expose Dexie .open() method that allows me to re-open connection to the current db instance
   * that are closed when url change in some specific cases. (eg: blob url).
   *
   * For now this is the only way I found to recreate the lost connection. (Since the db are actually recreated).
   */
  window.location.reload();
};

export const createCollections = async () => {
  const collections = await db.addCollections({
    product: {
      schema : product,
      methods: productORMs,
    },
    variant: {
      schema : variant,
      methods: variantORMs,
    },
    bundle: {
      schema : bundle,
      methods: bundleORMs,
    },
    sale: {
      schema : sale,
      methods: saleORMs,
    },
    order: {
      schema: order,
    },
  });

  collections.product.preRemove(async (data) => {
    if (import.meta.env.MODE === 'development') console.log('[product preRemove]');

    const product = await collections.product.findOne(data.id).exec();

    if (product) {
      const { variants } = product;

      if (variants && variants.length) {
        await product.removeVariants();
        await product.removeFromBundles(true);
        await product.removeFromSales();
      } else {
        await product.removeFromBundles();
        await product.removeFromSales();
      }
    }
  }, false);

  collections.variant.preRemove(async (data) => {
    if (import.meta.env.MODE === 'development') console.log('[variant preRemove]');

    const variant = await collections.variant.findOne(data.id).exec();

    if (variant) {
      await variant.removeFromBundles();
      await variant.removeFromSales();
    }
  }, false);

  collections.bundle.preRemove(async (data) => {
    if (import.meta.env.MODE === 'development') console.log('[bundle preRemove]');

    const bundle = await collections.bundle.findOne(data.id).exec();

    if (bundle) {
      await bundle.removeFromSales();
    }
  }, false);

  collections.sale.preRemove(async (data) => {
    if (import.meta.env.MODE === 'development') console.log('[sale preRemove]');

    const sale = await collections.sale.findOne(data.id).exec();

    if (sale) {
      await sale.removeOrders();
    }
  }, false);
};

export const initDB = async () => {
  if (import.meta.env.MODE === 'development') {
    await import('rxdb/plugins/dev-mode').then(module => addRxPlugin(module.RxDBDevModePlugin));
  }

  addRxPlugin(RxDBUpdatePlugin);
  addRxPlugin(RxDBAttachmentsPlugin);
  addRxPlugin(RxDBJsonDumpPlugin);

  if (!db) await createDB();

  await createCollections();

  if (import.meta.env.MODE === 'development') {
    await import ('./helpers/createSamples').then(module => module.default());
  }
};
