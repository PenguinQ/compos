<script setup lang="ts">
import { ref } from 'vue';

import Button from '@components/Button';
import Link from '@components/Link';
import Text from '@components/Text';

import { useProduct } from '../hooks/ProductList.hook';

const keep = ref(false);
const {
  deleteID,
  products,
  isLoading,
  mutateDelete,
  mutateDeleteLoading,
  mutateRemove,
  nextPage,
} = useProduct();

const handleDelete = (id: string) => {
  deleteID.value = id;

  if (deleteID.value) mutateDelete();
};
</script>

<template>
  {{ keep }}
  <Button @click="keep = true">Keep Alive</Button>
  <Text v-if="isLoading">Product loading...</Text>
  <div v-else v-for="product in products">
    <Link :to="`/product/${product.id}`">
      {{ product.name }} {{ product.created_at }} {{ product.id }}
    </Link>
    |
    <Button @click="handleDelete(product.id)">Delete</Button>
  </div>

  <div>
    <Button @click="nextPage">Next Page</Button>
  </div>
</template>

<style lang="scss"></style>
