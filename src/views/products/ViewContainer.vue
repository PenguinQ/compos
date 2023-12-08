<script setup lang="ts">
  import { RouterView } from 'vue-router';
</script>

<template>
  <!-- Without Keep Alive -->
  <RouterView />

  <!-- With Keep Alive -->
  <!-- <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" :key="$route.fullPath" />
    </keep-alive>
  </router-view> -->
</template>
