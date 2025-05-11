<script setup lang="ts">
import { version } from '../../../package.json';

// Common Components
import {
  Header,
  Content,
  Bar,
  Button,
  Card,
  Checkbox,
  Dialog,
  Text,
  Toolbar,
  ToolbarTitle,
  List,
  ListItem,
} from '@/components';
import ComposIcon, {
  Book,
  ChatDots,
  ChevronRight,
  DatabaseDown,
  DatabaseUp,
  Github,
  InfoCircle,
} from '@/components/Icons';

import { useSetting } from './hooks/Setting.hook';

const {
  backupInput,
  backupImages,
  restoreImages,
  dialogBackup,
  dialogRestore,
  isBackupLoading,
  isRestoreLoading,
  backupRefetch,
  restoreRefetch,
  handleChangeRestore,
  handleDialogRestoreLeave,
} = useSetting();
</script>

<template>
  <Header>
    <Toolbar>
      <ToolbarTitle>Settings</ToolbarTitle>
    </Toolbar>
  </Header>
  <Content>
    <Card radius="0" margin="16px 0">
      <List title="Backup and Restore">
        <ListItem
          title="Create Backup File"
          description="Export all your data as a backup file (.json) for future recovery and restoration."
          clickable
          @click="dialogBackup = true"
        >
          <template #prepend>
            <ComposIcon :icon="DatabaseUp" :size="28" />
          </template>
          <template #append>
            <ComposIcon :icon="ChevronRight" :size="20" />
          </template>
        </ListItem>
        <ListItem
          title="Restore From Backup File"
          description="Restore data from .json backup file that you've already created."
          clickable
          @click="backupInput?.click()"
        >
          <template #prepend>
            <ComposIcon :icon="DatabaseDown" :size="28" />
          </template>
          <template #append>
            <ComposIcon :icon="ChevronRight" :size="20" />
          </template>
        </ListItem>
      </List>
      <!-- Hidden Input -->
      <input
        ref="backupInput"
        id="restore-input"
        type="file"
        accept=".json"
        @change="handleChangeRestore"
      />
    </Card>
    <Card radius="0" margin="16px 0">
      <List title="Help">
        <ListItem
          title="How to Use"
          description="See the guide on how to use the application in Notion."
          to="https://www.notion.so/penguinq/How-to-Use-ComPOS-1e478b9f40b580079906d95048f660e8"
          target="_blank"
        >
          <template #prepend>
            <ComposIcon :icon="Book" :size="28" />
          </template>
          <template #append>
            <ComposIcon :icon="ChevronRight" :size="20" />
          </template>
        </ListItem>
        <ListItem
          title="Submit Issues"
          description="Submit any issues you found on this application GitHub repository."
          to="https://github.com/PenguinQ/compos/issues"
        >
          <template #prepend>
            <ComposIcon :icon="ChatDots" :size="28" />
          </template>
          <template #append>
            <ComposIcon :icon="ChevronRight" :size="20" />
          </template>
        </ListItem>
      </List>
    </Card>
    <Card radius="0" margin="16px 0">
      <List title="About">
        <ListItem title="Version" :description="`${version}`">
          <template #prepend>
            <ComposIcon :icon="InfoCircle" :size="28" />
          </template>
        </ListItem>
        <ListItem
          title="GitHub"
          description="Check the application repository on GitHub!"
          to="https://github.com/PenguinQ/compos/issues"
          target="_blank"
        >
          <template #prepend>
            <ComposIcon :icon="Github" :size="28" />
          </template>
          <template #append>
            <ComposIcon :icon="ChevronRight" :size="20" />
          </template>
        </ListItem>
      </List>
    </Card>
  </Content>

  <!-- Dialog Backup -->
  <Dialog
    v-model="dialogBackup"
    title="Create Backup Data?"
    maxWidth="480px"
  >
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

  <!-- Dialog Restore -->
  <Dialog
    v-model="dialogRestore"
    title="Restore from Backup File?"
    maxWidth="480px"
    @leave="handleDialogRestoreLeave"
  >
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
#restore-input {
  display: none;
}
</style>
