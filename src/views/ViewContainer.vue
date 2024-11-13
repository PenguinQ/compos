<script setup lang="ts">
import { RouterView } from 'vue-router';

// Common Components
import { Page, BottomNavbar, BottomNavbarButton } from '@/components';
import { Archive, ArchiveFilled, Basket, BasketFilled } from '@/components/Icons';
</script>

<template>
  <Page>
    <RouterView />
    <BottomNavbar ref="nav">
      <BottomNavbarButton
        title="Sale Management"
        :icon="($route.name as string).startsWith('sale') ? BasketFilled : Basket"
        :active="($route.name as string).startsWith('sale')"
        @click="$router.push('/sale')"
      />
      <BottomNavbarButton
        title="Product Management"
        :icon="($route.name as string).startsWith('product') ? ArchiveFilled : Archive"
        :active="($route.name as string).startsWith('product')"
        @click="$router.push('/product')"
      />
    </BottomNavbar>
  </Page>
</template>
