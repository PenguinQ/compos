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
  Tag,
  CartPlus,
  Box,
  Boxes,
  Tags,
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
  goBacktoSales,
  handleClickDecrement,
  handleClickIncrement,
  handleClickQuantityDecrement,
  handleClickCalculator,
  handleClickCancel,
  handleClickClear,
  handlePayment,
  handleShowOrderHistory,
} = useSalesDashboard();
</script>

<template>
  <div class="cp-page">
    <Toolbar>
      <ToolbarAction icon @click="goBacktoSales">
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
            <div class="product-contents">
              <Text heading="5">{{ product.name }}</Text>
              <div class="product-details">
                <div class="product-details__item">
                  <ComposIcon :icon="Tag" />
                  {{ product.price_formatted }}
                </div>
                <div v-if="!product.items" class="product-details__item">
                  <ComposIcon :icon="Boxes" />
                  {{ product.stock }}
                </div>
                <div v-if="!product.items" class="product-details__item">
                  <ComposIcon :icon="CartPlus" />
                  {{ product.quantity }}
                </div>
              </div>
              <div v-if="product.items" class="product-bundle">
                <div v-for="item of product.items" class="product-bundle-details">
                  <span class="product-bundle-details__item">
                    <ComposIcon :icon="Box" />
                    {{ item.name }}
                  </span>
                  <span class="product-bundle-details__item">
                    <ComposIcon :icon="Boxes" />
                    {{ item.stock }}
                  </span>
                  <span class="product-bundle-details__item">
                    <ComposIcon :icon="CartPlus" />
                    {{ item.quantity }}
                  </span>
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
              <div class="order-product-list">
                <div v-for="product of orderedProducts" class="order-product">
                  <ProductImage>
                    <img :src="product.image ? product.image : no_image" :alt="`${product.name} image`" />
                  </ProductImage>
                  <div class="order-product-contents">
                    <Text heading="6" margin="0 0 4px">{{ product.name }}</Text>
                    <div class="order-product-details">
                      <div class="order-product-details__item order-product-details__item--price">
                        <ComposIcon :icon="Tags" />
                        {{ toIDR(product.price * product.amount) }}
                      </div>
                    </div>
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
                  <dd>{{ toIDR(totalProductsPrice.toString()) }}</dd>
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
              <pre>
                {{ ordersData }}
              </pre>
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
    align-self: flex-start;

    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  &-contents {
    flex: 1 1 auto;
  }

  &-details {
    display: flex;
    align-items: center;
    gap: 16px;

    &__item {
      display: flex;
      align-items: center;

      compos-icon {
        width: 20px;
        height: 20px;
        margin-right: 8px;
      }
    }
  }

  &-bundle {
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
        font-size: var(--text-body-small-size);
        line-height: var(--text-body-small-height);
        display: flex;
        align-items: center;

        compos-icon {
          width: 16px;
          height: 16px;
          margin-right: 8px;
        }
      }
    }
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
