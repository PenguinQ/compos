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
  handleClickCalculator,
  handleClickCancel,
  handleClickClear,
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

const dummy_product_list = reactive<ProductList[]>([
  {
    id: 'XV1',
    image: '',
    name: 'Item 1',
    price: 10000,
    stock: 1,
  },
  {
    id: 'XV2',
    image: '',
    name: 'Item 2',
    price: 20000,
    stock: 99,
  },
  {
    id: 'XV3',
    image: '',
    name: 'Item 3',
    price: 30000,
    stock: 99,
  },
]);

const toast = inject('ToastProvider');
const dummy_order_items = ref<OrderItem[]>([]);
const show_payment = ref(false);
const show_history = ref(false);
const order_total_amount = computed(() => dummy_order_items.value.reduce((acc, item) => acc += item.amount, 0));
const order_total_price = computed(() => dummy_order_items.value.reduce((acc, item) => acc += (item.amount * item.price), 0));
const payment_amount = ref('0');
const payment_amount_int = computed(() => parseInt(payment_amount.value));
const payment_change = computed(() => totalProductsPrice.value > payment_amount_int.value ? 0 : payment_amount_int.value - totalProductsPrice.value);

const currentOrders = ref([]);

onMounted(() => {

});

const handleProductClick = (product: ProductList) => {
  const { id, image, name, price } = product;
  const item = dummy_order_items.value.filter(item => item.id === id);

  if (item.length) {
    item[0].amount += 1;
  } else {
    dummy_order_items.value.push({
      id,
      image,
      name,
      price,
      amount: 1,
    });
  }
};

const handleChange = (id: string, amount: number) => {
  if (amount === 0) dummy_order_items.value = dummy_order_items.value.filter(item => item.id !== id);
};


const handleCancelPayment = () => {
  show_payment.value = false
  payment_amount.value = '0';
};

const handleSubmitPayment = () => {
  if (order_total_price.value > payment_amount_int.value) {
    // @ts-ignore
    toast.add({ message: 'Order canceled, payment amount is less than total price.', type: 'error', duration: 2000 });
  } else {
    dummy_order_items.value = [];
    payment_amount.value = '0';
    show_payment.value = false;

    // @ts-ignore
    toast.add({ message: 'Order completed.', type: 'success', duration: 2000 });
  }
};

// New Functions
const handleClickIncrement = (product: any) => {
  const { id, image, name, stock, price, quantity } = product;
  const order = orderedProducts.value.find(product => product.id === id);

  if (order) {
    if (order.amount < stock) order.amount += quantity;
  } else {
    orderedProducts.value.push({
      id,
      image,
      name,
      price,
      stock,
      amount: quantity,
      quantity,
    });
  }
};

const handleClickDecrement = (product: any) => {
  const { id, quantity } = product;
  const order = orderedProducts.value.find(product => product.id === id);

  if (order) {
    if (order.amount > 1) {
      order.amount -= quantity;
    } else {
      const filtered = orderedProducts.value.filter(product => product.id !== id);

      orderedProducts.value = filtered;
    }
  }
};

const handleQuantityDecrement = (value: string, id: string) => {
  const intValue = parseInt(value);

  if (!intValue) {
    const filtered = orderedProducts.value.filter(product => product.id !== id);

    orderedProducts.value = filtered;
  }
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
          <div v-else v-for="product of productsData?.products" class="product">
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
              <ButtonBlock backgroundColor="var(--color-red-4)" @click="handleClickDecrement(product)">
                <ComposIcon :icon="DashLarge" />
              </ButtonBlock>
              <ButtonBlock backgroundColor="var(--color-blue-4)" @click="handleClickIncrement(product)">
                <ComposIcon :icon="PlusLarge" />
              </ButtonBlock>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="dashboard-control">
          <div class="dashboard-control-header">
            <Text heading="5" margin="0">{{ controlsView === 'order-history' ? 'Order History' : 'Order'  }}</Text>
          </div>
          <div class="dashboard-control-body">
            <template v-if="controlsView === 'order-default'">
              <div class="order-product-list">
                <div v-for="product of orderedProducts" class="order-product">
                  <picture>
                    <img :src="product.image ? product.image : no_image" :alt="`${product.name} image`" />
                  </picture>
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
                    @clickDecrement="handleQuantityDecrement($event, product.id)"
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
                    class="button-icon"
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
                <Button full @click="handleSubmitPayment">Pay</Button>
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

  picture {
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
      flex: 1 0 auto;

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
