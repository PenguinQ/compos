<script setup lang="ts"></script>

<template>
  <div class="cp-card__title">
    <slot />
  </div>
</template>

<style lang="scss">
.cp-card__title {
  font-size: 20px;
  line-height: 32px;
  padding: 8px 16px;

  .cp-card__header &,
  .cp-card__body & {
    padding: 0;
  }
}
</style>
