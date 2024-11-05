<script setup lang="ts">
import { useRouter } from 'vue-router';

// Common Components
import { Bar } from '@components/Loader';
import Card, { CardBody } from '@components/Card';
import Content from '@components/Content';
import Button from '@components/Button';
import Dialog from '@components/Dialog';
import EmptyState from '@components/EmptyState';
import Text from '@components/Text';
import QuantityEditor from '@components/QuantityEditor';
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import ComposIcon, {
  ArrowLeftShort,
  XCircleFilled,
  PlusLarge,
  DashLarge,
  CashCoin,
  ClockHistory,
  Tag,
  CartPlus,
  Box,
  Boxes,
  Tags,
  CheckLarge,
  InfoCircleFilled,
} from '@components/Icons';

// View Components
import {
  ButtonBlock,
  OrderCard,
  ProductImage,
} from '@/views/components';

// Helpers
import { toIDR } from '@/helpers';

// Hooks
import { useSalesDashboard } from './hooks/SalesDashboard.hook';

// Constants
import GLOBAL from '@/views/constants';
import { SALES_DASHBOARD } from './constants';

// Assets
import no_image from '@assets/illustration/no_image.svg';

const router = useRouter();
const {
  salesId,
  dialogFinish,
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
  handleClickCalculator,
  handleClickCancel,
  handleClickClear,
  handlePayment,
  handleShowOrderHistory,
  productsRefetch,
  ordersRefetch,
  mutateFinish,
} = useSalesDashboard();
</script>

<template>
  <div class="cp-page">
    <!-- Header -->
    <Toolbar>
      <ToolbarAction icon @click="router.push('/sales')">
        <ComposIcon :icon="ArrowLeftShort" size="40" />
      </ToolbarAction>
      <ToolbarTitle>{{ isDetailsLoading ? 'Sales Dashboard' : `${detailsData?.name} Dashboard` }}</ToolbarTitle>
      <ToolbarSpacer />
      <ToolbarAction
        v-if="!isDetailsError && !isDetailsLoading"
        icon
        @click="router.push(`/sales/detail/${salesId}`)"
      >
        <ComposIcon :icon="InfoCircleFilled" />
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
            <Card v-else class="products-card" variant="outline">
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
          <div class="dashboard-control-header">
            <Text heading="5" margin="0">{{ controlsView === 'order-history' ? 'Order History' : 'Order'  }}</Text>
            <button class="button button--icon" type="button" @click="handleShowOrderHistory">
              <ComposIcon :icon="ClockHistory" />
            </button>
          </div>
          <div class="dashboard-control-body">
            <!-- Control Order Default View -->
            <template v-if="controlsView === 'order-default'">
              <EmptyState
                v-if="!orderedProducts.length"
                :emoji="SALES_DASHBOARD.ORDER_ITEMS_EMPTY_EMOJI"
                :title="SALES_DASHBOARD.ORDER_ITEMS_EMPTY_TITLE"
                :description="SALES_DASHBOARD.ORDER_ITEMS_EMPTY_DESCRIPTION"
                margin="56px 0"
              />
              <div v-else class="order-product-list">
                <div v-for="product of orderedProducts" class="order-product">
                  <ProductImage class="product-image">
                    <img v-if="!product.images.length" :src="no_image" :alt="`${product.name} image`">
                    <img v-else v-for="image of product.images" :src="image ? image : no_image" :alt="`${product.name} image`">
                  </ProductImage>
                  <div class="order-product-contents">
                    <Text heading="6" margin="0 0 4px">{{ product.name }}</Text>
                    <div class="order-product-details">
                      <div class="order-product-details__item order-product-details__item--price">
                        <ComposIcon :icon="Tags" />
                        {{ toIDR(product.price.times(product.amount).toString()) }}
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
              <dl class="order-summary">
                <div class="order-summary-item">
                  <dt>Total Item</dt>
                  <dd>{{ totalProductsCount }}</dd>
                </div>
                <div class="order-summary-item">
                  <dt>Total</dt>
                  <dd>{{ toIDR(totalProductsPrice.toString()) }}</dd>
                </div>
                <div v-if="balance.current" class="order-summary-item">
                  <dt>Balance</dt>
                  <dd>{{ toIDR(balance.current) }}</dd>
                </div>
              </dl>
            </template>
            <!-- Control Order Payment View -->
            <template v-if="controlsView === 'order-payment'">
              <dl class="order-summary">
                <div class="order-summary-item">
                  <dt>Total Item</dt>
                  <dd>{{ totalProductsCount }}</dd>
                </div>
                <div class="order-summary-item">
                  <dt>Total</dt>
                  <dd>{{ toIDR(totalProductsPrice.toString()) }}</dd>
                </div>
                <div class="order-summary-item">
                  <dt>Payment Amount</dt>
                  <dd>{{ toIDR(paymentTendered.toString()) }}</dd>
                </div>
                <div v-if="balance.current" class="order-summary-item">
                  <dt>Balance</dt>
                  <dd>{{ toIDR(balance.current) }}</dd>
                </div>
                <div class="order-summary-item order-summary-item--change">
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
                    <ComposIcon :icon="XCircleFilled" />
                  </button>
                  <div>{{ toIDR(paymentTendered.toString()) }}</div>
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
            <!-- Control Order History View -->
            <template v-if="controlsView === 'order-history'">
              <EmptyState
                v-if="isOrdersError"
                :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
                :title="GLOBAL.ERROR_EMPTY_TITLE"
                :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
                margin="56px 0"
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
                    :emoji="SALES_DASHBOARD.ORDER_LIST_EMPTY_EMOJI"
                    :title="SALES_DASHBOARD.ORDER_LIST_EMPTY_TITLE"
                    :description="SALES_DASHBOARD.ORDER_LIST_EMPTY_DESCRIPTION"
                    margin="56px 0"
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
          </div>
          <div class="dashboard-control-footer">
            <div class="control-actions">
              <template v-if="controlsView === 'order-default'">
                <Button full color="red" variant="outline" @click="handleClickClear">Clear</Button>
                <Button full @click="controlsView = 'order-payment'">Pay</Button>
              </template>
              <template v-if="controlsView === 'order-payment'">
                <Button full color="red" variant="outline" @click="handleClickCancel" small>Cancel</Button>
                <Button full @click="handlePayment">Pay</Button>
              </template>
              <template v-if="controlsView === 'order-history'">
                <Button full color="red" variant="outline" @click="controlsView = 'order-default'" small>Back</Button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Content>
  </div>

  <!-- Dialog Finish -->
  <Dialog v-model="dialogFinish" :title="`Finish ${detailsData?.name}?`">
    <Text body="large" textAlign="center" margin="0">
      Finishing this product will finish this sales dashboard session, set the status as finished and redirect to the sales detail page.
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
  grid-template-rows: 50% 50%;
  grid-template-columns: 1fr;
  gap: 16px;
  padding-top: 16px;
  padding-bottom: 16px;

  &-content {
    overflow: auto;
  }

  &-control {
    background-color: var(--color-white);
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;

    &-header {
      background-color: var(--color-white);
      border-bottom: 1px solid var(--color-border);
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &-body {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1 1 auto;
      overflow: auto;
    }

    &-footer {
      padding: 16px;
      border-top: 1px solid var(--color-border);
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
      min-width: 0%;
      font-size: var(--text-body-small-size);
      line-height: var(--text-body-small-height);
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
      min-width: 0%;
      font-size: var(--text-body-small-size);
      line-height: var(--text-body-small-height);
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

.order-product-list {
  overflow: auto;
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

  &-contents {
    flex-grow: 1;
  }

  &-details {
    &__item {
      font-family: var(--text-heading-family);
      font-size: var(--text-body-large-size);
      line-height: var(--text-body-large-height);
      font-weight: 700;
      margin-bottom: 4px;

      &:last-of-type {
        margin-bottom: 0;
      }

      compos-icon {
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }

      &--price {
        font-family: var(--text-body-family);
        font-size: var(--text-body-small-size);
        line-height: var(--text-body-small-height);
        font-weight: 400;
      }
    }
  }

  &__details {
    flex-grow: 1;
  }

  &__name {
    font-family: var(--text-heading-family);
    font-size: var(--text-body-large-size);
    line-height: var(--text-body-large-height);
    font-weight: 700;
    margin-bottom: 4px;
  }
}

// Order History List
.order-list {
  padding: 16px;
}

.order-summary {
  border-top: 1px solid var(--color-neutral-2);
  padding: 16px;
  margin: 0;
  overflow: auto;

  &-item {
    font-size: var(--text-body-large-size);
    line-height: var(--text-body-large-height);
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

// Order Calculator
.order-calculator {
  border-top: 1px solid var(--color-neutral-2);

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
      color: var(--color-black);
      font-size: var(--text-body-large-size);
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

.control-actions {
  display: flex;
  gap: 12px;
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

@include screen-landscape-md {
  .dashboard {
    grid-template-rows: 100%;
    grid-template-columns: 1fr 35%;
    -webkit-padding-inline-start: 16px;
    padding-inline-start: 16px;
    -webkit-padding-inline-end: 16px;
    padding-inline-end: 16px;

    &-control {
      border-left: 1px solid var(--color-border);
    }
  }

  .products-card {
    border-right: 1px solid var(--color-border);
    border-left: 1px solid var(--color-border);
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
}

@include screen-landscape-lg {

}
</style>
