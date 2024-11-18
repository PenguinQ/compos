<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

// Common Components
import {
  Header,
  Content,
  Container,
  Row,
  Column,
  Bar,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Checkbox,
  DescriptionList,
  DescriptionListItem,
  Dialog,
  EmptyState,
  PullToRefresh,
  Label,
  Text,
  Toolbar,
  ToolbarAction,
  ToolbarSpacer,
  ToolbarTitle,
} from '@/components';
import ComposIcon, {
  Box,
  ArrowLeftShort,
  PencilSquare,
  Trash,
  CheckLarge,
  Tag,
  LayoutSidebarReverse,
  CartPlus,
} from '@/components/Icons';

import { useSetting } from './hooks/Setting.hook';

// Helpers
import { backup, restore } from '@/database/helpers';

const {
  backupInput,
  backupImages,
  restoreImages,
  dialogBackup,
  dialogRestore,
  isBackupLoading,
  isBackupError,
  isRestoreError,
  isRestoreLoading,
  backupRefetch,
  restoreRefetch,
  handleChangeRestore,
  handleDialogRestoreLeave,
} = useSetting();

const downloadTest = (e: Event) => {
  e.preventDefault();
};

const handleRefresh = (e: CustomEvent) => {
  console.log(e);

  setTimeout(() => {
    e.complete();
  }, 500);
};

onMounted(() => [
  document.querySelector('.test')?.setAttribute('href', URL.createObjectURL(new Blob(['asdas'])))
]);
</script>

<template>
  <Header>
    <Toolbar>
      <ToolbarTitle>Settings</ToolbarTitle>
    </Toolbar>
  </Header>
  <Content>
    <template #fixed>
      <PullToRefresh @refresh="handleRefresh" />
    </template>
    <Container>
      <input ref="backupInput" type="file" accept=".json" @change="handleChangeRestore">
      <Button @click="dialogBackup = true">Backup</Button>
      <a class="test" download>Test Download</a>
      <div style="height: 1000px; background-color: var(--color-neutral-2)"></div>
      <!-- <Button @click="dialogRestore = true">Restore</Button> -->
    </Container>
  </Content>
  <Dialog v-model="dialogBackup" title="Create Backup Data?" @leave="">
    <Checkbox v-model="backupImages" label="Backup Images?" />
    <Text body="small" margin="4px 0 0">
      Backup all images will takes longer time to complete and increase the backup file size.
    </Text>
    <template #footer>
      <div class="dialog-actions padding-top-0">
        <Button variant="outline" full @click="dialogBackup = false">Cancel</Button>
        <Button color="green" full @click="backupRefetch">
          <Bar v-if="isBackupLoading" color="var(--color-white)" size="18px" />
          <template v-else>Backup</template>
        </Button>
      </div>
    </template>
  </Dialog>
  <Dialog v-model="dialogRestore" title="Restore from Backup File?">
    <Text body="large" textAlign="center" margin="0 0 24px">
      Restore using the backup file will replace current existing data with the new one.
    </Text>
    <Checkbox v-model="restoreImages" label="Restore Images?" />
    <Text body="small" margin="4px 0 0">
      Restoring images only possible if the backup file has the image data. Restoring all images will takes longer time to complete.
    </Text>
    <template #footer>
      <div class="dialog-actions padding-top-0">
        <Button variant="outline" full @click="dialogRestore = false">Cancel</Button>
        <Button color="green" full @click="restoreRefetch">
          <Bar v-if="isRestoreLoading" color="var(--color-white)" size="18px" />
          <template v-else>Restore</template>
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss" scoped>
</style>
