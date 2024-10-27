<script setup lang="ts">
import { useRouter } from 'vue-router';

// Common Components
import Button from '@components/Button';
import Card, { CardBody } from '@components/Card';
import DescriptionList, { DescriptionListItem } from '@components/DescriptionList';
import Dialog from '@components/Dialog';
import EmptyState from '@components/EmptyState';
import Label from '@components/Label';
import Text from '@components/Text';
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import { Container, Column, Row } from '@components/Layout';
import Separator from '@components/Separator';
import ComposIcon, { ArrowLeftShort, PencilSquare, Trash, CheckLarge } from '@components/Icons';

// View Components
import ProductImage from '@/views/components/ProductImage.vue';

// Hooks
import { useSalesDetail } from './hooks/SalesDetail.hook';

// Constants
import GLOBAL from '@/views/constants';
import { SALES_DETAIL } from './constants';

// Assets
import no_image from '@assets/illustration/no_image.svg';

const router = useRouter();
const {
  salesId,
  dialogDelete,
  dialogFinish,
  data,
  isError,
  isLoading,
  refetch,
  mutateDelete,
  mutateFinish,
  isMutateDeleteLoading,
  isMutateFinishLoading,
} = useSalesDetail();
</script>

<template>
  <!-- Header -->
  <Toolbar sticky>
    <ToolbarAction icon @click="router.push('/sales')">
      <ComposIcon :icon="ArrowLeftShort" size="40" />
    </ToolbarAction>
    <ToolbarTitle>Sales Detail</ToolbarTitle>
    <ToolbarSpacer />
    <ToolbarAction
      v-if="!isError && !isLoading"
      icon
      backgroundColor="var(--color-blue-4)"
      @click="router.push(`/sales/edit/${salesId}`)"
    >
      <ComposIcon :icon="PencilSquare" />
    </ToolbarAction>
    <!-- If there are no sales yet, show delete button instead finish button -->
    <ToolbarAction
      v-if="!isError && !isLoading"
      icon
      backgroundColor="var(--color-red-4)"
      @click="dialogDelete = true"
    >
      <ComposIcon :icon="Trash" />
    </ToolbarAction>
    <!-- If there are some sales been done, show finish button instead delete button -->
    <ToolbarAction
      v-if="!isError && !isLoading"
      icon
      backgroundColor="var(--color-green-4)"
      @click="dialogFinish = true"
    >
      <ComposIcon :icon="CheckLarge" :size="32" />
    </ToolbarAction>
  </Toolbar>

  <!-- Content -->
  <EmptyState
    v-if="isError"
    :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
    :title="GLOBAL.ERROR_EMPTY_TITLE"
    :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
    margin="80px 0"
  >
    <template #action>
      <Button @click="refetch">Try Again</Button>
    </template>
  </EmptyState>
  <Container v-else class="page-container">
    <template v-if="isLoading">
      Loading
    </template>
    <template v-else>
      <Row>
        <Column col="12">
          <Card class="section-card" variant="outline">
            <CardBody>
              <Text heading="3" as="h2" margin="0">{{ data.name }}</Text>
              <Separator />
              <DescriptionList class="pd-description-list" alignment="horizontal">
                <DescriptionListItem alignItems="center">
                  <dt>Status</dt>
                  <dd>
                    <Label :color="data.finished ? undefined : 'red'">
                      {{ data.finished ? 'Finished' : 'Running' }}
                    </Label>
                  </dd>
                </DescriptionListItem>
                <DescriptionListItem>
                  <dt>Revenue</dt>
                  <dd>{{ data.revenueFormatted || '-' }}</dd>
                </DescriptionListItem>
                <DescriptionListItem>
                  <dt>Updated At</dt>
                  <dd>{{ data.updatedAt || '-' }}</dd>
                </DescriptionListItem>
              </DescriptionList>
              <Separator />
              <Text heading="5" as="h3" margin="0 0 16px">Products</Text>
              <div class="sales-products">
                <div class="sales-product" v-for="product in data.products">
                  <ProductImage class="sales-product__image">
                    <img v-if="!product.images.length" :src="no_image" :alt="`${product.name} image`">
                    <img v-else v-for="image of product.images" :src="image ? image : no_image" :alt="`${product.name} image`">
                  </ProductImage>
                  <div class="sales-product__detail">
                    <Text class="sales-item__name" body="large" as="h4" truncate margin="0 0 8px">{{ product.name }}</Text>
                    <Text class="sales-item__price" truncate margin="0">{{ product.price }}</Text>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Column>
        <Column :col="{ default: 12, md: 6 }">
          <Card class="section-card" variant="outline">
            <CardBody>
              <Text heading="4" as="h2" margin="0">Order</Text>
              <Separator />
              <div class="sales-orders">
                <EmptyState
                  v-if="!data.orders.length"
                  emoji="📉"
                  :title="SALES_DETAIL.EMPTY_ORDER_TITLE"
                  :description="SALES_DETAIL.EMPTY_ORDER_DESCRIPTION"
                  margin="80px 0"
                >
                </EmptyState>
                <div v-else class="sales-order" v-for="order in data.orders">
                  <div>{{ order.name }}</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Column>
        <Column :col="{ default: 12, md: 6 }">
          <Card class="section-card" variant="outline">
            <CardBody>
              <Text heading="4" as="h2" margin="0">Products Sold</Text>
              <Separator />
              <div class="sales-orders">
                <EmptyState
                  v-if="!data.orders.length"
                  emoji="🍃"
                  :title="SALES_DETAIL.EMPTY_SOLD_TITLE"
                  :description="SALES_DETAIL.EMPTY_SOLD_DESCRIPTION"
                  margin="80px 0"
                >
                </EmptyState>
                <div v-else class="sales-order" v-for="order in data.orders">
                  <div>{{ order.name }}</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Column>
      </Row>
    </template>
  </Container>

  <!-- Dialog Delete -->
  <Dialog v-model="dialogDelete" :title="`Delete ${data?.name}?`">
    <Text body="large" textAlign="center" margin="0">
      Currently there's no order on this sales yet, delete it?
    </Text>
    <template #footer>
      <div class="dialog-actions">
        <Button color="red" full @click="mutateDelete">
          {{ isMutateDeleteLoading ? 'Loading' : 'Delete' }}
        </Button>
        <Button variant="outline" full @click="dialogDelete = false">Cancel</Button>
      </div>
    </template>
  </Dialog>

  <!-- Dialog Finish -->
  <Dialog v-model="dialogFinish" :title="`Finish ${data?.name}?`">
    <Text body="large" textAlign="center" margin="0">
      Finishing this product will finish this sales dashboard session and set the status as finished.
    </Text>
    <template #footer>
      <div class="dialog-actions">
        <Button color="green" full @click="mutateFinish">
          {{ isMutateFinishLoading ? 'Loading' : 'Finish' }}
        </Button>
        <Button variant="outline" full @click="dialogFinish = false">Cancel</Button>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss" src="@assets/_page-detail.scss" />
<style lang="scss" scoped>
.sales {
  &-products {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  &-product {
    display: flex;
    align-items: center;
    gap: 16px;

    &__image {
      width: 80px;
      height: 80px;
      background-color: var(--color-white);
      border: 1px solid rgba(46, 64, 87, 0.4);
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
    }

    &__detail {
      min-width: 0;
      flex-grow: 1;
    }
  }

  &-orders {
    max-height: 400px;
    overflow-y: auto;
  }
}

@include screen-md {
  .sales {
    &-products {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
}
</style>
