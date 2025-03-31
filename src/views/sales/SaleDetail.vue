<script setup lang="ts">
import { watch, ref } from 'vue';
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
  Dialog,
  EmptyState,
  Label,
  PullToRefresh,
  Text,
  Toolbar,
  ToolbarAction,
  ToolbarSpacer,
  ToolbarTitle,
  TabControl,
  TabControls,
  TabPanel,
  TabPanels
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
import { OrderCard, ProductListItem } from '@/views/components';

// Hooks
import { useSaleDetail } from './hooks/SaleDetail.hook';

// Constants
import GLOBAL from '@/views/constants';
import { SALE_DETAIL } from './constants';

const router = useRouter();
const {
  saleId,
  data,
  dialog,
  cancelDetail,
  isError,
  isLoading,
  isMutateCancelOrderFnLoading,
  isMutateDeleteLoading,
  isMutateFinishLoading,
  refetch,
  mutateCancelOrderFn,
  mutateDelete,
  mutateFinish,
  handleCancelOrder,
  handleRefresh,
} = useSaleDetail();
const tab = ref(0);

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
        <ToolbarAction icon backgroundColor="var(--color-red-4)" @click="dialog.delete = true">
          <ComposIcon :icon="Trash" />
        </ToolbarAction>
        <ToolbarAction v-if="!data.finished" icon backgroundColor="var(--color-green-4)" @click="dialog.finish = true">
          <ComposIcon :icon="CheckLarge" :size="32" />
        </ToolbarAction>
      </template>
      <template #extension>
        <TabControls v-model="tab" grow>
          <TabControl title="Details" />
          <TabControl title="Products" />
          <TabControl title="Orders" />
        </TabControls>
      </template>
    </Toolbar>
  </Header>
  <Content>
    <template #fixed>
      <PullToRefresh @refresh="handleRefresh" />
    </template>
    <EmptyState
      v-if="isError"
      :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
      :title="GLOBAL.ERROR_EMPTY_TITLE"
      :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
      height="100%"
    >
      <template #action>
        <Button @click="refetch">Try Again</Button>
      </template>
    </EmptyState>
    <template v-else>
      <Bar v-if="isLoading" margin="56px 0" />
      <TabPanels v-else v-model="tab">
        <TabPanel>
          <Container class="page-container">
            <div class="sale-summaries">
              <Text heading="2" margin="0 0 8px">
                {{ data.name }}
                <Label :color="data.finished ? undefined : 'green'" style="vertical-align: middle;">
                  {{ data.finished ? 'Finished' : 'Running' }}
                </Label>
              </Text>
              <Text body="small" margin="0 0 16px">Last update: {{ data.updatedAt || '-' }}</Text>
              <Row :col="{ default: 2, md: 3 }" gutter="16px">
                <Column>
                  <Card class="info-card" data-emoji="🌿">
                    <CardBody>
                      <div class="info-card__title">Initial Balance</div>
                      <div class="info-card__value">{{ data.initialBalanceFormatted || '-' }}</div>
                    </CardBody>
                  </Card>
                </Column>
                <Column>
                  <Card class="info-card" data-emoji="🌱">
                    <CardBody>
                      <div class="info-card__title">Final Balance</div>
                      <div class="info-card__value">{{ data.finalBalanceFormatted || '-' }}</div>
                    </CardBody>
                  </Card>
                </Column>
                <Column>
                  <Card class="info-card" data-emoji="💰">
                    <CardBody>
                      <div class="info-card__title">Revenue</div>
                      <div class="info-card__value">{{ data.revenueFormatted || '-' }}</div>
                    </CardBody>
                  </Card>
                </Column>
              </Row>
            </div>
            <Card class="section-card" variant="outline">
              <CardHeader>
                <CardTitle>Products Sold</CardTitle>
              </CardHeader>
              <CardBody padding="0">
                <div class="products-sold">
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
          </Container>
        </TabPanel>
        <TabPanel>
          <div class="product-list">
            <ProductListItem
              :key="`sale-product-${index}`"
              v-for="(product, index) of data.products"
              :active="product.active"
              :name="product.name"
            >
              <template #details>
                <div class="product-list-details">
                  <div class="product-list-details__item">
                    <ComposIcon :icon="Tag" />
                    {{ product.priceFormatted }}
                  </div>
                  <div class="product-list-details__item">
                    <ComposIcon :icon="CartPlus" />
                    {{ product.quantity }}
                  </div>
                </div>
                <div v-if="product.items" class="product-list-items">
                  <div
                    v-for="(item, index) of product.items"
                    :key="index"
                    class="product-list-items__item"
                  >
                    <div class="product-list-items__detail">
                      <ComposIcon :icon="Box" />
                      {{ item.name }}
                    </div>
                    <div class="product-list-items__detail">
                      <ComposIcon :icon="CartPlus" />
                      {{ item.quantity }}
                    </div>
                  </div>
                </div>
              </template>
            </ProductListItem>
          </div>
        </TabPanel>
        <TabPanel>
          <EmptyState
            v-if="!data.orders.length"
            :emoji="SALE_DETAIL.EMPTY_ORDER_EMOJI"
            :title="SALE_DETAIL.EMPTY_ORDER_TITLE"
            :description="SALE_DETAIL.EMPTY_ORDER_DESCRIPTION"
            margin="80px 0"
          />
          <div v-else class="order-list">
            <Row :col="{ default: 1, md: 2 }">
              <Column v-for="order in data.orders" :key="`order-${order.id}`">
                <OrderCard
                  :canceled="order.canceled"
                  :title="order.name"
                  :total="order.totalFormatted"
                  :tendered="order.tenderedFormatted"
                  :change="order.changeFormatted"
                  :products="order.products"
                  v-on="!data.finished && !order.canceled ? { cancel  : () => handleCancelOrder(order.id, order.name) } : {}"
                />
              </Column>
            </Row>
          </div>
        </TabPanel>
      </TabPanels>
    </template>
  </Content>

  <!-- Dialog Delete Sale -->
  <Dialog v-model="dialog.delete" :title="`Delete ${data?.name}?`">
    <Text body="large" textAlign="center" margin="0">
      Currently there's no order on this sale yet, delete it?
    </Text>
    <template #footer>
      <div class="dialog-actions">
        <Button color="red" full @click="mutateDelete">
          {{ isMutateDeleteLoading ? 'Loading' : 'Delete' }}
        </Button>
        <Button variant="outline" full @click="dialog.delete = false">Cancel</Button>
      </div>
    </template>
  </Dialog>

  <!-- Dialog Finish Sale -->
  <Dialog v-model="dialog.finish" :title="`Finish ${data?.name}?`">
    <Text body="large" textAlign="center" margin="0">
      Finishing this product will finish this sale and set the status as finished.
    </Text>
    <template #footer>
      <div class="dialog-actions">
        <Button color="green" full @click="mutateFinish">
          {{ isMutateFinishLoading ? 'Loading' : 'Finish' }}
        </Button>
        <Button variant="outline" full @click="dialog.finish = false">Cancel</Button>
      </div>
    </template>
  </Dialog>

  <!-- Dialog Cancel Order -->
  <Dialog
    v-model="dialog.cancel"
    :title="`Cancel ${cancelDetail.name}?`"
    @leave="() => {
      cancelDetail.id   = '';
      cancelDetail.name = '';
    }"
  >
    <Text body="large" textAlign="center" margin="0">
      Canceling this order will mark the order as canceled and return used balance.
    </Text>
    <template #footer>
      <div class="dialog-actions">
        <Button
          full
          color="red"
          @click="mutateCancelOrderFn({ id: cancelDetail.id, name: cancelDetail.name })"
        >
          {{ isMutateCancelOrderFnLoading ? 'Loading' : `Cancel ${cancelDetail.name}` }}
        </Button>
        <Button variant="outline" full @click="dialog.cancel = false">Cancel</Button>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss" src="@/assets/page-detail.scss" />
<style lang="scss" scoped>
.sale-summaries {
  padding: 0 16px;
  margin-bottom: 24px;
}

.info-card {
  position: relative;

  &::after {
    content: attr(data-emoji);
    font-size: 64px;
    line-height: 1;
    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate(12%, 12%);
  }

  .cp-card__body {
    padding: 8px 12px;
  }

  &__title {
    @include text-body-sm;
    font-family: var(--text-heading-family);
    font-weight: 600;
    border-bottom: 2px solid var(--color-green-4);
    display: inline-block;
    padding-right: 16px;
    padding-bottom: 8px;
    margin-bottom: 16px;
  }

  &__value {
    font-family: var(--text-heading-family);
    font-size: 1.5rem;
    line-height: 1.6;
    font-weight: 600;
  }

  &__background {
    font-size: 64px;
    position: absolute;
    bottom: 0;
    right: 0;
    opacity: 0.6;
    transform: translate(12%, 12%);
  }
}

.product-list {
  .vc-pli {
    &:last-of-type {
      border-color: var(--color-border);
    }
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

    &__item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;

      &:first-of-type {
        margin-top: 0;
      }

    }

    &__detail {
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

.products-sold {
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

.order-list {
  padding: 16px;
}

@include screen-md {
  .sale-summaries {
    padding: 0;
  }
}
</style>
