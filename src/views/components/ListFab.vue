<script setup lang="ts">
import * as CSS from 'csstype';

// Common Components
import Button from '@components/Button';
import { IconPlusLarge } from '@components/icons';

type ListFabProps = {
  align?: CSS.Property.AlignSelf;
};

defineProps<ListFabProps>();
</script>

<template>
  <Button class="vc-list-fab" icon :style="{ alignSelf: align }">
    <IconPlusLarge size="32" />
  </Button>
</template>

<style lang="scss">
.vc-list-fab {
  box-shadow:
    rgba(0, 0, 0, 0.12) 0 1px 3px,
    rgba(0, 0, 0, 0.24) 0 1px 2px;

  &:active {
    box-shadow:
      rgba(0, 0, 0, 0.16) 0 3px 6px,
      rgba(0, 0, 0, 0.23) 0 3px 6px;
  }
}
</style>
