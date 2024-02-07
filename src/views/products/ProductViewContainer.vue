<script setup lang="ts">
  import { RouterView } from 'vue-router';
</script>

<template>
  <RouterView />

  <!-- With Keep Alive -->
  <!-- <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" :key="$route.fullPath" />
    </keep-alive>
  </router-view> -->
</template>
