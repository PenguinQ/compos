<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Common Components
import { Button, Dialog, Text } from '@/components';

// Assets
import FirefoxWarning from '@/assets/images/firefox-warning.webp';

const firstWarning = ref<string | null>(null);
const dialog       = ref(false);

onMounted(() => {
  firstWarning.value = localStorage.getItem('firefoxWarning');

  if (!firstWarning.value) dialog.value = true;
});

const closeDialog = () => {
  dialog.value = false;
  localStorage.setItem('firefoxWarning', 'true');
};
</script>

<template>
  <Dialog
    v-if="!firstWarning"
    v-model="dialog"
    title="Heads Up!"
    class="firefox-warning-dialog"
    persistent
    noClose
  >
    <picture>
      <img :src="FirefoxWarning" alt="Firefox for iOS and iPadOS image" />
    </picture>
    <Text class="margin-top margin-bottom-0">
      <b>Firefox for iOS and iPadOS</b> has limitations with downloading local backups. <b>For full backup functionality:</b>
      <ul class="margin-bottom-0">
        <li>Add this web app to your home screen <strong>(if you wanted to keep using Firefox)</strong>, or</li>
        <li>Use Safari, Chrome or other browsers on iOS</li>
      </ul>
    </Text>
    <template #footer>
      <div class="dialog-actions padding-top-0">
        <Button full @click="closeDialog">Got it!</Button>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss" scoped>
.firefox-warning-dialog {
  picture {
    width: 100%;
    line-height: 1px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      max-width: 240px;
      width: 100%;
    }
  }
}
</style>

