<script setup lang="ts">
interface Props {
  gap?: string | number;
  margin?: string | number;
  padding?: string | number;
}

defineProps<Props>()
</script>

<template>
  <div class="cp-radio-group" :style="{ gap, margin, padding }">
    <slot></slot>
  </div>
</template>

<style lang="scss">
.cp-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
