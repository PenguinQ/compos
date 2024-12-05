<script setup lang="ts">
import ComposIcon, * as Icons from '@components/Icons';

const { default: _, ...icons } = Icons;
</script>

<template>
  <div class="docs-icon-container">
    <div class="docs-icon" v-for="(value, key) of icons">
      <ComposIcon :icon="value" :size="32" />
      <span class="docs-icon__label">{{ key }}</span>
    </div>
  </div>
</template>

<style lang="scss">
.docs-icon-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  flex-wrap: wrap;
  gap: 32px;
}

.docs-icon {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__label {
    font-size: 12px;
    margin-top: 16px;
  }
}
</style>
