<script setup lang="ts"></script>

<template>
  <div class="cp-bottom-navbar">
    <slot />
  </div>
</template>

<style lang="scss">
.cp-bottom-navbar {
  color: var(--color-white);
  background-color: var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1000;
}
</style>
