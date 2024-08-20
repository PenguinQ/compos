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
import ComposIcon, { ArrowLeftShort, PencilSquare, Trash } from '@components/Icons';

// Hooks
import { useSalesDetail } from './hooks/SalesDetail.hook';

// Constants
import GLOBAL from '@/views/constants';
import { SALES_DETAIL } from './constants';

// Assets
import no_image from '@assets/illustration/no_image.svg';

const router = useRouter();
const {
  sales_id,
  dialog_delete,
  data,
  isError,
  isLoading,
  refetch,
  mutateDelete,
  mutateDeleteLoading,
} = useSalesDetail();
</script>

<template>
  <Toolbar sticky>
    <ToolbarAction icon @click="router.back">
      <ComposIcon :icon="ArrowLeftShort" size="40" />
    </ToolbarAction>
    <ToolbarTitle>Sales Detail</ToolbarTitle>
    <ToolbarSpacer />
    <ToolbarAction
      v-if="!isError && !isLoading"
      icon
      backgroundColor="var(--color-blue-4)"
      @click="router.push(`/sales/edit/${sales_id}`)"
    >
      <ComposIcon :icon="PencilSquare" />
    </ToolbarAction>
    <ToolbarAction
      v-if="!isError && !isLoading"
      icon
      backgroundColor="var(--color-red-4)"
      @click="dialog_delete = true"
    >
      <ComposIcon :icon="Trash" />
    </ToolbarAction>
  </Toolbar>
  <!--  -->
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
  <Container v-else class="pd-container">
    <template v-if="isLoading">
      Loading
    </template>
    <template v-else>
      <Row>
        <Column col="12">
          <Card class="pd-card" variant="outline">
            <CardBody>
              <Text heading="3" as="h2" margin="0">{{ data.name }}</Text>
              <hr />
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
                  <dd>{{ data.revenue || '-' }}</dd>
                </DescriptionListItem>
                <DescriptionListItem>
                  <dt>Updated At</dt>
                  <dd>{{ data.updated_at || '-' }}</dd>
                </DescriptionListItem>
              </DescriptionList>
              <hr />
              <Text heading="5" as="h3" margin="0 0 16px">Products</Text>
              <div class="sales-products">
                <div class="sales-product" v-for="product in data.products">
                  <picture class="sales-product__image">
                    <img
                      :src="product.image ? product.image : no_image"
                      :alt="`${product.name} image`"
                    />
                  </picture>
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
          <Card class="pd-card" variant="outline">
            <CardBody>
              <Text heading="4" as="h2" margin="0">Order</Text>
              <hr>
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
          <Card class="pd-card" variant="outline">
            <CardBody>
              <Text heading="4" as="h2" margin="0">Products Sold</Text>
              <hr>
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
  <!--  -->
  <Dialog v-model="dialog_delete" class="pd-dialog pd-dialog--delete" :title="`Delete ${data?.name}?`">
    <template #footer>
      <div class="pd-dialog__actions">
        <Button color="red" full @click="mutateDelete">
          {{ mutateDeleteLoading ? 'Loading' : 'Delete' }}
        </Button>
        <Button variant="outline" full @click="dialog_delete = false">Cancel</Button>
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
