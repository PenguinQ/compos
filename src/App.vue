<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ToastProvider } from '@components/Toast';
</script>

<template>
  <ToastProvider>
    <div id="page-container">
      <RouterView id="page-navbar" name="Navbar" />
      <div id="page-view">
        <RouterView />
      </div>
      <RouterView id="page-bottom-navbar" name="BottomNavbar" />
    </div>
  </ToastProvider>
</template>

<style lang="scss">
#page {
  &-container {
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      "navbar"
      "view"
      "bottom-navbar";

    // New
    display: flex;
    flex-direction: column;

    > * {
      min-width: 0;
    }

    &--flex {
      display: flex;
      flex-direction: column;
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

    // New
    flex: 1 0 auto;
    height: 0;
    overflow-y: auto;
  }

  &-bottom-navbar {
    grid-area: bottom-navbar;
    position: sticky;
    bottom: 0;
    z-index: 50;
  }
}
</style>
