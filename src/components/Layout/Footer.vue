<script setup lang="ts"></script>

<template>
  <div class="cp-footer">
    <slot></slot>
  </div>
</template>

<style lang="scss">
.cp-footer {
  position: relative;
  z-index: var(--z-10);
}
</style>
