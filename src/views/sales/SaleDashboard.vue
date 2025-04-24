<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

// Common Components
import {
  Header,
  Content,
  Bar,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dialog,
  EmptyState,
  QuantityEditor,
  Text,
  Select,
  Toolbar,
  ToolbarAction,
  ToolbarSpacer,
  ToolbarTitle,
} from '@/components';
import ComposIcon, {
  ArrowLeftShort,
  BackspaceFill,
  XCircleFill,
  Cash,
  CashCoin,
  ClockHistory,
  Tag,
  CartPlus,
  Box,
  Boxes,
  Tags,
  CheckLarge,
  InfoCircleFill,
} from '@/components/Icons';

// View Components
import { OrderCard, ProductListItem } from '@/views/components';
import SaleProductDetails from './components/SaleProductDetails.vue'

// Helpers
import { debounce, toIDR } from '@/helpers';

// Hooks
import { useSaleDashboard } from './hooks/SaleDashboard.hook';

// Constants
import GLOBAL from '@/views/constants';
import { SALE_DASHBOARD } from './constants';

const {
  saleId,
  dialog,
  controlsView,
  balance,
  detailsData,
  products,
  orderedProducts,
  sortedOrderedProducts,
  ordersData,
  orderNote,
  orderNotes,
  totalProductsCount,
  totalProductsPrice,
  paymentInput,
  paymentTendered,
  paymentChange,
  cancelDetail,
  isDetailsLoading,
  isDetailsError,
  isProductsError,
  isProductsLoading,
  isOrdersError,
  isOrdersLoading,
  isMutateFinishLoading,
  handleCancelOrder,
  handleClickBackspace,
  handleClickCalculator,
  handleClickCancel,
  handleClickClear,
  handlePayment,
  handleShowOrderHistory,
  handleSortOrder,
  productsRefetch,
  ordersRefetch,
  mutateCancelOrderFn,
  mutateFinish,
} = useSaleDashboard();

const handleResize = debounce(() => {
  if (window.innerWidth >= 992) {
    dialog.payment     = false;
    dialog.history     = false;
  } else {
    controlsView.value = 'order-default';
  }
}, 200);

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <Header>
    <Toolbar>
      <ToolbarAction icon @click="$router.push('/sale')">
        <ComposIcon :icon="ArrowLeftShort" size="40" />
      </ToolbarAction>
      <ToolbarTitle>{{ isDetailsLoading ? 'Sale Dashboard' : `${detailsData?.name} Dashboard` }}</ToolbarTitle>
      <ToolbarSpacer />
      <ToolbarAction
        v-if="!isDetailsError && !isDetailsLoading"
        icon
        @click="$router.push(`/sale/detail/${saleId}`)"
      >
        <ComposIcon :icon="InfoCircleFill" />
      </ToolbarAction>
      <ToolbarAction
        v-if="!isDetailsError && !isDetailsLoading"
        icon
        backgroundColor="var(--color-green-4)"
        @click="dialog.finish = true"
      >
        <ComposIcon :icon="CheckLarge" :size="32" />
      </ToolbarAction>
    </Toolbar>
  </Header>
  <Content>
    <div class="dashboard">
      <!-- Content -->
      <div class="dashboard-content">
        <Bar v-if="isProductsLoading" />
        <template v-else>
          <EmptyState
            v-if="isProductsError"
            :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
            :title="GLOBAL.ERROR_EMPTY_TITLE"
            :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
            margin="56px 0"
          >
            <template #action>
              <Button @click="productsRefetch">Try Again</Button>
            </template>
          </EmptyState>
          <Card v-else class="product-list-card">
            <CardBody padding="0">
              <ProductListItem
                v-for="product in products"
                :key="`product-${product.id}`"
                :active="product.active"
                :images="product.images"
              >
                <template #details>
                  <Text class="text-truncate" heading="5" truncate margin="0 0 8px">{{ product.name }}</Text>
                  <SaleProductDetails
                    :items="[
                      {
                        icon: Tag,
                        value: product.priceFormatted,
                      },
                      ...(!product.items ? [{
                        icon: Boxes,
                        value: product.stock
                      }] : []),
                      {
                        icon: CartPlus,
                        value: product.quantity,
                      },
                    ]"
                  />
                </template>
                <template #additionals>
                  <div v-if="product.items" class="bundle-items">
                    <SaleProductDetails
                      v-for="(item, index) in product.items"
                      :key="`${product.id}-item-${index}`"
                      direction="horizontal"
                      :items="[
                        {
                          icon: Box,
                          value: item.name,
                          truncate: true,
                        },
                        {
                          icon: Boxes,
                          value: item.stock,
                        },
                        {
                          icon: CartPlus,
                          value: item.quantity,
                        },
                      ]"
                    />
                  </div>
                </template>
                <template #extensions>
                  <QuantityEditor
                    v-model="product.amount"
                    :step="product.quantity"
                    :max="product.stock"
                    :disabled="!product.active"
                    @clickIncrement="handleSortOrder(product.id)"
                    @clickDecrement="handleSortOrder(product.id)"
                  />
                </template>
              </ProductListItem>
            </CardBody>
          </Card>
        </template>
      </div>

      <!-- Controls -->
      <div class="dashboard-control">
        <Card v-if="controlsView !== 'order-payment'" class="order-list-card">
          <CardHeader>
            <CardTitle>
              Order
              <button class="button button--icon" type="button" @click="handleShowOrderHistory">
                <ComposIcon :icon="ClockHistory" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <template v-if="controlsView === 'order-history'">
              <EmptyState
                v-if="isOrdersError"
                :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
                :title="GLOBAL.ERROR_EMPTY_TITLE"
                :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
                height="100%"
              >
                <template #action>
                  <Button @click="ordersRefetch">Try Again</Button>
                </template>
              </EmptyState>
              <template v-else>
                <Bar v-if="isOrdersLoading" />
                <template v-else>
                  <EmptyState
                    v-if="!ordersData?.orders.length"
                    :emoji="SALE_DASHBOARD.ORDER_LIST_EMPTY_EMOJI"
                    :title="SALE_DASHBOARD.ORDER_LIST_EMPTY_TITLE"
                    :description="SALE_DASHBOARD.ORDER_LIST_EMPTY_DESCRIPTION"
                    height="100%"
                  />
                  <div v-else class="order-list">
                    <OrderCard
                      v-for="order of ordersData.orders"
                      :key="`order-${order.id}`"
                      :canceled="order.canceled"
                      :title="order.name"
                      :total="order.totalFormatted"
                      :tendered="order.tenderedFormatted"
                      :change="order.changeFormatted"
                      :products="order.products"
                      :note="order.note"
                      v-on="!order.canceled ? { cancel  : () => handleCancelOrder(order.id, order.name) } : {}"
                    />
                  </div>
                </template>
              </template>
            </template>
            <template v-else>
              <EmptyState
                v-if="!sortedOrderedProducts.length"
                :emoji="SALE_DASHBOARD.ORDER_ITEMS_EMPTY_EMOJI"
                :title="SALE_DASHBOARD.ORDER_ITEMS_EMPTY_TITLE"
                :description="SALE_DASHBOARD.ORDER_ITEMS_EMPTY_DESCRIPTION"
                height="100%"
                margin="0 16px"
              />
              <div v-else class="order-product-list">
                <ProductListItem
                  v-for="product in sortedOrderedProducts"
                  :key="`order-product-${product.id}`"
                  :images="product.images"
                  :name="product.name"
                >
                  <template #details>
                    <SaleProductDetails
                      :items="[
                        {
                          icon: Tags,
                          value: toIDR(product.price.times(product.amount).toString()),
                        },
                      ]"
                    />
                  </template>
                  <template #extensions>
                    <QuantityEditor
                      v-model="product.amount"
                      :step="product.quantity"
                      :max="product.stock"
                      size="small"
                      @clickIncrement="handleSortOrder(product.id)"
                      @clickDecrement="handleSortOrder(product.id)"
                    />
                  </template>
                </ProductListItem>
              </div>
            </template>
          </CardBody>
        </Card>
        <Card class="order-details-card">
          <CardBody>
            <div class="order-details-container">
              <template v-if="controlsView === 'order-default'">
                <div v-if="orderNotes.length" class="order-note">
                  <Select v-model="orderNote" size="small">
                    <option value="">Select Order Note (Optional)</option>
                    <option v-for="note in orderNotes" :value="note">{{ note }}</option>
                  </Select>
                </div>
                <dl class="order-summaries">
                  <div class="order-summaries__item">
                    <dt>Total Item</dt>
                    <dd>{{ totalProductsCount }}</dd>
                  </div>
                  <div class="order-summaries__item">
                    <dt>Total</dt>
                    <dd>{{ toIDR(totalProductsPrice.toString()) }}</dd>
                  </div>
                  <div v-if="balance.current" class="order-summaries__item">
                    <dt>Balance</dt>
                    <dd>{{ toIDR(balance.current) }}</dd>
                  </div>
                </dl>
              </template>
              <template v-if="controlsView === 'order-payment'">
                <dl class="order-summaries">
                  <div class="order-summaries__item">
                    <dt>Total Item</dt>
                    <dd>{{ totalProductsCount }}</dd>
                  </div>
                  <div class="order-summaries__item">
                    <dt>Total</dt>
                    <dd>{{ toIDR(totalProductsPrice.toString()) }}</dd>
                  </div>
                  <div class="order-summaries__item">
                    <dt>Payment Amount</dt>
                    <dd>{{ toIDR(paymentTendered.toString()) }}</dd>
                  </div>
                  <div v-if="balance.current" class="order-summaries__item">
                    <dt>Balance</dt>
                    <dd>{{ toIDR(balance.current) }}</dd>
                  </div>
                  <div class="order-summaries__item order-summaries__item--change">
                    <dt>
                      <ComposIcon :icon="CashCoin" />
                      Change
                    </dt>
                    <dd>{{ toIDR(paymentChange.toString()) }}</dd>
                  </div>
                </dl>
                <div class="order-calculator">
                  <div class="order-calculator__display">
                    <button
                      v-if="paymentInput !== '0'"
                      type="button"
                      class="button button--icon"
                      aria-label="Clear calculator"
                      @click="paymentInput = '0'"
                    >
                      <ComposIcon :icon="XCircleFill" />
                    </button>
                    <div>{{ toIDR(paymentTendered.toString()) }}</div>
                    <button
                      v-if="paymentInput !== '0'"
                      type="button"
                      class="button button--icon"
                      aria-label="Backspace"
                      @click="handleClickBackspace"
                    >
                      <ComposIcon :icon="BackspaceFill" />
                    </button>
                  </div>
                  <div class="order-calculator__buttons">
                    <button type="button" @click="handleClickCalculator('1')">1</button>
                    <button type="button" @click="handleClickCalculator('2')">2</button>
                    <button type="button" @click="handleClickCalculator('3')">3</button>
                    <button type="button" @click="handleClickCalculator('4')">4</button>
                    <button type="button" @click="handleClickCalculator('5')">5</button>
                    <button type="button" @click="handleClickCalculator('6')">6</button>
                    <button type="button" @click="handleClickCalculator('7')">7</button>
                    <button type="button" @click="handleClickCalculator('8')">8</button>
                    <button type="button" @click="handleClickCalculator('9')">9</button>
                    <button type="button" @click="handleClickCalculator('0')">0</button>
                    <button type="button" @click="handleClickCalculator('00')">00</button>
                    <button type="button" @click="handleClickCalculator('000')">000</button>
                  </div>
                </div>
              </template>
              <div class="dashboard-actions">
                <template v-if="controlsView === 'order-default'">
                  <Button full color="red" variant="outline" @click="handleClickClear">Clear</Button>
                  <Button full :disabled="!orderedProducts.length" @click="controlsView = 'order-payment'">Pay</Button>
                </template>
                <template v-if="controlsView === 'order-payment'">
                  <Button full color="red" variant="outline" @click="handleClickCancel" small>Cancel</Button>
                  <Button color="green" full @click="handlePayment">Confirm</Button>
                </template>
                <template v-if="controlsView === 'order-history'">
                  <Button full color="red" variant="outline" @click="controlsView = 'order-default'" small>Back</Button>
                </template>
              </div>
            </div>
          </CardBody>
        </Card>
        <div class="dashboard-actions-mobile">
          <Button full :disabled="!totalProductsCount" @click="dialog.payment = true">
            <ComposIcon :icon="Cash" style="margin-right: 8px;" />
            Pay ({{ totalProductsCount }})
          </Button>
          <Button icon @click="dialog.history = true">
            <ComposIcon :icon="ClockHistory" />
          </Button>
        </div>
      </div>
    </div>
  </Content>

  <!-- Dialog Payment Detail (Mobile View) -->
  <Dialog
    class="dialog-payment"
    v-model="dialog.payment"
    title="Pay"
    fullscreen
  >
    <div class="dialog-payment-container">
      <template v-if="controlsView === 'order-default'">
        <EmptyState
          v-if="!sortedOrderedProducts.length"
          :emoji="SALE_DASHBOARD.ORDER_ITEMS_EMPTY_EMOJI"
          :title="SALE_DASHBOARD.ORDER_ITEMS_EMPTY_TITLE"
          :description="SALE_DASHBOARD.ORDER_ITEMS_EMPTY_DESCRIPTION"
          height="100%"
        />
        <div v-else class="order-product-list">
          <ProductListItem
            v-for="product in sortedOrderedProducts"
            :key="`dialog-order-product-${product.id}`"
            :images="product.images"
            imageWidth="60px"
            imageHeight="60px"
            :name="product.name"
          >
            <template #details>
              <SaleProductDetails
                :items="[
                  {
                    icon: Tags,
                    value: toIDR(product.price.times(product.amount).toString()),
                  },
                ]"
              />
            </template>
            <template #extensions>
              <QuantityEditor
                v-model="product.amount"
                :step="product.quantity"
                :max="product.stock"
                size="small"
                @clickIncrement="handleSortOrder(product.id)"
                @clickDecrement="handleSortOrder(product.id)"
              />
            </template>
          </ProductListItem>
        </div>
      </template>
      <div class="order-details-container">
        <template v-if="controlsView === 'order-default'">
          <div v-if="orderNotes.length" class="order-note">
            <Select v-model="orderNote" size="small">
              <option value="">Select Order Note (Optional)</option>
              <option v-for="note in orderNotes" :value="note">{{ note }}</option>
            </Select>
          </div>
          <dl class="order-summaries">
            <div class="order-summaries__item">
              <dt>Total Item</dt>
              <dd>{{ totalProductsCount }}</dd>
            </div>
            <div class="order-summaries__item">
              <dt>Total</dt>
              <dd>{{ toIDR(totalProductsPrice.toString()) }}</dd>
            </div>
            <div v-if="balance.current" class="order-summaries__item">
              <dt>Balance</dt>
              <dd>{{ toIDR(balance.current) }}</dd>
            </div>
          </dl>
        </template>
        <template v-if="controlsView === 'order-payment'">
          <dl class="order-summaries">
            <div class="order-summaries__item">
              <dt>Total Item</dt>
              <dd>{{ totalProductsCount }}</dd>
            </div>
            <div class="order-summaries__item">
              <dt>Total</dt>
              <dd>{{ toIDR(totalProductsPrice.toString()) }}</dd>
            </div>
            <div class="order-summaries__item">
              <dt>Payment Amount</dt>
              <dd>{{ toIDR(paymentTendered.toString()) }}</dd>
            </div>
            <div v-if="balance.current" class="order-summaries__item">
              <dt>Balance</dt>
              <dd>{{ toIDR(balance.current) }}</dd>
            </div>
            <div class="order-summaries__item order-summaries__item--change">
              <dt>
                <ComposIcon :icon="CashCoin" />
                Change
              </dt>
              <dd>{{ toIDR(paymentChange.toString()) }}</dd>
            </div>
          </dl>
          <div class="order-calculator">
            <div class="order-calculator__display">
              <button
                v-if="paymentInput !== '0'"
                type="button"
                class="button button--icon"
                aria-label="Clear calculator"
                @click="paymentInput = '0'"
              >
                <ComposIcon :icon="XCircleFill" />
              </button>
              <div>{{ toIDR(paymentTendered.toString()) }}</div>
              <button
                v-if="paymentInput !== '0'"
                type="button"
                class="button button--icon"
                aria-label="Backspace"
                @click="handleClickBackspace"
              >
                <ComposIcon :icon="BackspaceFill" />
              </button>
            </div>
            <div class="order-calculator__buttons">
              <button type="button" @click="handleClickCalculator('1')">1</button>
              <button type="button" @click="handleClickCalculator('2')">2</button>
              <button type="button" @click="handleClickCalculator('3')">3</button>
              <button type="button" @click="handleClickCalculator('4')">4</button>
              <button type="button" @click="handleClickCalculator('5')">5</button>
              <button type="button" @click="handleClickCalculator('6')">6</button>
              <button type="button" @click="handleClickCalculator('7')">7</button>
              <button type="button" @click="handleClickCalculator('8')">8</button>
              <button type="button" @click="handleClickCalculator('9')">9</button>
              <button type="button" @click="handleClickCalculator('0')">0</button>
              <button type="button" @click="handleClickCalculator('00')">00</button>
              <button type="button" @click="handleClickCalculator('000')">000</button>
            </div>
          </div>
        </template>
        <div class="dashboard-actions">
          <template v-if="controlsView === 'order-default'">
            <Button full color="red" variant="outline" @click="handleClickClear">Clear</Button>
            <Button full :disabled="!orderedProducts.length" @click="controlsView = 'order-payment'">Pay</Button>
          </template>
          <template v-if="controlsView === 'order-payment'">
            <Button full color="red" variant="outline" @click="handleClickCancel" small>Cancel</Button>
            <Button color="green" full @click="handlePayment">Confirm</Button>
          </template>
          <template v-if="controlsView === 'order-history'">
            <Button full color="red" variant="outline" @click="controlsView = 'order-default'" small>Back</Button>
          </template>
        </div>
      </div>
    </div>
  </Dialog>

  <!-- Dialog Order History (Mobile View) -->
  <Dialog
    class="dialog-history"
    v-model="dialog.history"
    title="Order History"
    fullscreen
  >
    <EmptyState
      v-if="isOrdersError"
      :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
      :title="GLOBAL.ERROR_EMPTY_TITLE"
      :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
      height="100%"
    >
      <template #action>
        <Button @click="ordersRefetch">Try Again</Button>
      </template>
    </EmptyState>
    <template v-else>
      <Bar v-if="isOrdersLoading" />
      <template v-else>
        <EmptyState
          v-if="!ordersData?.orders.length"
          :emoji="SALE_DASHBOARD.ORDER_LIST_EMPTY_EMOJI"
          :title="SALE_DASHBOARD.ORDER_LIST_EMPTY_TITLE"
          :description="SALE_DASHBOARD.ORDER_LIST_EMPTY_DESCRIPTION"
          height="100%"
        />
        <div v-else class="order-list">
          <OrderCard
            v-for="order of ordersData.orders"
            :key="`dialog-order-${order.id}`"
            :canceled="order.canceled"
            :title="order.name"
            :total="order.totalFormatted"
            :tendered="order.tenderedFormatted"
            :change="order.changeFormatted"
            :products="order.products"
            :note="order.note"
            @cancel="handleCancelOrder(order.id, order.name)"
            v-on="!order.canceled ? { cancel  : () => handleCancelOrder(order.id, order.name) } : {}"
          />
        </div>
      </template>
    </template>
  </Dialog>

  <!-- Dialog Finish Sale -->
  <Dialog v-model="dialog.finish" :title="`Finish ${detailsData?.name}?`">
    <Text body="large" textAlign="center" margin="0">
      Finishing this product will finish this dashboard session, set the status as finished and redirect to the sale detail page.
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
      Canceling this order will mark the order as canceled and return any used balance.
    </Text>
    <template #footer>
      <div class="dialog-actions">
        <Button color="green" full @click="mutateCancelOrderFn({ id: cancelDetail.id, name: cancelDetail.name })">
          {{ isMutateFinishLoading ? 'Loading' : `Cancel ${cancelDetail.name}` }}
        </Button>
        <Button variant="outline" full @click="dialog.cancel = false">Cancel</Button>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss" scoped>
.dashboard {
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto;
  grid-template-columns: 1fr;
  padding: 0;

  &-content {
    overflow-y: auto;
    padding-top: 16px;
    padding-bottom: 8px;
  }

  &-control {
    display: grid;
    grid-template-rows: 1fr;
    gap: 16px;
    padding-top: 8px;
    padding-bottom: 16px;
  }

  &-actions {
    display: flex;
    align-items: start;
    gap: 16px;
    padding: 16px;

    &-mobile {
      display: flex;
      align-items: center;
      gap: 16px;
      -webkit-padding-inline-start: 16px;
      padding-inline-start: 16px;
      -webkit-padding-inline-end: 16px;
      padding-inline-end: 16px;
    }
  }
}

.product {
  &-list-card {
    max-height: 100%;
    border-right: none;
    border-left: none;
    border-radius: 0;
    overflow-y: auto;

    :deep() {
      .vc-product-image {
        width: 60px;
        height: 60px;
      }
    }
  }
}

.bundle {
  &-items {
    border-top: 1px solid var(--color-neutral-2);
    padding-top: 16px;
    margin-top: 16px;

    .details {
      align-items: center;
      flex-direction: row;
      gap: 12px;

      &__item:first-of-type {
        flex-shrink: 1;
      }
    }
  }
}

.order {
  &-list-card {
    display: none;
    flex-direction: column;

    .cp-card__header {
      flex-shrink: 0;
      border-bottom: 1px solid var(--color-neutral-2);
    }

    .cp-card__title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .cp-card__body {
      flex-grow: 1;
      overflow: auto;
      padding: 0;
    }
  }

  &-list {
    min-height: 100%;
    background-color: var(--color-neutral-1);
    padding: 16px;

    .vc-odc {
      margin-bottom: 16px;

      &:last-of-type {
        margin-bottom: 0;
      }
    }
  }

  &-product-list {
    padding: 6px 0;

    :deep() {
      .vc-pli {
        border-bottom: none;
        padding-top: 6px;
        padding-bottom: 6px;
      }

      .vc-product-image {
        width: 60px;
        height: 60px;
      }
    }
  }

  &-details {
    &-card {
      flex: 1 0 auto;
      display: none;

      .cp-card__body {
        height: 100%;
        padding: 0;
      }
    }

    &-container {
      min-height: 0;
      height: 100%;
      display: grid;
      grid-template-rows: 1fr;

      > * {
        min-width: 0;
        border-top: 1px solid var(--color-neutral-2);

        &:only-child {
          border-top: none;
        }
      }
    }
  }

  &-note {
    padding: 16px;
  }

  &-summaries {
    overflow: auto;
    padding: 16px;
    margin: 0;

    &__item {
      @include text-body-md;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      overflow-x: auto;
      overflow-y: hidden;
      margin-bottom: 12px;

      &:last-of-type {
        margin-bottom: 0;
      }

      &--change {
        color: var(--color-white);
        background-color: var(--color-blue-4);
        margin-left: -16px;
        margin-right: -16px;
        padding-top: 8px;
        padding-bottom: 8px;
        padding-inline-start: 16px;
        padding-inline-end: 16px;
      }

      dt {
        white-space: nowrap;
        text-overflow: ellipsis;
        display: flex;
        align-items: center;
        gap: 8px;
        overflow: hidden;
        flex: 0 0 auto;

        compos-icon {
          flex-shrink: 0;
        }
      }

      dd {
        font-weight: 600;
        margin: 0;
      }
    }
  }

  &-calculator {
    &__display {
      font-size: 20px;
      line-height: 1.5;
      font-weight: 600;
      text-align: right;
      background-color: var(--color-neutral-1);
      border-bottom: 1px solid var(--color-neutral-2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 16px;

      button {
        cursor: pointer;
        flex-shrink: 0;

        compos-icon {
          width: 20px;
          height: 20px;
        }
      }

      div {
        white-space: nowrap;
        text-align: right;
        overflow-y: hidden;
        flex-grow: 1;
      }
    }

    &__buttons {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      padding: 16px;

      button {
        color: var(--color-black);
        @include text-body-md;
        font-weight: 600;
        background-color: var(--color-white);
        border: 1px solid var(--color-neutral-4);
        border-radius: 4px;
        cursor: pointer;
        padding: 8px;
        transition-property: transform;
        transition-duration: var(--transition-duration-very-fast);
        transition-timing-function: var(--transition-timing-function);
        outline: none;

        &:active {
          transform: scale(0.95);
        }
      }
    }
  }
}

.dialog {
  &-payment,
  &-history {
    :deep() {
      .cp-dialog-body {
        flex-grow: 1;
        padding: 0;
      }
    }
  }

  &-payment {
    &-container {
      height: 100%;
      display: grid;
      grid-template-rows: 1fr;
      grid-template-columns: 1fr;

      .order-products-list {
        overflow: auto;
      }

      .order-summaries {
        border-top: 1px solid var(--color-neutral-2);

        &:first-child {
          border-top: none;
        }
      }
    }

    .order-product-list {
      overflow: auto;
    }
  }
}

@include screen-sm {
  .details {
    align-items: center;
    flex-direction: row;
    gap: 12px;
  }

  .order {
    &-calculator {
      &__display {
        font-size: 24px;
        padding: 16px;

        button compos-icon {
          width: 24px;
          height: 24px;
        }
      }

      &__buttons button {
        @include text-body-lg;
        padding: 12px;
      }
    }
  }
};

@include screen-lg {
  .dashboard {
    grid-template-rows: 100%;
    grid-template-columns: 1fr 35%;

    &-content {
      padding-top: 16px;
      padding-bottom: 16px;
      -webkit-padding-inline-start: 16px;
      padding-inline-start: 16px;
      -webkit-padding-inline-end: 8px;
      padding-inline-end: 8px;
    }

    &-control {
      padding-top: 16px;
      padding-bottom: 16px;
      -webkit-padding-inline-start: 8px;
      padding-inline-start: 8px;
      -webkit-padding-inline-end: 16px;
      padding-inline-end: 16px;
    }

    &-actions {
      &-mobile {
        display: none;
      }
    }
  }

  .product {
    &-list-card {
      border-radius: 8px;

      :deep() {
        .vc-product-image {
          width: 80px;
          height: 80px;
        }
      }
    }
  }

  .order {
    &-list-card {
      display: flex;
    }

    &-details {
      &-card {
        display: block;
      }

      &-container {
        > *:first-child {
          border-top: none;
        }
      }
    }
  }
}
</style>
