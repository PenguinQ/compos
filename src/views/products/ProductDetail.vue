<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductDetail } from './hooks/ProductDetail.hook';

import Button from '@components/Button';
import Card, { CardHeader, CardTitle, CardBody } from '@components/Card';
import Navbar, { NavbarAction } from '@components/Navbar';
import EmptyState from '@components/EmptyState';
import Text from '@components/Text';
import Label from '@components/Label';
import Link from '@components/Link';
import { Column, Row, Container } from '@components/Layout';
import DescriptionList from '@components/DescriptionList';
import { IconPencilSquare, IconTrash } from '@icons';

import Ticker from '@components/Ticker';

import { PRODUCT_DETAIL } from './constants';

import NoImage from '@assets/illustration/no_image.svg';
import Error from '@assets/illustration/error.svg';

const router = useRouter();
const { data, refetch, isError, isLoading, deleteProduct, deleteProductLoading } = useProductDetail();

const ticker_items = ref([
  {
    title: 'Title One',
    description: 'Description one.',
    type: 'info',
  }, {
    title: 'Title Two',
    description: 'Description two.',
    type: 'warning',
  },
  {
    title: 'Title Three',
    description: 'Description three.',
    type: 'error',
  },
]);

const addTicker = () => {
  ticker_items.value.push({
    title: 'Title',
    description: 'Description.',
    type: 'error',
  });
};
</script>

<template>
  <Navbar :title="data ? data.name : ''" sticky>
    <template v-if="!isError && !isLoading" #action>
      <NavbarAction backgroundColor="var(--color-blue-3)" @click="router.push(`/product/edit/${data.id}`)">
        <IconPencilSquare color="#FFF" />
      </NavbarAction>
      <NavbarAction backgroundColor="var(--color-red-3)" @click="deleteProduct">
        <IconTrash color="#FFF" />
      </NavbarAction>
    </template>
  </Navbar>
  <EmptyState
    v-if="isError"
    :image="Error"
    :title="PRODUCT_DETAIL.ERROR_TITLE"
    :description="PRODUCT_DETAIL.ERROR_DESCRIPTION"
    margin="80px 0"
  >
    <template #action>
      <Button @click="refetch">Try Again</Button>
    </template>
  </EmptyState>
  <template v-else>
    <Text v-if="isLoading">Loading...</Text>
    <template v-else>
      <Container>
        <button @click="addTicker">Test</button>
        <Ticker :items="ticker_items" />
        <div class="product-detail">
          <Card>
            <CardBody>
              <Row>
                <Column :col="{ default: 12, md: 'auto' }">
                  <picture class="detail-image">
                    <img :src="`${data.image.length ? data.image[0] : NoImage}`" :alt="`${data.name} image`" />
                  </picture>
                </Column>
                <Column>
                  <DescriptionList
                    :items="[
                      {
                        title: 'Name',
                        description: data.name,
                      },
                      {
                        title: 'Description',
                        description: data.description ? data.description : '-',
                      },
                      {
                        title: 'By',
                        description: data.by ? data.by : '-',
                      },
                      {
                        title: 'Price',
                        description: `${data.price ? data.price : '-'}`,
                      },
                      {
                        title: 'Stock',
                        description: `${data.stock ? data.stock : '-'}`,
                      },
                      {
                        title: 'SKU',
                        description: data.sku ? data.sku : '-',
                      },
                    ]"
                  />
                </Column>
              </Row>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardBody>
              <EmptyState
                v-if="!data.variant.length"
                title="Hmm..."
                description="This product doesn't have any variants."
                margin="16px 0"
              />
              <template v-else>
                <div class="product-variants">
                  <div v-for="variant in data.variant" class="product-variant">
                    <picture class="product-variant__image">
                      <img :src="`${variant.image.length ? variant.image[0] : NoImage}`" :alt="`${variant.name} image`" />
                    </picture>
                    <div class="product-variant__detail">
                      <Text class="product-variant__name" body="large" as="h4">
                        <Label v-if="!variant.active" color="red">Inactive</Label>
                        {{ variant.name }}
                      </Text>
                      <Text class="product-variant__description">
                        Price: {{ variant.price }} | Stock: {{ variant.stock }}
                      </Text>
                    </div>
                  </div>
                </div>
              </template>
            </CardBody>
          </Card>
        </div>
      </Container>
    </template>
  </template>
</template>

<style lang="scss" scoped>
.product-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;

  > .cp-card {
    border-radius: 0;
  }
}

.product-variants {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-variant {
  display: flex;
  align-items: center;
  gap: 16px;

  &__image {
    width: 80px;
    height: 80px;
    border: 1px solid rgba(46, 64, 87, 0.4);
    border-radius: 4px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
  }

  &__detail {
    flex: 1 0 auto;
  }

  &__name {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
  }

  &__description {
    opacity: 0.8;
    margin-top: 8px;
    margin-bottom: 0;
  }
}

.detail {
  &-image {
    max-width: 180px;
    max-height: 180px;
    width: 180px;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.12),
      0 1px 2px rgba(0, 0, 0, 0.24);
    border-radius: 4px;
    display: block;
    overflow: hidden;
    margin: 0 auto;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
  }
}

@include screen-md {
  .product-detail {
    padding: 0;

    > .cp-card {
      border-radius: 8px;
    }
  }

  .detail-image {
    max-width: 240px;
    max-height: 240px;
    width: 240px;
  }
}
</style>
