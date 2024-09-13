<script setup lang="ts">
import { useRouter } from 'vue-router';

import { BottomNavbar, BottomNavbarButton } from '@components/BottomNavbar';
import { Archive, ArchiveFilled, Basket, BasketFilled } from '@components/Icons';

const router = useRouter();

const navigateTo = (path: string) => {
  const rootPath = router.getRoutes().find(route => route.path === path);
  const lastVisited = rootPath?.meta.lastVisited;
  const currentRoute = router.currentRoute.value;
  const currentPath = currentRoute.path;

  if (lastVisited) {
    if (currentPath.startsWith(path)) {
      rootPath.meta.lastVisited = null;
      router.push(path);
    } else {
      router.push(lastVisited);
    }
  } else {
    if (rootPath) rootPath.meta.lastVisited = null;
    if (!currentPath.startsWith(path)) router.push(path);
  }
};
</script>

<template>
  <BottomNavbar id="view-navigation" v-if="!$route.meta.hideBottomNavbar">
    <BottomNavbarButton
      title="Sales"
      :icon="($route.name as string).startsWith('sales') ? BasketFilled : Basket"
      :active="($route.name as string).startsWith('sales')"
      @click="navigateTo('/sales/list')"
    />
    <BottomNavbarButton
      title="Product Management"
      :icon="($route.name as string).startsWith('product') ? ArchiveFilled : Archive"
      :active="($route.name as string).startsWith('product')"
      @click="navigateTo('/product/list')"
    />
  </BottomNavbar>
</template>

<style lang="scss">
:root {
  --bottom-nav-height: 68px;
}

#view-navigation {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
