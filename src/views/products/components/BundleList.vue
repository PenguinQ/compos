<script setup lang="ts">
import { useRouter } from 'vue-router';

import Button from '@components/Button';
import Link from '@components/Link';
import Text from '@components/Text';
import Textfield from '@components/Textfield';
import Label from '@components/Label';
import {
  ChevronDoubleRight,
  ChevronDoubleLeft,
  ChevronLeft,
  ChevronRight,
} from '@icons';

import { useBundle } from '../hooks/BundleList.hook';

import NoImage from '../assets/no_image.svg';

const router = useRouter();
const {
  data,
  page,
  total_page,
  bundlesError,
  bundlesLoading,
  handleSearch,
  toPrevPage,
  toNextPage,
} = useBundle();

// const handleDelete = (id: string) => {
//   deleteID.value = id;

//   if (deleteID.value) mutateRemove();
// };
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
  <Text v-if="bundlesError">Products Error...</Text>
  <div style="padding: 0 16px;">
    <Textfield placeholder="Search" @input="handleSearch" />
  </div>
  <Text v-if="bundlesLoading">Bundles Loading...</Text>
  <template v-else>
    <div class="product-grid">
      <div class="product" v-for="bundle in data.bundles" @click="router.push(`/product/bundle/${bundle.id}`)">
        <div class="product__image">
          <template v-if="bundle.image.length">
            <img
              v-for="(image, index) of bundle.image"
              :src="image ? image : NoImage"
              :alt="`${bundle.name} image ${index + 1}`"
            />
          </template>
          <img v-else :src=" NoImage" :alt="`${bundle.name} image`" />
        </div>
        <div class="product__detail">
          <Text
            class="product__title"
            heading="4"
            margin="0 0 8px"
            :title="bundle.name"
          >
            {{ bundle.name }}
          </Text>
          <Label color="blue" v-if="bundle.count">{{ bundle.count }} products</Label>
          <Label v-else variant="outline">No product</Label>
        </div>
      </div>
    </div>
  </template>
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
    display: grid;
    grid-template-columns: repeat(2, 1fr);

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;

      &:only-child {
        grid-column: span 2;
      }
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
