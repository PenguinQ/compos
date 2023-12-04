<script setup lang="ts">
import { reactive, ref, onBeforeMount, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import Button from '@components/Button';
import Textfield from '@components/Textfield';
import Textarea from '@components/Textarea';
import Link from '@components/Link';

import { useProductDetail, useTestDetail } from './hooks';

const {
  data: product,
  // formData,
  isLoading,
} = useTestDetail();

onMounted(() => {
  // console.log(formData);
});

const handleClick = () => {
  // console.log(formData);
};
</script>

<template>
  <p>This is Product detail page</p>
  <div v-if="isLoading">Loading...</div>
  <div v-else>
    {{ product }}
    <div>
      <Link :to="`/product/edit/${product.id}`">{{ product.name }}</Link>
    </div>
    <div>
      <Button @click="handleClick">Button</Button>
    </div>
  </div>
</template>

<style lang="scss"></style>
