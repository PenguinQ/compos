<script setup lang="ts"></script>

<template>
  <div class="cp-card__title">
    <slot />
  </div>
</template>

<style lang="scss">
.cp-card__title {
  font-family: var(--text-heading-family);
  font-size: 20px;
  font-weight: 600;
  line-height: 32px;
  padding: 8px 16px;

  .cp-card__header &,
  .cp-card__body & {
    padding: 0;
  }
}
</style>
