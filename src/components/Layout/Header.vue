<script setup lang="ts"></script>

<template>
  <div class="cp-header">
    <slot></slot>
  </div>
</template>

<style lang="scss">
.cp-header {
  position: relative;
  z-index: var(--z-10);
}
</style>
