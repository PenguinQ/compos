import { ref, inject } from 'vue';

// Databases
import { useQuery } from '@/database/hooks';
import { createBackup, restoreBackup } from '@/database/helpers';

export const useSetting = () => {
  const toast         = inject('ToastProvider');
  const backupImages  = ref(false);
  const restoreImages = ref(false);
  const restoreFile   = ref<File | null>(null);
  const dialogBackup  = ref(false);
  const dialogRestore = ref(false);
  const backupInput   = ref<HTMLInputElement | null>(null);

  const {
    isError  : isBackupError,
    isLoading: isBackupLoading,
    refetch  : backupRefetch,
  } = useQuery({
    enabled: false,
    queryKey: ['compos-backup'],
    queryFn: () => createBackup(backupImages.value) as any,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error creating backup file', type: 'error' });
      console.log(`Error creating backup file,`, error.message);
    },
    onSuccess: async () => {
      // @ts-ignore
      toast.add({ message: 'Backup file created', type: 'success' });

      backupImages.value = false;
      dialogBackup.value = false;
    },
  });

  const {
    isError  : isRestoreError,
    isLoading: isRestoreLoading,
    refetch  : restoreRefetch,
  } = useQuery({
    enabled: false,
    queryKey: ['compos-restore'],
    queryFn: () => restoreBackup(restoreFile.value!, restoreImages.value) as any,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error restoring from backup file', type: 'error' });
      console.log(`Error restoring from backup file,`, error.message);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Restore completed', type: 'success' });

      dialogRestore.value = false;
    },
  });

  const handleChangeRestore = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file   = target.files?.[0];

    if (!file) {
      // @ts-ignore
      toast.add({ message: 'No backup file added yet', type: 'error' });
      return false;
    }

    if (file.type !== 'application/json') {
      // @ts-ignore
      toast.add({ message: 'Invalid backup file', type: 'error' });

      target.value = '';

      return false;
    }

    if (!file.name.endsWith('.json')) {
      // @ts-ignore
      toast.add({ message: 'Invalid backup file', type: 'error' });

      target.value = '';

      return false;
    }

    restoreFile.value   = file;
    dialogRestore.value = true;
  };

  const handleDialogRestoreLeave = () => {
    restoreFile.value   = null;
    restoreImages.value = false;
    if (backupInput.value) backupInput.value.value = '';
  };

  return {
    backupInput,
    backupImages,
    restoreImages,
    dialogBackup,
    dialogRestore,
    isBackupError,
    isBackupLoading,
    isRestoreError,
    isRestoreLoading,
    backupRefetch,
    restoreRefetch,
    handleChangeRestore,
    handleDialogRestoreLeave,
  }
};
