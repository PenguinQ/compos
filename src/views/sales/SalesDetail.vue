<script setup lang="ts">
import { useRouter } from 'vue-router';

// Common Components
import { Bar } from '@components/Loader';
import Button from '@components/Button';
import Card, { CardHeader, CardBody, CardTitle } from '@components/Card';
import DescriptionList, { DescriptionListItem } from '@components/DescriptionList';
import Dialog from '@components/Dialog';
import EmptyState from '@components/EmptyState';
import Label from '@components/Label';
import Text from '@components/Text';
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import { Container, Column, Row } from '@components/Layout';
import Separator from '@components/Separator';
import ComposIcon, { ArrowLeftShort, PencilSquare, Trash, CheckLarge, Tag, LayoutSidebarReverse } from '@components/Icons';

// View Components
import { OrderCard, ProductImage } from '@/views/components';

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
      <ComposIcon :icon="ArrowLeftShort" size="40px" />
    </ToolbarAction>
    <ToolbarTitle>Sales Detail</ToolbarTitle>
    <ToolbarSpacer />
    <template v-if="!isError && !isLoading">
      <ToolbarAction v-if="!data.finished" icon @click="router.push(`/sales/dashboard/${salesId}`)">
        <ComposIcon :icon="LayoutSidebarReverse" />
      </ToolbarAction>
      <ToolbarAction v-if="!data.finished" icon backgroundColor="var(--color-blue-4)" @click="router.push(`/sales/edit/${salesId}`)">
        <ComposIcon :icon="PencilSquare" />
      </ToolbarAction>
      <ToolbarAction icon backgroundColor="var(--color-red-4)" @click="dialogDelete = true">
        <ComposIcon :icon="Trash" />
      </ToolbarAction>
      <ToolbarAction v-if="!data.finished" icon backgroundColor="var(--color-green-4)" @click="dialogFinish = true">
        <ComposIcon :icon="CheckLarge" :size="32" />
      </ToolbarAction>
    </template>
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
    <Bar v-if="isLoading" margin="56px 0" />
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
                  <dt>Initial Balance</dt>
                  <dd>{{ data.initialBalanceFormatted || '-' }}</dd>
                </DescriptionListItem>
                <DescriptionListItem>
                  <dt>Final Balance</dt>
                  <dd>{{ data.finalBalanceFormatted || '-' }}</dd>
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
                    <Text class="sales-item__name" body="large" as="h4" truncate margin="0 0 8px">
                      {{ product.name }}
                    </Text>
                    <Text class="sales-item__price" truncate margin="0">
                      <ComposIcon :icon="Tag" />
                      {{ product.priceFormatted }} {{ product.quantity }}
                    </Text>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Column>
        <Column :col="{ default: 12, md: 6 }">
          <Card class="section-card" variant="outline">
            <CardHeader>
              <CardTitle>Products Sold</CardTitle>
            </CardHeader>
            <CardBody padding="0">
              <div class="sales-products-sold">
                <EmptyState
                  v-if="!data.productsSold.length"
                  :emoji="SALES_DETAIL.EMPTY_SOLD_EMOJI"
                  :title="SALES_DETAIL.EMPTY_SOLD_TITLE"
                  :description="SALES_DETAIL.EMPTY_SOLD_DESCRIPTION"
                  margin="80px 0"
                />
                <table v-else class="sales-products-sold-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Amount</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="product of data.productsSold">
                      <tr>
                        <td>{{ product.name }}</td>
                        <td>{{ product.quantity }}</td>
                        <td>{{ product.totalFormatted }}</td>
                      </tr>
                      <template v-if="product.items">
                        <tr v-for="item of product.items" data-product-item>
                          <td colspan="3">
                            &gt; {{ item.name }}
                            (&times;{{ item.quantity }})
                          </td>
                        </tr>
                      </template>
                    </template>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Column>
        <Column :col="{ default: 12, md: 6 }">
          <Card class="section-card" variant="outline">
            <CardHeader>
              <CardTitle>Order</CardTitle>
            </CardHeader>
            <CardBody padding="0">
              <div class="sales-orders">
                <EmptyState
                  v-if="!data.orders.length"
                  :emoji="SALES_DETAIL.EMPTY_ORDER_EMOJI"
                  :title="SALES_DETAIL.EMPTY_ORDER_TITLE"
                  :description="SALES_DETAIL.EMPTY_ORDER_DESCRIPTION"
                  margin="80px 0"
                >
                </EmptyState>
                <OrderCard
                  v-else
                  v-for="order in data.orders"
                  :title="order.name"
                  :total="order.totalFormatted"
                  :tendered="order.tenderedFormatted"
                  :change="order.changeFormatted"
                  :products="order.products"
                />
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

  &-products-sold {
    max-height: 400px;
    overflow-y: auto;
    padding: 16px;

    &-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: separate;
      border-spacing: 0;

      th,
      td {
        background-color: var(--color-white);
        text-align: center;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        padding: 8px;

        &:first-of-type {
          width: 50%;
          padding-left: 0;
          text-align: left;
        }

        &:last-of-type {
          width: 30%;
          text-align: right;
          padding-right: 0;
        }
      }

      thead {
        th {
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
        }
      }

      tbody {
        tr {
          &:first-of-type {
            td {
              padding-top: 16px;
            }
          }

          &[data-product-item] {
            td {
              font-size: var(--text-body-small-size);
              line-height: var(--text-body-small-height);
              text-align: left;
            }

            td:first-of-type {
              padding-left: 8px;
            }
          }
        }
      }
    }
  }

  &-orders {
    max-height: 400px;
    background-color: var(--color-neutral-1);
    overflow-y: auto;
    padding: 16px;

    .vc-order-card {
      margin-bottom: 16px;

      &:last-of-type {
        margin-bottom: 0;
      }
    }
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
