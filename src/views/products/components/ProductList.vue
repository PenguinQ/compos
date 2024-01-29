<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { useProductList } from '../hooks/ProductList.hook';

import Button, { ButtonGroup } from '@components/Button';
import Link from '@components/Link';
import Text from '@components/Text';
import Textfield from '@components/Textfield';
import Label from '@components/Label';
import { Tabs, Tab } from '@components/Tabs';
import {
  ChevronDoubleRight,
  ChevronDoubleLeft,
  ChevronLeft,
  ChevronRight,
} from '@icons';

import NoImage from '../assets/no_image.svg';

// const keep = ref(false); // For keep alive testing
const router = useRouter();
const {
  data,
  search_query,
  page,
  total_page,
  productsLoading,
  productsError,
  toNextPage,
  toPrevPage,
  handleSearch,
} = useProductList();

onMounted(() => {

});
</script>

<template>
  <div class="product-pagination">
    <Button @click="toPrevPage($event, true)" :disabled="data.first_page ? true : false">
      <ChevronDoubleLeft size="18" color="var(--color-white)" />
    </Button>
    <Button @click="toPrevPage" :disabled="data.first_page ? true : false">
      <ChevronLeft size="18" color="var(--color-white)" />
    </Button>
    <div class="product-pagination__detail">
      <Text>Page {{ page }} of {{ total_page }}</Text>
    </div>
    <Button @click="toNextPage" :disabled="data.last_page ? true : false">
      <ChevronRight size="18" color="var(--color-white)" />
    </Button>
    <Button @click="toNextPage($event, true)" :disabled="data.last_page ? true : false">
      <ChevronDoubleRight size="18" color="var(--color-white)" />
    </Button>
  </div>
  <Text v-if="productsError">Products Error...</Text>
  <template v-else>
    <div style="padding: 0 16px;">
      <Textfield placeholder="Search" @input="handleSearch" />
    </div>
    <div class="product-grid">
      <div class="product" v-for="product in data.products" @click="router.push(`/product/${product.id}`)">
        <!-- <div class="product__container"> -->
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
          </div>
        <!-- </div> -->
      </div>
    </div>
  </template>
<!-- {{ keep }}
<Button @click="keep = true">Keep Alive</Button> -->
</template>

<style lang="scss" scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 16px;
}

.product-pagination {
  display: flex;
  align-items: center;

  > .cp-button {
    border-radius: 0;
    margin-right: -1px;

    &:first-child {
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
    }

    &:last-child {
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    &:active {
      transform: none;
    }
  }

  &__detail {
    width: 100px;
    display: flex;
    align-self: stretch;
    align-items: center;
    flex-shrink: 0;
    border: 1px solid var(--color-black);
    padding: 4px 8px;

    .cp-text {
      width: 100%;
      text-align: center;
      margin: 0;
    }

    + .cp-button {
      margin-right: 0;
    }
  }
}

.product {
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  border-radius: 6px;
  cursor: pointer;
  display: block;
  padding: 0;
  transition: all 280ms cubic-bezier(0.63, 0.01, 0.29, 1);

  &:active {
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
    transform: scale(0.98);
  }

  &__image {
    width: 100%;
    height: 180px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
  }

  &__detail {
    border-top: 1px solid var(--color-disabled-border);
    padding: 12px;
  }

  &__title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@include screen-md {
  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@include screen-lg {
  .product-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@include screen-xl {
  .product-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
