<script setup lang="ts"></script>

<template>
  <div class="cp-card__subtitle">
    <slot />
  </div>
</template>

<style lang="scss">
.cp-card__subtitle {
  font-size: 14px;
  line-height: 22px;
  opacity: 0.8;
  padding: 0 16px;

  .cp-card__header &,
  .cp-card__body & {
    padding: 0;
  }
}
</style>
