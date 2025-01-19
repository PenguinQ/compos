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
  Toolbar,
  ToolbarAction,
  ToolbarSpacer,
  ToolbarTitle,
} from '@/components';
import ComposIcon, {
  ArrowLeftShort,
  BackspaceFill,
  XCircleFill,
  PlusLarge,
  DashLarge,
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
import {
  ButtonBlock,
  OrderCard,
  ProductImage,
} from '@/views/components';

// Helpers
import { debounce, toIDR } from '@/helpers';

// Hooks
import { useSaleDashboard } from './hooks/SaleDashboard.hook';

// Constants
import GLOBAL from '@/views/constants';
import { SALE_DASHBOARD } from './constants';

// Assets
import no_image from '@assets/illustration/no_image.svg';

const {
  saleId,
  dialogFinish,
  dialogPayment,
  dialogHistory,
  controlsView,
  balance,
  detailsData,
  productsData,
  ordersData,
  orderedProducts,
  totalProductsCount,
  totalProductsPrice,
  paymentInput,
  paymentTendered,
  paymentChange,
  isDetailsLoading,
  isDetailsError,
  isProductsError,
  isProductsLoading,
  isOrdersError,
  isOrdersLoading,
  isMutateFinishLoading,
  handleClickDecrement,
  handleClickIncrement,
  handleClickQuantityDecrement,
  handleClickBackspace,
  handleClickCalculator,
  handleClickCancel,
  handleClickClear,
  handlePayment,
  handleShowOrderHistory,
  productsRefetch,
  ordersRefetch,
  mutateFinish,
} = useSaleDashboard();

const handleResize = debounce(() => {
  if (window.innerWidth >= 992) {
    dialogPayment.value = false;
    dialogHistory.value = false;
  } else {
    if (
        controlsView.value === 'order-default' && orderedProducts.value.length ||
        controlsView.value === 'order-payment' && !dialogPayment.value
      ) {
      dialogPayment.value = true;
      dialogHistory.value = false;
    } else if (controlsView.value === 'order-history' && !dialogHistory.value) {
      dialogPayment.value = false;
      dialogHistory.value = true;
    }
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
        @click="dialogFinish = true"
      >
        <ComposIcon :icon="CheckLarge" :size="32" />
      </ToolbarAction>
    </Toolbar>
  </Header>

  <!-- Content -->
  <Content>
    <div class="dashboard">
      <!-- Products -->
      <div class="dashboard-content">
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
        <template v-else>
          <Bar v-if="isProductsLoading" />
          <Card v-else class="products-card">
            <CardBody padding="0">
              <div
                v-for="product of productsData?.products"
                :class="`product${product.active ? '' : ' product--inactive'}`"
              >
                <ProductImage class="product-image">
                  <img v-if="!product.images.length" :src="no_image" :alt="`${product.name} image`">
                  <img v-else v-for="image of product.images" :src="image ? image : no_image" :alt="`${product.name} image`">
                </ProductImage>
                <div class="product-content">
                  <div class="product-content__main">
                    <div class="product-details">
                      <Text class="text-truncate" heading="5">{{ product.name }}</Text>
                      <div class="product-info">
                        <div class="product-info__item">
                          <ComposIcon :icon="Tag" />
                          <span class="text-truncate">{{ product.priceFormatted }}</span>
                        </div>
                        <div v-if="!product.items" class="product-info__item">
                          <ComposIcon :icon="Boxes" />
                          <span>{{ product.stock }}</span>
                        </div>
                        <div class="product-info__item">
                          <ComposIcon :icon="CartPlus" />
                          <span>{{ product.quantity }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="product-actions">
                      <ButtonBlock
                        :disabled="!product.active"
                        backgroundColor="var(--color-red-4)"
                        @click="handleClickDecrement(product)"
                      >
                        <ComposIcon :icon="DashLarge" />
                      </ButtonBlock>
                      <ButtonBlock
                        :disabled="!product.active"
                        backgroundColor="var(--color-blue-4)"
                        @click="handleClickIncrement(product)"
                      >
                        <ComposIcon :icon="PlusLarge" />
                      </ButtonBlock>
                    </div>
                  </div>
                  <div v-if="product.items" class="product-content__additional">
                    <div class="product-bundle-details">
                      <div v-for="item of product.items" class="product-bundle-info">
                        <span class="product-bundle-info__item" style="flex-shrink: 1;">
                          <ComposIcon :icon="Box" />
                          <span class="text-truncate">{{ item.name }}</span>
                        </span>
                        <span class="product-bundle-info__item">
                          <ComposIcon :icon="Boxes" />
                          <span>{{ item.stock }}</span>
                        </span>
                        <span class="product-bundle-info__item">
                          <ComposIcon :icon="CartPlus" />
                          <span>{{ item.quantity }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </template>
      </div>

      <!-- Controls -->
      <div class="dashboard-control">
        <Card v-if="controlsView !== 'order-payment'" class="order-card">
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
                    v-if="!ordersData.orders.length"
                    :emoji="SALE_DASHBOARD.ORDER_LIST_EMPTY_EMOJI"
                    :title="SALE_DASHBOARD.ORDER_LIST_EMPTY_TITLE"
                    :description="SALE_DASHBOARD.ORDER_LIST_EMPTY_DESCRIPTION"
                    height="100%"
                  />
                  <div v-else class="order-list">
                    <OrderCard
                      v-for="order of ordersData.orders"
                      :title="order.name"
                      :total="order.totalFormatted"
                      :tendered="order.tenderedFormatted"
                      :change="order.changeFormatted"
                      :products="order.products"
                    />
                  </div>
                </template>
              </template>
            </template>
            <template v-else>
              <EmptyState
                v-if="!orderedProducts.length"
                :emoji="SALE_DASHBOARD.ORDER_ITEMS_EMPTY_EMOJI"
                :title="SALE_DASHBOARD.ORDER_ITEMS_EMPTY_TITLE"
                :description="SALE_DASHBOARD.ORDER_ITEMS_EMPTY_DESCRIPTION"
                height="100%"
              />
              <div v-else class="order-products-list">
                <div v-for="product of orderedProducts" class="order-product">
                  <ProductImage class="product-image">
                    <img v-if="!product.images.length" :src="no_image" :alt="`${product.name} image`">
                    <img v-else v-for="image of product.images" :src="image ? image : no_image" :alt="`${product.name} image`">
                  </ProductImage>
                  <div class="order-product-content">
                    <Text class="text-truncate" heading="6" margin="0 0 4px">{{ product.name }}</Text>
                    <div class="order-product-details">
                      <div class="order-product-details__item">
                        <ComposIcon :icon="Tags" />
                        <span class="text-truncate">
                          {{ toIDR(product.price.times(product.amount).toString()) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <QuantityEditor
                    class="order-product__quantity"
                    small
                    readonly
                    v-model.number="product.amount"
                    :step="product.quantity"
                    :max="product.stock"
                    @clickDecrement="handleClickQuantityDecrement($event, product.id)"
                  />
                </div>
              </div>
            </template>
          </CardBody>
        </Card>
        <Card class="order-details-card">
          <CardBody>
            <div class="order-details-container">
              <template v-if="controlsView === 'order-default'">
                <dl class="order-details-summary">
                  <div class="order-details-summary__item">
                    <dt>Total Item</dt>
                    <dd>{{ totalProductsCount }}</dd>
                  </div>
                  <div class="order-details-summary__item">
                    <dt>Total</dt>
                    <dd>{{ toIDR(totalProductsPrice.toString()) }}</dd>
                  </div>
                  <div v-if="balance.current" class="order-details-summary__item">
                    <dt>Balance</dt>
                    <dd>{{ toIDR(balance.current) }}</dd>
                  </div>
                </dl>
              </template>
              <template v-if="controlsView === 'order-payment'">
                <dl class="order-details-summary">
                  <div class="order-details-summary__item">
                    <dt>Total Item</dt>
                    <dd>{{ totalProductsCount }}</dd>
                  </div>
                  <div class="order-details-summary__item">
                    <dt>Total</dt>
                    <dd>{{ toIDR(totalProductsPrice.toString()) }}</dd>
                  </div>
                  <div class="order-details-summary__item">
                    <dt>Payment Amount</dt>
                    <dd>{{ toIDR(paymentTendered.toString()) }}</dd>
                  </div>
                  <div v-if="balance.current" class="order-details-summary__item">
                    <dt>Balance</dt>
                    <dd>{{ toIDR(balance.current) }}</dd>
                  </div>
                  <div class="order-details-summary__item order-details-summary__item--change">
                    <dt>
                      <ComposIcon :icon="CashCoin" />
                      Change
                    </dt>
                    <dd>{{ toIDR(paymentChange.toString()) }}</dd>
                  </div>
                </dl>
                <div class="order-details-calculator">
                  <div class="order-details-calculator__display">
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
                  <div class="order-details-calculator__buttons">
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
          <Button full :disabled="!totalProductsCount" @click="dialogPayment = true">
            <ComposIcon :icon="Cash" style="margin-right: 8px;" />
            Pay ({{ totalProductsCount }})
          </Button>
          <Button icon @click="dialogHistory = true">
            <ComposIcon :icon="ClockHistory" />
          </Button>
        </div>
      </div>
    </div>
  </Content>

  <!-- Dialog Finish -->
  <Dialog v-model="dialogFinish" :title="`Finish ${detailsData?.name}?`">
    <Text body="large" textAlign="center" margin="0">
      Finishing this product will finish this dashboard session, set the status as finished and redirect to the sale detail page.
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

  <!-- Dialog Payment on Mobile View -->
  <Dialog
    class="dialog-payment"
    v-model="dialogPayment"
    title="Pay"
    fullscreen
  >
    <div class="dialog-payment-container">
      <template v-if="controlsView === 'order-default'">
        <EmptyState
          v-if="!orderedProducts.length"
          :emoji="SALE_DASHBOARD.ORDER_ITEMS_EMPTY_EMOJI"
          :title="SALE_DASHBOARD.ORDER_ITEMS_EMPTY_TITLE"
          :description="SALE_DASHBOARD.ORDER_ITEMS_EMPTY_DESCRIPTION"
          height="100%"
        />
        <div v-else class="order-products-list">
          <div v-for="product of orderedProducts" class="order-product">
            <ProductImage class="product-image">
              <img v-if="!product.images.length" :src="no_image" :alt="`${product.name} image`">
              <img v-else v-for="image of product.images" :src="image ? image : no_image" :alt="`${product.name} image`">
            </ProductImage>
            <div class="order-product-content">
              <Text heading="6" margin="0 0 4px">{{ product.name }}</Text>
              <div class="order-product-details">
                <div class="order-product-details__item">
                  <ComposIcon :icon="Tags" />
                  <span class="text-truncate">
                    {{ toIDR(product.price.times(product.amount).toString()) }}
                  </span>
                </div>
              </div>
            </div>
            <QuantityEditor
              class="order-product__quantity"
              small
              readonly
              v-model.number="product.amount"
              :step="product.quantity"
              :max="product.stock"
              @clickDecrement="handleClickQuantityDecrement($event, product.id)"
            />
          </div>
        </div>
      </template>
      <template v-if="controlsView === 'order-default'">
        <dl class="order-details-summary">
          <div class="order-details-summary__item">
            <dt>Total Item</dt>
            <dd>{{ totalProductsCount }}</dd>
          </div>
          <div class="order-details-summary__item">
            <dt>Total</dt>
            <dd>{{ toIDR(totalProductsPrice.toString()) }}</dd>
          </div>
          <div v-if="balance.current" class="order-details-summary__item">
            <dt>Balance</dt>
            <dd>{{ toIDR(balance.current) }}</dd>
          </div>
        </dl>
      </template>
      <template v-if="controlsView === 'order-payment'">
        <dl class="order-details-summary">
          <div class="order-details-summary__item">
            <dt>Total Item</dt>
            <dd>{{ totalProductsCount }}</dd>
          </div>
          <div class="order-details-summary__item">
            <dt>Total</dt>
            <dd>{{ toIDR(totalProductsPrice.toString()) }}</dd>
          </div>
          <div class="order-details-summary__item">
            <dt>Payment Amount</dt>
            <dd>{{ toIDR(paymentTendered.toString()) }}</dd>
          </div>
          <div v-if="balance.current" class="order-details-summary__item">
            <dt>Balance</dt>
            <dd>{{ toIDR(balance.current) }}</dd>
          </div>
          <div class="order-details-summary__item order-details-summary__item--change">
            <dt>
              <ComposIcon :icon="CashCoin" />
              Change
            </dt>
            <dd>{{ toIDR(paymentChange.toString()) }}</dd>
          </div>
        </dl>
        <div class="order-details-calculator">
          <div class="order-details-calculator__display">
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
          <div class="order-details-calculator__buttons">
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
  </Dialog>

  <!-- Dialog Order History on Mobile View -->
  <Dialog
    class="dialog-history"
    v-model="dialogHistory"
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
          v-if="!ordersData.orders.length"
          :emoji="SALE_DASHBOARD.ORDER_LIST_EMPTY_EMOJI"
          :title="SALE_DASHBOARD.ORDER_LIST_EMPTY_TITLE"
          :description="SALE_DASHBOARD.ORDER_LIST_EMPTY_DESCRIPTION"
          height="100%"
        />
        <div v-else class="order-list">
          <OrderCard
            v-for="order of ordersData.orders"
            :title="order.name"
            :total="order.totalFormatted"
            :tendered="order.tenderedFormatted"
            :change="order.changeFormatted"
            :products="order.products"
          />
        </div>
      </template>
    </template>
  </Dialog>
</template>

<style lang="scss" scoped>
.cp-page {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  contain: layout;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
}

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

.order-card {
  display: none;
  flex-direction: column;

  .cp-card__header {
    flex-shrink: 0;
    border-bottom: 1px solid var(--color-border);
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

.order-product {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;

  .vc-product-image {
    width: 60px;
    height: 60px;
    flex: 0 0 auto;

    img {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  &-content {
    min-width: 0%;
    flex-grow: 1;
  }

  &-details {
    &__item {
      @include text-body-sm;
      display: flex;
      align-items: center;
      gap: 4px;

      compos-icon {
        width: 16px;
        height: 16px;
      }
    }
  }

  &__details {
    flex-grow: 1;
  }

  &__name {
    @include text-body-lg;
    font-family: var(--text-heading-family);
    font-weight: 600;
    margin-bottom: 4px;
  }
}

.order-list {
  min-height: 100%;
  background-color: var(--color-neutral-1);
  padding: 16px;

  .vc-order-card {
    margin-top: 16px;

    &:first-of-type {
      margin-top: 0;
    }
  }
}

.order-details-card {
  flex: 1 0 auto;
  display: none;

  .cp-card__body {
    height: 100%;
    padding: 0;
  }
}

.order-details-container {
  height: inherit;
  display: flex;
  flex-direction: column;

  > *:first-child {
    flex-grow: 1;
  }
}

.order-details-summary {
  border-bottom: 1px solid var(--color-border);
  overflow: auto;
  padding: 16px;
  margin: 0;

  &__item {
    @include text-body-lg;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    overflow-x: auto;
    overflow-y: hidden;

    &:last-of-type {
      margin-bottom: 0;
    }

    &--change {
      color: var(--color-white);
      background-color: var(--color-green-5);
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

.order-details-calculator {
  border-bottom: 1px solid var(--color-border);

  &__display {
    font-size: 24px;
    line-height: 28px;
    text-align: right;
    border-bottom: 1px solid var(--color-neutral-2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px;

    button {
      cursor: pointer;
      flex-shrink: 0;
    }

    div {
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
      @include text-body-lg;
      color: var(--color-black);
      background-color: var(--color-white);
      border: 1px solid var(--color-neutral-4);
      border-radius: 4px;
      cursor: pointer;
      padding: 16px;
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

.dialog-payment {
  .cp-dialog-body {
    flex-grow: 1;
    padding: 0;
  }
}

.dialog-history {
  .cp-dialog-body {
    flex-grow: 1;
    padding: 0;
  }
}

.dialog-payment-container {
  height: 100%;
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;

  .order-products-list {
    overflow: auto;
  }

  .order-details-summary {
    border-top: 1px solid var(--color-border);

    &:first-child {
      border-top: none;
    }
  }
}

.products-card {
  max-height: 100%;
  border-right: none;
  border-left: none;
  border-radius: 0;
  overflow-y: auto;
}

.product {
  display: flex;
  gap: 16px;
  align-items: center;
  background-color: var(--color-white);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding-top: 16px;
  padding-bottom: 16px;
  -webkit-padding-inline-start: 16px;
  padding-inline-start: 16px;
  -webkit-padding-inline-end: 16px;
  padding-inline-end: 16px;
  margin-top: -1px;

  &:first-of-type {
    border-top-color: transparent;
    margin-top: 0;
  }

  &:last-of-type {
    border-bottom-color: transparent;
  }

  &--inactive {
    filter: grayscale(1);
  }

  &-image {
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    align-self: flex-start;

    img {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  &-content {
    min-width: 0%;
    flex: 1 1 auto;

    &__main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    &__additional {
      border-top: 1px solid var(--color-border);
      padding-top: 16px;
      margin-top: 16px;
    }
  }

  &-details {
    min-width: 0%;
    flex: 1;
  }

  &-info {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;

    &__item {
      @include text-body-sm;
      min-width: 0%;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;

      compos-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
    }
  }

  &-bundle-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;

    &:first-of-type {
      margin-top: 0;
    }

    &__item {
      @include text-body-sm;
      min-width: 0%;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;

      compos-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
    }
  }

  &-actions {
    overflow: hidden;
    border-radius: 8px;
    flex: 0 0 auto;

    .vc-button-block {
      width: 40px;
      height: 40px;
    }
  }
}

@include screen-sm {
  .product {
    &-info {
      align-items: center;
      flex-direction: row;
      gap: 12px;
    }

    &-actions {
      .vc-button-block {
        width: 50px;
        height: 50px;
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

  .products-card {
    border-radius: 8px;
  }

  .product {
    &-image {
      width: 80px;
      height: 80px;
    }

    &-actions {
      border-radius: 12px;

      .vc-button-block {
        width: 60px;
        height: 60px;
      }
    }
  }

  .order-card {
    display: flex;
  }

  .order-details-card {
    display: block;

    &--mobile {
      display: none;
    }
  }
}
</style>
