import { createBlob, createBlobFromBase64 } from 'rxdb';
import type { RxDumpCollection } from 'rxdb';

import { db, createCollections } from '@/database';
import { isProduct, isVariant, base64ToBlob } from '@/database/utils';
import type {
  BundleDoc,
  DatabaseCollection,
  OrderDoc,
  ProductDoc,
  SaleDoc,
  VariantDoc,
} from '@/database/types';
import type { BackupData } from '@/database/helpers/backup';

type CollectionsDump = RxDumpCollection<ProductDoc> & RxDumpCollection<VariantDoc> & RxDumpCollection<BundleDoc> & RxDumpCollection<SaleDoc> & RxDumpCollection<OrderDoc>;

export default async (file: File, restoreAttachments = false) => {
  try {
    const backupText = await file.text();
    const backupJSON = JSON.parse(backupText);
    const { collections, attachments } = backupJSON as BackupData;

    /**
     * ---------------------------------------------------------------
     * Remove existing collection and all documents on the collection.
     * ---------------------------------------------------------------
     */
    for (const collection of collections) {
      const { name } = collection;

      await db.collections[name as keyof DatabaseCollection].remove();
    }

    /**
     * -------------------------
     * Recreate the collections.
     * -------------------------
     */
    await createCollections();

    /**
     * -----------------------------------------
     * Adding new collections from backup files.
     * -----------------------------------------
     */
    for (const collection of collections) {
      const { name } = collection;

      await db[name as keyof DatabaseCollection].importJSON(collection as CollectionsDump);
    }

    /**
     * --------------------------------------
     * Adding back all attachments if exists.
     * --------------------------------------
     */
    if (restoreAttachments) {
      for (const attachment of attachments) {
        const { id, attachments } = attachment;

        if (isProduct(id)) {
          const _queryProduct = await db.product.findOne(id).exec();

          if (_queryProduct) {
            for (const attachment of attachments) {
              const { id, data, type } = attachment;
              const dataBlob = base64ToBlob(data, type);

              await _queryProduct.putAttachment({
                data: dataBlob,
                id,
                type,
              });
            }
          }
        } else if (isVariant(id)) {
          const _queryVariant = await db.variant.findOne(id).exec();

          if (_queryVariant) {
            for (const attachment of attachments) {
              const { id, data, type } = attachment;
              const dataBlob = base64ToBlob(data, type);

              await _queryVariant.putAttachment({
                data: dataBlob,
                id,
                type,
              });
            }
          }
        }
      }
    }
    return { result: true }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
