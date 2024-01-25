<script setup lang="ts">
import { useRouter } from 'vue-router';

import Button from '@components/Button';

import ProductList from './components/ProductList.vue';
import BundleList from './components/BundleList.vue';

const router = useRouter();
</script>

<template>
  <ProductList />
  <hr />
  <!-- <BundleList /> -->
  <!-- <hr /> -->
  <Button @click="router.push('/product/add')">Go to Add Product Page</Button>
</template>

<style lang="scss" scoped></style>
