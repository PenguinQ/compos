<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useProductDetail } from './hooks/ProductDetail.hook';

import Button from '@components/Button';
import Card, { CardHeader, CardTitle, CardBody } from '@components/Card';
import Navbar, { NavbarAction } from '@components/Navbar';
import EmptyState from '@components/EmptyState';
import Text from '@components/Text';
import Link from '@components/Link';
import { IconPencilSquare, IconTrash } from '@icons';
import { Column, Row, Container } from '@components/Layout';

import { PRODUCT_DETAIL } from './constants';

import NoImage from '@assets/illustration/no_image.svg';
import Error from '@assets/illustration/error.svg';

const router = useRouter();
const {
  data,
  refetch,
  isError,
  isLoading,
  deleteProduct,
  deleteProductLoading,
} = useProductDetail();
</script>

<template>
  <Navbar :title="data ? data.name : ''" sticky>
    <template v-if="!isError && !isLoading" #action>
      <NavbarAction
        backgroundColor="var(--color-blue-3)"
        @click="router.push(`/product/edit/${data.id}`)"
      >
        <IconPencilSquare color="#FFF" />
      </NavbarAction>
      <NavbarAction
        backgroundColor="var(--color-red-3)"
        @click="deleteProduct"
      >
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
        <Row>
          <Column :col="{ default: 12, md: 'auto' }">
            <Card>
              <picture class="detail-image">
                <img :src="`${data.image.length ? data.image[0] : NoImage}`" :alt="`${data.name} image`" />
              </picture>
            </Card>
          </Column>
          <Column>
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardBody>
                <pre style="overflow: auto; margin: 0;">
                  {{ data }}
                </pre>
              </CardBody>
            </Card>
          </Column>
          <Column :col="{ default: 12 }">
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
              </CardHeader>
              <CardBody>
                <template v-if="!data.variant.length">No shit</template>
                <template v-else>This is...</template>
              </CardBody>
            </Card>
          </Column>
        </Row>
      </Container>
      <div class="cp-lists">
        <div class="cp-list">
          <Text class="cp-list__title" heading="4">Name</Text>
          <Text class="cp-list__description">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </Text>
        </div>
      </div>
      <img style="width: 100px; height: 100px; object-fit: contain;" v-for="image in data.image" :src="image" />
    </template>
  </template>
</template>

<style lang="scss">
.detail {
  &-image {
    display: block;

    img {
      display: block;
    }
  }
}

.cp-lists {
  background-color: var(--color-white);
}

.cp-list {
  padding: 8px 16px;

  &__title {
    margin-bottom: 4px;
  }

  &__description {
    margin-bottom: 0;
  }
}
</style>
