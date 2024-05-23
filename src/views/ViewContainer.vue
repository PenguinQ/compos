<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <div id="view-container">
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
#view-container {
  min-height: 100vh;
  padding-bottom: 68px;
}
</style>
