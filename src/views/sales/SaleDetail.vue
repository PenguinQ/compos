<script setup lang="ts">
import { watch } from 'vue';
import { useRouter } from 'vue-router';

// Common Components
import {
  Header,
  Content,
  Container,
  Row,
  Column,
  Bar,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListItem,
  Dialog,
  EmptyState,
  Label,
  Text,
  Toolbar,
  ToolbarAction,
  ToolbarSpacer,
  ToolbarTitle,
} from '@/components';
import ComposIcon, {
  Box,
  ArrowLeftShort,
  PencilSquare,
  Trash,
  CheckLarge,
  Tag,
  LayoutSidebarReverse,
  CartPlus,
} from '@/components/Icons';

// View Components
import { OrderCard, ProductImage } from '@/views/components';

// Hooks
import { useSaleDetail } from './hooks/SaleDetail.hook';

// Constants
import GLOBAL from '@/views/constants';
import { SALE_DETAIL } from './constants';

// Assets
import no_image from '@assets/illustration/no_image.svg';

const router = useRouter();
const {
  saleId,
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
} = useSaleDetail();

watch(
  data,
  (newData) => {
    const { name } = newData;

    document.title = `${name} - ComPOS`;
  },
);
</script>

<template>
  <Header>
    <Toolbar>
      <ToolbarAction icon @click="router.push('/sale')">
        <ComposIcon :icon="ArrowLeftShort" size="40px" />
      </ToolbarAction>
      <ToolbarTitle>{{ data ? data.name : 'Sale Detail' }}</ToolbarTitle>
      <ToolbarSpacer />
      <template v-if="!isError && !isLoading">
        <ToolbarAction v-if="!data.finished" icon @click="router.push(`/sale/dashboard/${saleId}`)">
          <ComposIcon :icon="LayoutSidebarReverse" />
        </ToolbarAction>
        <ToolbarAction v-if="!data.finished" icon backgroundColor="var(--color-blue-4)" @click="router.push(`/sale/edit/${saleId}`)">
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
  </Header>
  <Content>
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
              <CardHeader>
                <CardTitle>{{ data.name }}</CardTitle>
              </CardHeader>
              <CardBody>
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
              </CardBody>
            </Card>
          </Column>
          <Column col="12">
            <Card class="section-card" variant="outline">
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardBody padding="0">
                <div class="sales-products-list">
                  <div class="sales-product" v-for="product in data.products">
                    <ProductImage class="sales-product-image">
                      <img v-if="!product.images.length" :src="no_image" :alt="`${product.name} image`">
                      <img v-else v-for="image of product.images" :src="image ? image : no_image" :alt="`${product.name} image`">
                    </ProductImage>
                    <div class="sales-product-content">
                      <Text heading="6" margin="0">{{ product.name }}</Text>
                      <div class="sales-product-details">
                        <div class="sales-product-details__item">
                          <ComposIcon :icon="Tag" />
                          {{ product.priceFormatted }}
                        </div>
                        <div class="sales-product-details__item">
                          <ComposIcon :icon="CartPlus" />
                          {{ product.quantity }}
                        </div>
                      </div>
                      <div v-if="product.items" class="sales-product-items">
                        <div v-for="item of product.items" class="sales-product-items-details">
                          <div class="sales-product-items-details__item">
                            <ComposIcon :icon="Box" />
                            {{ item.name }}
                          </div>
                          <div class="sales-product-items-details__item">
                            <ComposIcon :icon="CartPlus" />
                            {{ item.quantity }}
                          </div>
                        </div>
                      </div>
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
                    :emoji="SALE_DETAIL.EMPTY_SOLD_EMOJI"
                    :title="SALE_DETAIL.EMPTY_SOLD_TITLE"
                    :description="SALE_DETAIL.EMPTY_SOLD_DESCRIPTION"
                    margin="80px 0"
                  />
                  <table v-else>
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
                <EmptyState
                  v-if="!data.orders.length"
                  :emoji="SALE_DETAIL.EMPTY_ORDER_EMOJI"
                  :title="SALE_DETAIL.EMPTY_ORDER_TITLE"
                  :description="SALE_DETAIL.EMPTY_ORDER_DESCRIPTION"
                  margin="80px 0"
                />
                <div v-else class="sales-orders-list">
                  <OrderCard
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
  </Content>
  <Dialog v-model="dialogDelete" :title="`Delete ${data?.name}?`">
    <Text body="large" textAlign="center" margin="0">
      Currently there's no order on this sale yet, delete it?
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
  <Dialog v-model="dialogFinish" :title="`Finish ${data?.name}?`">
    <Text body="large" textAlign="center" margin="0">
      Finishing this product will finish this sale and set the status as finished.
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
  &-products-list {
    max-height: 400px;
    overflow-y: auto;
  }

  &-product {
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    gap: 16px;
    padding: 16px;
    margin-top: -1px;

    &:first-of-type {
      margin-top: 0;
      border-top-color: transparent;
    }

    &:last-of-type {
      border-bottom-color: transparent;
    }

    &-image {
      width: 60px;
      height: 60px;
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

    &-content {
      min-width: 0;
      flex-grow: 1;
    }

    &-details {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;

      &__item {
        display: flex;
        align-items: center;
        gap: 8px;

        compos-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }
      }
    }

    &-items {
      display: inline-flex;
      flex-direction: column;
      border-top: 1px solid var(--color-border);
      padding-top: 12px;
      padding-inline-end: 12px;
      margin-top: 12px;

      &-details {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 8px;

        &:first-of-type {
          margin-top: 0;
        }

        &__item {
          @include text-body-sm;
          display: flex;
          align-items: center;
          gap: 8px;

          compos-icon {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
          }
        }
      }
    }
  }

  &-products-sold {
    max-height: 400px;
    overflow-y: auto;

    table {
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
          padding-left: 16px;
          text-align: left;
        }

        &:last-of-type {
          width: 30%;
          text-align: right;
          padding-right: 16px;
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
          &[data-product-item] {
            td {
              @include text-body-sm;
              text-align: left;
            }

            td:first-of-type {
              padding-left: 24px;
            }
          }

          &:first-of-type {
            td {
              padding-top: 16px;
            }
          }

          &:last-of-type {
            td {
              padding-bottom: 16px;
            }
          }
        }
      }
    }
  }

  &-orders-list {
    max-height: 400px;
    background-color: var(--color-neutral-2);
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
</style>
