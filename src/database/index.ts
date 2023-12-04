import { addRxPlugin, createRxDatabase, removeRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'

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
    storage: getRxStorageMemory(),
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
};

export const testCall = () => {
  console.log(db);
};

export const testAdd = async () => {
  await db.product.insert({
    id: 'prod-1',
    name: 'Product One',
    price: 30000,
    timestamp: new Date().toISOString()
  });
};

export const addProduct = async (data: any) => {
  await db.product.insert({
    id: data.id,
    name: data.name,
    price: parseInt(data.price),
    timestamp: new Date().toISOString()
  });
};

export const removeProduct = async (id: any) => {
  await db.product.findOne(id).exec().then((prod: any) => {
    prod.remove();
  });
};

export const updateProduct = async (id: any) => {
  // const prod = db.product.find({
  //   selector: {
  //     id: {
  //       $eq: id,
  //     },
  //   },
  // });

  // await prod.update({
  //   $set: {
  //     price: 1000,
  //   },
  // });

  // console.log(prod);

  await db.product.findOne(id).exec().then((prod: any) => {
    prod.update({
      $set: {
        price: 10000000,
      },
    });
  });
};

export const getProduct = async (id: string) => {
  if (id) {
    return await db.product.find({
      selector: {
        id: {
          $eq: id,
        },
      },
    }).$;
  } else {
    return await db.product.find().$;
  }
};

