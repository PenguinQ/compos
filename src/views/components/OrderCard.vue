<script setup lang="ts">
import Text from '@components/Text';
import Card, { CardBody } from '@components/Card';
import ComposIcon, { Box, Cash, CashCoin, Receipt } from '@components/Icons';

type OrderCardProduct = {
  name: string;
  quantity: number;
};

type OrderCard = {
  title: string;
  total: string;
  tendered: string;
  change: string;
  products: OrderCardProduct[];
};

defineProps<OrderCard>()
</script>

<template>
<Card class="vc-order-card" variant="outline">
  <CardBody>
    <Text heading="6" margin="0">{{ title }}</Text>
    <div class="vc-order-card-details">
      <div class="vc-order-card-details__item">
        <ComposIcon :icon="Receipt" />
        <span>{{ total }}</span>
      </div>
      <div class="vc-order-card-details__item">
        <ComposIcon :icon="Cash" />
        <span>{{ tendered }}</span>
      </div>
      <div class="vc-order-card-details__item">
        <ComposIcon :icon="CashCoin" />
        <span>{{ change }}</span>
      </div>
    </div>
    <div class="vc-order-card-products">
      <div v-for="product of products" class="vc-order-card-products__item">
        <ComposIcon :icon="Box" />
        {{ product.quantity }}&times; {{ product.name }}
      </div>
    </div>
  </CardBody>
</Card>
</template>

<style lang="scss">
.vc-order-card {
  &-details {
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding-top: 12px;
    padding-bottom: 12px;
    margin-bottom: 12px;
    margin-top: 12px;

    &__item {
      font-size: var(--text-body-small-size);
      line-height: var(--text-body-small-height);
      display: flex;
      align-items: center;
      flex: 1;

      &,
      & > * {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      compos-icon {
        margin-right: 8px;
        flex-shrink: 0;
      }
    }
  }

  &-products {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;

    &__item {
      font-size: var(--text-body-small-size);
      line-height: var(--text-body-small-height);
      display: flex;
      align-self: center;

      compos-icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        flex-shrink: 0;
      }
    }
  }
}
</style>
