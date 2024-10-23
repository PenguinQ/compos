<script setup lang="ts">
import { computed, inject, reactive, ref, onMounted } from 'vue';

// Common Components
import Content from '@components/Content';
import Button from '@components/Button';
import Card from '@components/Card';
import EmptyState from '@components/EmptyState';
import Text from '@components/Text';
import QuantityEditor from '@components/QuantityEditor';
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import ComposIcon, {
  ArrowLeftShort,
  XCircleFilled,
  List,
  PlusLarge,
  DashLarge,
  CashCoin,
  BoxSeam,
  ClockHistory,
} from '@components/Icons';

// View Components
import ProductImage from '@/views/components/ProductImage.vue';
import ButtonBlock from '@/views/components/ButtonBlock.vue';

// Helpers
import { toIDR } from '@/helpers';

// Assets
import no_image from '@assets/illustration/no_image.svg';

// Hooks
import { useSalesDashboard } from './hooks/SalesDashboard.hook';

const {
  controlsView,
  detailsData,
  productsData,
  orderedProducts,
  totalProductsCount,
  totalProductsPrice,
  paymentAmountChange,
  paymentAmountInt,
  paymentAmountStr,
  isDetailsLoading,
  isDetailsError,
  isProductsError,
  isProductsLoading,
  isOrdersError,
  isOrdersLoading,
  handleClickDecrement,
  handleClickIncrement,
  handleClickQuantityDecrement,
  handleClickCalculator,
  handleClickCancel,
  handleClickClear,
  handlePayment,
} = useSalesDashboard();

type ProductList = {
  id: string;
  image: string;
  name: string;
  price: number;
  stock: number;
};

type OrderItem = {
  id: string;
  image: string;
  name: string;
  price: number;
  amount: number;
};
</script>

<template>
  <div class="cp-page">
    <Toolbar>
      <ToolbarAction icon @click="">
        <ComposIcon :icon="ArrowLeftShort" size="40" />
      </ToolbarAction>
      <ToolbarTitle>{{ isDetailsLoading ? '' : detailsData.name }}</ToolbarTitle>
    </Toolbar>
    <Content>
      <div class="dashboard">
        <!-- Products -->
        <div class="dashboard-content">
          <div v-if="isProductsLoading">Loading</div>
          <div
            v-else
            v-for="product of productsData?.products"
            :class="`product${product.active ? '' : ' product--inactive'}`"
          >
            <ProductImage class="product-image">
              <img :src="product.image ? product.image : no_image" :alt="`${product.name} image`" />
            </ProductImage>
            <div class="product-content">
              <Text class="product__name" heading="5">{{ product.name }}</Text>
              <div class="product__details">
                <span>Price: {{ product.price }}</span>&nbsp;|&nbsp;
                <span>Stock: {{ product.stock }}</span>&nbsp;|&nbsp;
                <span>Quantity: {{ product.quantity }}</span>
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
        </div>

        <!-- Controls -->
        <div class="dashboard-control">
          <div class="dashboard-control-header">
            <Text heading="5" margin="0">{{ controlsView === 'order-history' ? 'Order History' : 'Order'  }}</Text>
            <button class="button button--icon" type="button" @click="controlsView = 'order-history'">
              <ComposIcon :icon="ClockHistory" />
            </button>
          </div>
          <div class="dashboard-control-body">
            <template v-if="controlsView === 'order-default'">
              <div class="order-product-list">
                <div v-for="product of orderedProducts" class="order-product">
                  <ProductImage>
                    <img :src="product.image ? product.image : no_image" :alt="`${product.name} image`" />
                  </ProductImage>
                  <div class="order-product__details">
                    <div class="order-product__name">{{ product.name }}</div>
                    <div class="order-product__total">Total: {{ product.price }}</div>
                  </div>
                  <QuantityEditor
                    class="order-product__quantity"
                    small
                    readonly
                    v-model.number="product.amount"
                    :max="product.stock"
                    :step="product.quantity"
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
                  <dd>{{ toIDR(totalProductsPrice) }}</dd>
                </div>
              </dl>
            </template>
            <template v-if="controlsView === 'order-payment'">
              <dl class="order-summary">
                <div class="order-summary-item">
                  <dt>Total Item</dt>
                  <dd>{{ totalProductsCount }}</dd>
                </div>
                <div class="order-summary-item">
                  <dt>Total</dt>
                  <dd>{{ toIDR(totalProductsPrice) }}</dd>
                </div>
                <div class="order-summary-item">
                  <dt>Payment Amount</dt>
                  <dd>{{ toIDR(paymentAmountInt) }}</dd>
                </div>
                <div class="order-summary-item order-summary-item--change">
                  <dt>
                    <ComposIcon :icon="CashCoin" />
                    Change
                  </dt>
                  <dd>{{ toIDR(paymentAmountChange) }}</dd>
                </div>
              </dl>
              <div class="order-calculator">
                <div class="order-calculator__display">
                  <button
                    v-if="paymentAmountStr !== '0'"
                    type="button"
                    class="button button--icon"
                    aria-label="Clear calculator"
                    @click="paymentAmountStr = '0'"
                  >
                    <ComposIcon :icon="XCircleFilled" />
                  </button>
                  <div>{{ toIDR(paymentAmountInt) }}</div>
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
            <template v-if="controlsView === 'order-history'">
              History View
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

          <!-- <div class="sales-order-header">
            <div class="sales-order-header__title">
              Order #XXX
            </div>
            <button class="button-icon" type="button" @click="show_history = !show_history">
              <IconList />
            </button>
          </div> -->
          <!-- <div class="sales-order-body" :style="{ overflow: show_history ? 'hidden' : undefined }">
            <div v-if="!show_payment" class="order-container order-container--detail">
              <EmptyState
                v-if="!dummy_order_items.length"
                title="No item yet..."
                description="Add by clicking the product!"
              />
              <div v-else class="order-items">
                <div
                  :key="`order-item-${index}`" v-for="(item, index) of dummy_order_items"
                  class="order-item"
                >
                  <picture>
                    <img :src="item.image ? item.image : no_image" :alt="`Summary ${item.name} image`">
                  </picture>
                  <div class="sales-order-item__detail">
                    <Text body="large" fontWeight="600" truncate margin="0 0 4px">{{ item.name }}</Text>
                    <Text body="small" margin="0">{{ toIDR(item.amount * item.price) }}</Text>
                  </div>
                  <QuantityEditor
                    class="sales-order-item__quantity"
                    small
                    readonly
                    v-model.number="item.amount"
                    @onChange="handleChange(item.id, item.amount)"
                  />
                </div>
              </div>
              <dl class="order-summary">
                <div class="order-summary__item">
                  <dt>Total Item</dt>
                  <dd>{{ order_total_amount }}</dd>
                </div>
                <div class="order-summary__item">
                  <dt>Total</dt>
                  <dd>{{ toIDR(order_total_price) }}</dd>
                </div>
              </dl>
              <div class="order-actions">
                <Button color="red" variant="outline">Clear</Button>
                <Button :disabled="order_total_price ? false : true" @click="show_payment = true">Pay</Button>
                <Button @click="show_payment = true">Pay</Button>
              </div>
            </div>

            <div v-else class="order-container order-container--payment">
              <dl class="order-summary">
                <div class="order-summary__item">
                  <dt>Total Item</dt>
                  <dd>{{ order_total_amount }}</dd>
                </div>
                <div class="order-summary__item">
                  <dt>Total</dt>
                  <dd>{{ toIDR(order_total_price) }}</dd>
                </div>
                <div class="order-summary__item">
                  <dt>Payment Amount</dt>
                  <dd>{{ toIDR(payment_amount_int) }}</dd>
                </div>
                <div class="order-summary__item">
                  <dt>Change</dt>
                  <dd>{{ toIDR(payment_change) }}</dd>
                </div>
              </dl>
              <div class="order-calculator">
                <div class="order-calculator__display">
                  <button
                    v-if="payment_amount !== '0'"
                    type="button"
                    class="button-icon"
                    aria-label="Clear calculator"
                    @click="payment_amount = '0'"
                  >
                    <IconXCircleFilled />
                  </button>
                  <div>{{ toIDR(payment_amount_int) }}</div>
                </div>
                <div class="order-calculator__buttons">
                  <button type="button" @click="handleCalculatorClick('1')">1</button>
                  <button type="button" @click="handleCalculatorClick('2')">2</button>
                  <button type="button" @click="handleCalculatorClick('3')">3</button>
                  <button type="button" @click="handleCalculatorClick('4')">4</button>
                  <button type="button" @click="handleCalculatorClick('5')">5</button>
                  <button type="button" @click="handleCalculatorClick('6')">6</button>
                  <button type="button" @click="handleCalculatorClick('7')">7</button>
                  <button type="button" @click="handleCalculatorClick('8')">8</button>
                  <button type="button" @click="handleCalculatorClick('9')">9</button>
                  <button type="button" @click="handleCalculatorClick('0')">0</button>
                  <button type="button" @click="handleCalculatorClick('00')">00</button>
                  <button type="button" @click="handleCalculatorClick('000')">000</button>
                </div>
              </div>
              <div class="order-actions">
                <Button color="red" variant="outline" @click="handleCancelPayment" small>Cancel</Button>
                <Button @click="handleSubmitPayment">Pay</Button>
              </div>
            </div>

            <div v-if="show_history" class="order-container order-container--history">
              <div class="order-list">
                <EmptyState
                  v-if="!dummy_order_items.length"
                  title="No order yet..."
                  description="Add some!"
                />
              </div>
              <div class="order-actions">
                <Button color="red" variant="outline" @click="show_history = false" small>Close</Button>
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </Content>
    <!-- <div class="temp-container-view">

      <div class="sales-container">
        <div class="sales-item-wrapper">
          <div class="sales-item-grid">
            <Card
              :key="`item-${index}`" v-for="(item, index) of dummy_product_list"
              class="sales-item"
              role="button"
              tabindex="0"
              :aria-label="`Add ${item.name}`"
              clicky
              @click="handleProductClick(item)"
            >
              <picture>
                <img :src="item.image ? item.image : no_image" :alt="`${item.name} image`">
              </picture>
              <div class="sales-item__name">{{ item.name }}</div>
            </Card>
          </div>
        </div>

        <div class="sales-order">
          <div class="sales-order-header">
            <div class="sales-order-header__title">
              Order #XXX
            </div>
            <button class="button-icon" type="button" @click="show_history = !show_history">
              <IconList />
            </button>
          </div>
          <div class="sales-order-body" :style="{ overflow: show_history ? 'hidden' : undefined }">
            <div v-if="!show_payment" class="order-container order-container--detail">
              <EmptyState
                v-if="!dummy_order_items.length"
                title="No item yet..."
                description="Add by clicking the product!"
              />
              <div v-else class="order-items">
                <div
                  :key="`order-item-${index}`" v-for="(item, index) of dummy_order_items"
                  class="order-item"
                >
                  <picture>
                    <img :src="item.image ? item.image : no_image" :alt="`Summary ${item.name} image`">
                  </picture>
                  <div class="sales-order-item__detail">
                    <Text body="large" fontWeight="600" truncate margin="0 0 4px">{{ item.name }}</Text>
                    <Text body="small" margin="0">{{ toIDR(item.amount * item.price) }}</Text>
                  </div>
                  <QuantityEditor
                    class="sales-order-item__quantity"
                    small
                    readonly
                    v-model.number="item.amount"
                    @onChange="handleChange(item.id, item.amount)"
                  />
                </div>
              </div>
              <dl class="order-summary">
                <div class="order-summary__item">
                  <dt>Total Item</dt>
                  <dd>{{ order_total_amount }}</dd>
                </div>
                <div class="order-summary__item">
                  <dt>Total</dt>
                  <dd>{{ toIDR(order_total_price) }}</dd>
                </div>
              </dl>
              <div class="order-actions">
                <Button color="red" variant="outline">Clear</Button>
                <Button :disabled="order_total_price ? false : true" @click="show_payment = true">Pay</Button>
              </div>
            </div>

            <div v-else class="order-container order-container--payment">
              <dl class="order-summary">
                <div class="order-summary__item">
                  <dt>Total Item</dt>
                  <dd>{{ order_total_amount }}</dd>
                </div>
                <div class="order-summary__item">
                  <dt>Total</dt>
                  <dd>{{ toIDR(order_total_price) }}</dd>
                </div>
                <div class="order-summary__item">
                  <dt>Payment Amount</dt>
                  <dd>{{ toIDR(payment_amount_int) }}</dd>
                </div>
                <div class="order-summary__item">
                  <dt>Change</dt>
                  <dd>{{ toIDR(payment_change) }}</dd>
                </div>
              </dl>
              <div class="order-calculator">
                <div class="order-calculator__display">
                  <button
                    v-if="payment_amount !== '0'"
                    type="button"
                    class="button-icon"
                    aria-label="Clear calculator"
                    @click="payment_amount = '0'"
                  >
                    <IconXCircleFilled />
                  </button>
                  <div>{{ toIDR(payment_amount_int) }}</div>
                </div>
                <div class="order-calculator__buttons">
                  <button type="button" @click="handleCalculatorClick('1')">1</button>
                  <button type="button" @click="handleCalculatorClick('2')">2</button>
                  <button type="button" @click="handleCalculatorClick('3')">3</button>
                  <button type="button" @click="handleCalculatorClick('4')">4</button>
                  <button type="button" @click="handleCalculatorClick('5')">5</button>
                  <button type="button" @click="handleCalculatorClick('6')">6</button>
                  <button type="button" @click="handleCalculatorClick('7')">7</button>
                  <button type="button" @click="handleCalculatorClick('8')">8</button>
                  <button type="button" @click="handleCalculatorClick('9')">9</button>
                  <button type="button" @click="handleCalculatorClick('0')">0</button>
                  <button type="button" @click="handleCalculatorClick('00')">00</button>
                  <button type="button" @click="handleCalculatorClick('000')">000</button>
                </div>
              </div>
              <div class="order-actions">
                <Button color="red" variant="outline" @click="handleCancelPayment" small>Cancel</Button>
                <Button @click="handleSubmitPayment">Pay</Button>
              </div>
            </div>

            <div v-if="show_history" class="order-container order-container--history">
              <div class="order-list">
                <EmptyState
                  v-if="!dummy_order_items.length"
                  title="No order yet..."
                  description="Add some!"
                />
              </div>
              <div class="order-actions">
                <Button color="red" variant="outline" @click="show_history = false" small>Close</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div> -->
  </div>

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

.product {
  display: flex;
  gap: 16px;
  align-items: center;
  background-color: var(--color-white);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding-top: 12px;
  padding-bottom: 12px;
  -webkit-padding-inline-start: 12px;
  padding-inline-start: 12px;
  -webkit-padding-inline-end: 12px;
  padding-inline-end: 12px;
  margin-top: -1px;

  &:first-of-type {
    margin-top: 0;
  }

  &--inactive {
    filter: grayscale(1);
  }

  &-image {
    width: 50px;
    height: 50px;
    flex-shrink: 0;

    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  &-content {
    flex: 1 1 auto;
  }

  &-actions {
    overflow: hidden;
    border-radius: 8px;
    flex: 0 0 auto;

    .vc-button-block {
      width: 50px;
      height: 50px;
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

.control-actions {
  display: flex;
  gap: 12px;
}

@include screen-landscape-md {
  .dashboard {
    grid-template-rows: 100%;
    grid-template-columns: 1fr 35%;

    &-control {
      border-left: 1px solid var(--color-border);
    }
  }

  .product {
    &-image {
      width: 100px;
      height: 100px;
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

// --------------

.page-container {
  height: 100%;
}

.sales-container {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: 50% 50%;
  grid-template-columns: 1fr;
}

.sales-item-wrapper {
  overflow: auto;
  padding: 16px;
}

.sales-item-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.sales-item {
  picture {
    display: block;
    width: 100%;
    height: 120px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__name {
    font-family: var(--text-heading-family);
    font-weight: 600;
    font-size: var(--text-heading-6-size);
    line-height: var(--text-heading-6-height);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-top: 1px solid var(--color-neutral-2);
    padding: 8px 12px;
  }
}

.sales-order {
  background-color: var(--color-white);
  border-top: 1px solid var(--color-neutral-2);
  box-shadow: rgba(60, 64, 67, 0.3) 0 1px 2px 0, rgba(60, 64, 67, 0.15) 0 1px 3px 1px;
  display: flex;
  flex-direction: column;

  &-header {
    font-family: var(--text-heading-family);
    font-weight: 600;
    font-size: var(--text-heading-6-size);
    line-height: var(--text-heading-6-height);
    border-bottom: 1px solid var(--color-neutral-2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    &__title {
      padding-left: 16px;
    }

    button {
      height: 48px;
      width: 48px;
    }
  }

  &-body {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: auto;
    position: relative;
  }

  &-items {
    flex-grow: 1;
    overflow: auto;
    padding: 16px;
  }

  &-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;

    &:last-of-type {
      margin-bottom: 0;
    }

    picture {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      flex: 0 0 60px;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    &__detail {
      min-width: 0;
      flex: 1;
    }

    &__quantity {
      flex: 0 1 auto;
    }
  }
}

.order-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  &--payment {
    height: auto;

    .order-summary {
      flex-grow: 1;
      overflow-y: auto;
      border-top-color: transparent;
    }
  }

  &--history {
    // width: 100%;
    // height: 100%;
    inset: 0;
    background-color: var(--color-white);
    position: absolute;
  }
}

.order {
  &-items {
    flex-grow: 1;
    overflow: auto;
    padding: 16px;
  }

  &-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;

    &:last-of-type {
      margin-bottom: 0;
    }

    picture {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      flex: 0 0 60px;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    &__detail {
      min-width: 0;
      flex: 1;
    }

    &__quantity {
      flex: 0 1 auto;
    }
  }

  &-calculator {
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

  &-list {
    flex: 1;
    overflow-y: auto;
  }

  // &-summary {
  //   border-top: 1px solid var(--color-neutral-2);
  //   padding:16px;
  //   margin: 0;

  //   &__item {
  //     font-size: var(--text-body-medium-size);
  //     line-height: var(--text-body-medium-height);
  //     display: flex;
  //     align-items: center;
  //     justify-content: space-between;
  //     gap: 12px;
  //     margin-bottom: 12px;

  //     &:last-of-type {
  //       margin-bottom: 0;
  //     }

  //     dt {
  //       white-space: nowrap;
  //       text-overflow: ellipsis;
  //       overflow: hidden;
  //     }

  //     dd {
  //       font-weight: 600;
  //       margin: 0;
  //     }
  //   }
  // }

  &-actions {
    border-top: 1px solid var(--color-neutral-2);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;

    .cp-button {
      width: 100%;
    }
  }
}

@include screen-landscape-md {
  .sales-container {
    grid-template-rows: 100%;
    grid-template-columns: 1fr 35%;
  }

  .sales-item-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .order-container {
    &--payment {
      height: 100%;
    }
  }
}

@include screen-landscape-lg {
  .sales-container {
    grid-template-rows: 100%;
    grid-template-columns: 1fr 35%;
  }

  .sales-item-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
