import { saveAs } from 'file-saver';
import type { RxDumpCollection } from 'rxdb';

import { db } from '@/database';
import type { DatabaseCollection} from '@/database/types';

import { backupStore } from '@/stores';

export type BackupData = {
  collections: RxDumpCollection<unknown>[];
  attachments: {
    id: string;
    attachments: {
      id: string;
      data: string;
      type: string;
    }[];
  }[];
};

export default async (backupAttachments = false) => {
  try {
    const backupData: BackupData = {
      collections: [],
      attachments: [],
    };

    for (const name in db.collections) {
      const collection            = db.collections[name as keyof DatabaseCollection];
      const collectionDocuments   = await collection.find().exec();
      const collectionAttachments = collection.schema.jsonSchema.attachments;
      const collectionBackup      = await collection.exportJSON();

      backupData.collections.push(collectionBackup);

      if (collectionAttachments && backupAttachments) {
        for (const document of collectionDocuments) {
          const { id } = document.toJSON();
          const documentAttachments      = document.allAttachments();
          const documentAttachmentsArray = [];

          if (documentAttachments.length) {
            for (const attachment of documentAttachments) {
              const attachmentData = await attachment.getData();
              const base64Data     = await new Promise(resolve => {
                const reader = new FileReader();

                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(attachmentData)
              });

              documentAttachmentsArray.push({
                id  : attachment.id,
                type: attachment.type,
                data: base64Data as string,
              });
            }

            backupData.attachments.push({
              id,
              attachments: documentAttachmentsArray,
            });
          }
        }
      }
    }

    const backupString = JSON.stringify(backupData, null);
    const backupName   = `COMPOS_BACKUP_${new Date().toISOString()}.json`;
    const backupBlob   = new Blob([backupString], { type: 'application/json' });

    backupStore.set();
    saveAs(backupBlob, backupName);

    return { result: true };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
