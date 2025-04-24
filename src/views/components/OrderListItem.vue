<script setup lang="ts">
// Commpon Components
import { Card, CardBody, Label, Text } from '@/components';
import ComposIcon, { Box, Cash, CashCoin, Receipt, XLarge } from '@/components/Icons';

type OrderCardProduct = {
  name: string;
  quantity: number;
};

type OrderCard = {
  canceled: boolean;
  change: string;
  id?: string;
  products: OrderCardProduct[];
  title: string;
  total: string;
  tendered: string;
  onCancel?: Function;
  note?: string;
};

withDefaults(defineProps<OrderCard>(), {
  canceled: false,
});

/**
 * --------
 * Glossary
 * --------
 * vc  = view component
 * odc = order card
 */
</script>

<template>
<Card class="vc-odc">
  <CardBody padding="12px 16px">
    <Text class="vc-odc__name" heading="6" margin="0">
      {{ title }}
      <Label v-if="canceled" color="red" variant="outline">Canceled</Label>
    </Text>
    <div class="vc-odc-details">
      <div class="vc-odc-details__item">
        <ComposIcon :icon="Receipt" />
        <span>{{ total }}</span>
      </div>
      <div class="vc-odc-details__item">
        <ComposIcon :icon="Cash" />
        <span>{{ tendered }}</span>
      </div>
      <div class="vc-odc-details__item">
        <ComposIcon :icon="CashCoin" />
        <span>{{ change }}</span>
      </div>
    </div>
    <div class="vc-odc-products">
      <div v-for="product of products" class="vc-odc-products__item">
        <ComposIcon :icon="Box" />
        {{ product.quantity }}&times; {{ product.name }}
      </div>
    </div>
    <Text v-if="note" class="vc-odc__note" body="small" margin="12px 0 0">{{ note }}</Text>
    <button
      v-if="onCancel"
      type="button"
      class="vc-odc__remove button button--icon"
      @click="$emit('cancel')"
    >
      <ComposIcon :icon="XLarge" :size="16" />
    </button>
  </CardBody>
</Card>
</template>

<style lang="scss">
.vc-odc {
  overflow: unset;

  .cp-card__body {
    position: relative;
  }

  &__name {
    position: relative;

    .cp-label {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
    }
  }

  &-details {
    border-top: 1px solid var(--color-neutral-2);
    border-bottom: 1px solid var(--color-neutral-2);
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    position: relative;
    padding-top: 12px;
    padding-bottom: 12px;
    margin-bottom: 12px;
    margin-top: 12px;

    &__item {
      @include text-body-sm;
      display: flex;
      align-items: center;
      flex: 1 1 auto;
      gap: 8px;

      &,
      & > * {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      compos-icon {
        flex-shrink: 0;
      }
    }
  }

  &-products {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 8px;

    &__item {
      @include text-body-sm;
      display: flex;

      compos-icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        flex-shrink: 0;
      }
    }
  }

  &__note {
    border-top: 1px solid var(--color-neutral-2);
    padding-top: 12px;
  }

  &__remove {
    color: var(--color-white);
    background-color: var(--color-red-4);
    border-radius: 4px;
    position: absolute;
    top: -6px;
    right: -6px;
    padding: 4px;
  }
}
</style>
