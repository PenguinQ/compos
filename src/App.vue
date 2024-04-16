<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ToastProvider } from '@components/Toast';
</script>

<template>
  <ToastProvider>
    <div id="page-container">
      <RouterView id="page-navbar" name="Navbar" />
      <div id="page-view"><RouterView /></div>
      <RouterView id="page-bottom-navbar" name="BottomNavbar" />
    </div>
  </ToastProvider>
</template>

<style scoped lang="scss">
#page {
  &-container {
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
  }

  &-navbar {
    grid-area: navbar;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  &-view {
    grid-area: view;
    position: relative;
  }

  &-bottom-navbar {
    grid-area: bottom-navbar;
    position: sticky;
    bottom: 0;
    z-index: 50;

    .cp-bottom-navbar-button {
      opacity: 0.1;
    }
  }
}
</style>
