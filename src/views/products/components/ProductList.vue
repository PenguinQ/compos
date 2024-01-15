<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from '@components/Button';
import Link from '@components/Link';
import Text from '@components/Text';

import { useProductList, useProduct } from '../hooks/ProductList.hook';
import { Tabs, Tab } from '@components/Tabs';

import NoImage from '../assets/no_image.svg';

// const keep = ref(false); // For keep alive testing
const router = useRouter();
const {
  products,
  productsLoading,
  nextPage,
  testUpdate
} = useProductList();
</script>

<template>
  <div>
    <Button @click="nextPage">Next Page</Button>
  </div>
  <Text v-if="productsLoading">Product loading...</Text>
  <div v-else class="product-grid">
    <div class="product" v-for="product in products" @click="router.push(`/product/${product.id}`)">
      <div class="product__container">
        <div class="product__image">
          <img :src="product.image ? product.image : NoImage" :alt="`${product.name} image`" />
        </div>
        <div class="product__detail">
          <Text heading="4" margin="0 0 4px">{{ product.name }}</Text>
          <template v-if="product.variant">{{ product.variant }} variants</template>
          <template v-else>No variant</template>
          <br />
          <Link :to="`/product/${product.id}`">Detail</Link> |
          <button @click="testUpdate($event, product.id)">Test</button>
        </div>
      </div>
    </div>
  </div>
<!-- {{ keep }}
<Button @click="keep = true">Keep Alive</Button> -->
</template>

<style lang="scss" scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
}

.product {
  border: 1px solid var(--color-disabled-border);
  cursor: pointer;
  margin-top: -1px;
  transition: box-shadow 280ms cubic-bezier(0.63, 0.01, 0.29, 1);

  &:first-child {
    margin-top: 0;
  }

  &__container {
    display: flex;
    align-items: center;
    padding: 12px;
    transition: transform 280ms cubic-bezier(0.63, 0.01, 0.29, 1);
    gap: 16px;
  }

  &:active {
    box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1) inset;

    .product__container {
      transform: scale(0.98);
    }
  }

  &__image {
    width: 80px;
    height: 80px;
    flex: 0 1 80px;
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    border-radius: 6px;
    overflow: hidden;

    img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
    }
  }

  &__detail {
    flex: 1 1 auto;
    padding: 0;
  }
}

@include screen-md {
  .product-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    padding: 16px;
  }

  .product {
    border-radius: 6px;
    display: block;
    padding: 0;

    &__image {
      width: 100%;
      height: 180px;
    }

    &__detail {
      border-top: 1px solid var(--color-disabled-border);
    }
  }
}
</style>
