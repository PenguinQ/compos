<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ToastProvider } from '@components/Toast';
</script>

<template>
  <ToastProvider>
    <div class="main">
      <RouterView class="main__navbar" name="Navbar" />
      <div class="main__view">
        <RouterView />
      </div>
      <RouterView class="main__bottom-navbar" name="BottomNavbar" />
    </div>
  </ToastProvider>
</template>

<style scoped lang="scss">
.main {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "navbar"
    "view"
    "bottom-navbar";

  > * {
    min-width: 0;
  }

  &__navbar {
    grid-area: navbar;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  &__view {
    grid-area: view;
    position: relative;
    // padding: 16px;
  }

  &__bottom-navbar {
    grid-area: bottom-navbar;
    position: sticky;
    bottom: 0;
    z-index: 50;
  }
}
</style>
