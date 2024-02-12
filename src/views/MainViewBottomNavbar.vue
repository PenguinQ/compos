<script setup lang="ts">
import { BottomNavbar, BottomNavbarButton } from '@components/BottomNavbar';
import { Archive, ArchiveFill, Basket, BasketFill } from '@icons';
</script>

<template>
  <BottomNavbar>
    <BottomNavbarButton
      title="Sales"
      :icon="($route.name as string).startsWith('sales') ? BasketFill : Basket"
      :active="($route.name as string).startsWith('sales')"
      @click="$router.push('/sales')"
    />
    <BottomNavbarButton
      title="Product Management"
      :icon="($route.name as string).startsWith('product') ? ArchiveFill : Archive"
      :active="($route.name as string).startsWith('product')"
      @click="$router.push('/product')"
    />
  </BottomNavbar>
</template>
