<script setup lang="ts">
import { BottomNavbar, BottomNavbarButton } from '@components/BottomNavbar';
import { IconArchive, IconArchiveFill, IconBasket, IconBasketFill } from '@icons';
</script>

<template>
  <BottomNavbar id="view-navigation" v-if="!$route.meta.hideBottomNavbar">
    <BottomNavbarButton
      title="Sales"
      :icon="($route.name as string).startsWith('sales') ? IconBasketFill : IconBasket"
      :active="($route.name as string).startsWith('sales')"
      @click="$router.push('/sales')"
    />
    <BottomNavbarButton
      title="Product Management"
      :icon="($route.name as string).startsWith('product') ? IconArchiveFill : IconArchive"
      :active="($route.name as string).startsWith('product')"
      @click="$router.push('/product')"
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
