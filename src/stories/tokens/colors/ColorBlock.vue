<script setup lang="ts">
type ColorBlock = {
  color: string;
  backgroundColor: string;
};

defineProps<ColorBlock>();
</script>

<template>
  <div class="color-block" :style="{ color, backgroundColor }">
    <slot></slot>
  </div>
</template>

<style lang="scss">
.color-block {
  @include text-body-sm;
  font-weight: 600;
  text-align: right;
  display: flex;
  justify-content: space-between;
  padding: 16px;

  &:first-of-type {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-of-type {
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;
  }
}
</style>
