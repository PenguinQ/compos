<script setup lang="ts">
import type * as CSS from 'csstype';

// Common Components
import { Button } from '@/components';
import ComposIcon, { PlusLarge } from '@/components/Icons';

type FloatingActionButton = {
  align?: CSS.Property.AlignSelf;
};

defineProps<FloatingActionButton>();
</script>

<template>
  <Button class="vc-fab" :style="{ alignSelf: align }">
    <ComposIcon :icon="PlusLarge" size="24" />
    <slot />
  </Button>
</template>

<style lang="scss">
.vc-fab {
  border-radius: 9999px;
  gap: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  box-shadow: rgba(0, 0, 0, 0.12) 0 1px 3px, rgba(0, 0, 0, 0.24) 0 1px 2px;

  &:active {
    box-shadow: rgba(0, 0, 0, 0.16) 0 3px 6px, rgba(0, 0, 0, 0.23) 0 3px 6px;
  }
}
</style>
