import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
import { RxDBAttachmentsPlugin } from 'rxdb/plugins/attachments';
import { wrappedAttachmentsCompressionStorage } from 'rxdb/plugins/attachments-compression';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'

import { sale, order, product, variant, bundle } from './schema';
import { productORMs, variantORMs, bundleORMs, saleORMs } from './orms';
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
   * Yeah this is somehow stupid, but rxStorageDexie doesn't expose Dexie .open() method that allows me to reopen connection to the existing db,
   * that closed when url changes in some specific cases. (eg: blob url).
   *
   * For now this is the only surefire way to recreate the lost connection. (Since the db are actually recreated).
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
  if (import.meta.env.MODE === 'development') addRxPlugin(RxDBDevModePlugin);
  addRxPlugin(RxDBUpdatePlugin);
  addRxPlugin(RxDBAttachmentsPlugin);
  addRxPlugin(RxDBJsonDumpPlugin);

  if (!db) await createDB();

  await createCollections();

  if (import.meta.env.MODE === 'development') await createSamples();
};
