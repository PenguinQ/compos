<script setup lang="ts">
import { computed, inject, reactive, ref, onMounted } from 'vue';

import Button from '@components/Button';
import Card from '@components/Card';
import EmptyState from '@components/EmptyState';
import Text from '@components/Text';
import QuantityEditor from '@components/QuantityEditor';
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import { IconArrowLeftShort, IconXCircleFilled, IconList } from '@components/icons';

import { toIDR } from '@/helpers';
import no_image from '@assets/illustration/no_image.svg';

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
const payment_change = computed(() => order_total_price.value > payment_amount_int.value ? 0 : payment_amount_int.value - order_total_price.value);

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

const handleCalculatorClick = (digit: string) =>{
  if (payment_amount.value === '0') {
    if (parseInt(digit) !== 0) {
      payment_amount.value = digit;
    }
  } else {
    payment_amount.value += digit;
  }
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
</script>

<template>
  <div class="temp-container">
    <Toolbar>
      <ToolbarAction icon @click="">
        <IconArrowLeftShort size="40" />
      </ToolbarAction>
      <ToolbarTitle>Sales XXX</ToolbarTitle>
    </Toolbar>
    <div class="temp-container-view">
      <!--  -->
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
      <!--  -->
    </div>
  </div>

</template>

<style lang="scss" scoped>
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

  &-summary {
    border-top: 1px solid var(--color-neutral-2);
    padding:16px;
    margin: 0;

    &__item {
      font-size: var(--text-body-medium-size);
      line-height: var(--text-body-medium-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;

      &:last-of-type {
        margin-bottom: 0;
      }

      dt {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      dd {
        font-weight: 600;
        margin: 0;
      }
    }
  }

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
