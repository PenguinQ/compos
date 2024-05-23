<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ToastProvider } from '@components/Toast';
</script>

<template>
  <ToastProvider>
    <RouterView />
    <RouterView name="navigation" />
  </ToastProvider>
</template>

<style lang="scss">
:root {
  --bottom-nav-height: 68px;
}

#app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;

  header {
    flex: 0 0 auto;
  }

  main {
    flex-grow: 1;
    overflow-y: auto;
  }

  footer {
    flex: 0 0 auto;
  }
}

#main-view {
  flex-grow: 1;
  overflow-y: auto;
}

#page {
  &-container {
    // min-height: 100vh;
    // display: grid;
    // grid-template-rows: auto 1fr auto;
    // grid-template-areas:
    //   "navbar"
    //   "view"
    //   "bottom-navbar";

    // New
    height: 100vh;
    display: flex;
    flex-direction: column;

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
    // grid-area: view;
    // position: relative;

    // // New
    // flex: 1 0 auto;
    // height: 0;
    // min-height: 0;
    // overflow-y: auto;

    flex-grow: 1;
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
