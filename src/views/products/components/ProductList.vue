<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from '@components/Button';
import Link from '@components/Link';
import Text from '@components/Text';
import Label from '@components/Label';

import { useProductList, useProduct } from '../hooks/ProductList.hook';
import { Tabs, Tab } from '@components/Tabs';

import NoImage from '../assets/no_image.svg';

// const keep = ref(false); // For keep alive testing
const router = useRouter();
const {
  data,
  productsLoading,
  productsError,
  toNextPage,
  toPrevPage,
  testUpdate,
} = useProductList();

onMounted(() => {

});
</script>

<template>
  <div>
    <Button @click="toPrevPage($event, true)" :disabled="data.first_page ? true : false">First Page</Button>
    <Button @click="toPrevPage" :disabled="data.first_page ? true : false">Prev Page</Button>
    <Button @click="toNextPage" :disabled="data.last_page ? true : false">Next Page</Button>
    <Button @click="toNextPage($event, true)" :disabled="data.last_page ? true : false">Last Page</Button>
  </div>
  <Text v-if="productsError">Products Error...</Text>
  <div v-else class="product-grid">
    <div class="product" v-for="product in data.products" @click="router.push(`/product/${product.id}`)">
      <div class="product__container">
        <div class="product__image">
          <img
            :src="product.image ? product.image : NoImage"
            :alt="`${product.name} image`"
            loading="lazy"
          />
        </div>
        <div class="product__detail">
          <span style="display: block; overflow: hidden;">{{ product.image64 }}</span>
          <Text
            class="product__title"
            heading="4"
            margin="0 0 8px"
            :title="product.name"
          >
            {{ product.name }}
          </Text>
          <Label v-if="product.variant">{{ product.variant }} variants</Label>
          <Label v-else variant="outline">No variant</Label>
          <!-- <br />
          <Link :to="`/product/${product.id}`">Detail</Link> |
          <button @click="testUpdate($event, product.id)">Test</button> -->
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
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.product {
  border: 1px solid var(--color-disabled-border);
  cursor: pointer;
  margin-top: -1px;
  transition: box-shadow 280ms cubic-bezier(0.63, 0.01, 0.29, 1);
  -webkit-user-select: none;
  user-select: none;

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
      height: 100%;
      object-fit: contain;
      display: block;
    }
  }

  &__detail {
    flex: 1 1 auto;
    padding: 0;
  }

  &__title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@include screen-md {
  .product-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    padding: 16px;
  }

  .product {
    border-radius: 6px;
    display: block;
    padding: 0;
    border: none;
    transition: all 280ms cubic-bezier(0.63, 0.01, 0.29, 1);
    margin-top: 0;

    &__container {
      display: block;
      border-radius: inherit;
      box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
      padding: 0;
      transition: none;
    }

    &__image {
      width: 100%;
      height: 180px;
      box-shadow: none;
    }

    &__detail {
      border-top: 1px solid var(--color-disabled-border);
      padding: 12px;
    }

    &:active {
      box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
      transform: scale(0.98);

      .product__container {
        transform: none;
      }
    }
  }
}

@include screen-lg {
  .product-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@include screen-xl {
  .product-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}
</style>
