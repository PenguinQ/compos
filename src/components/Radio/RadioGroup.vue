<script setup lang="ts">
type RadioGroup = {
  gap?: string | number;
  margin?: string | number;
  padding?: string | number;
};

defineProps<RadioGroup>()
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
