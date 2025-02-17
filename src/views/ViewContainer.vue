<script setup lang="ts">
import { RouterView } from 'vue-router';

// Common Components
import { Page, BottomNavbar, BottomNavbarButton } from '@/components';
import { Archive, ArchiveFill, Basket, BasketFill, Gear, GearFill } from '@/components/Icons';
</script>

<template>
  <Page>
    <RouterView />
    <BottomNavbar>
      <BottomNavbarButton
        title="Sales Management"
        :icon="($route.name as string).startsWith('sale') ? BasketFill : Basket"
        :active="($route.name as string).startsWith('sale')"
        @click="$router.push('/sale')"
      />
      <BottomNavbarButton
        title="Product Management"
        :icon="($route.name as string).startsWith('product') ? ArchiveFill : Archive"
        :active="($route.name as string).startsWith('product')"
        @click="$router.push('/product')"
      />
      <BottomNavbarButton
        title="Settings"
        :icon="($route.name as string).startsWith('setting') ? GearFill : Gear"
        :active="($route.name as string).startsWith('setting')"
        @click="$router.push('/setting')"
      />
    </BottomNavbar>
  </Page>
</template>
