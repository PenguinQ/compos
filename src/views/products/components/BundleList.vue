<script setup lang="ts">
import Button from '@components/Button';
import Link from '@components/Link';
import Text from '@components/Text';

import { useBundle } from '../hooks/BundleList.hook';

const {
  deleteID,
  bundles,
  isLoading,
  mutateRemove,
  nextPage,
} = useBundle();

const handleDelete = (id: string) => {
  deleteID.value = id;

  if (deleteID.value) mutateRemove();
};
</script>

<template>
  <Text v-if="isLoading">Product loading...</Text>
  <div v-else v-for="bundle in bundles">
    <Link :to="`/product/bundle/${bundle.id}`">
      {{ bundle.name }} {{ bundle.created_at }} {{ bundle.id }}
    </Link>
    |
    <Button @click="handleDelete(bundle.id)">Delete</Button>
  </div>
  <div>
    <Button @click="nextPage">Next Page</Button>
  </div>
</template>

<style lang="scss"></style>
