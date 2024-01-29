<script setup lang="ts">
import { onMounted } from 'vue';

import Button from '@components/Button';
import Text from '@components/Text';
import Link from '@components/Link';

import { useBundleDetail } from './hooks/BundleDetail.hook';

const {
  data,
  isLoading,
  isError,
} = useBundleDetail();
</script>

<template>
  <Text heading="4">Bundle detail page</Text>
  <Text v-if="isError">Error</Text>
  <template v-else>
    <Text v-if="isLoading">Loading...</Text>
    <template v-else>
      <Text>
        <Link :to="`/product/bundle/edit/${data.id}`">Edit {{ data.name }}</Link>
      </Text>
      <pre>
        {{ data }}
      </pre>
    </template>
  </template>
</template>

<style lang="scss"></style>
