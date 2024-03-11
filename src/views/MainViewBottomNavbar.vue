<script setup lang="ts">
import { BottomNavbar, BottomNavbarButton } from '@components/BottomNavbar';
import { IconArchive, IconArchiveFill, IconBasket, IconBasketFill } from '@icons';
</script>

<template>
  <BottomNavbar>
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
