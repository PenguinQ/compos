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
  box-shadow:
    rgba(0, 0, 0, 0.16) 0 -3px 6px,
    rgba(0, 0, 0, 0.23) 0 -3px 6px;
  z-index: var(--z-10);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
