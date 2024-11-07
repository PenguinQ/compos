<script setup lang="ts">
import { computed } from 'vue';

// Common Components
import Text from '@components/Text';
import Button from '@components/Button';
import QuantityEditor from '@components/QuantityEditor';
import ComposIcon, { CheckLarge, XLarge } from '@components/Icons';

// View Components
import ProductImage from '@/views/components/ProductImage.vue';

// Assets
import no_image from '@assets/illustration/no_image.svg';

type SalesProductProps = {
  type?: 'form' | 'selection';
  images?: string[];
  name: string;
  selected?: boolean;
  small?: boolean;
  variant?: boolean;
  quantity?: number;
  clickRemove?: () => void;
};

const props = withDefaults(defineProps<SalesProductProps>(), {
  images: () => [],
  selected: false,
  small: false,
  type: 'selection',
  variant: false,
});

defineEmits(['clickDecrement', 'clickIncrement']);

const classes = computed(() => ({
  'vc-sales-form-product': true,
  'vc-sales-form-product--small': props.small,
  'vc-sales-form-product--variant': props.variant,
}));
</script>

<template>
  <div :class="classes" :data-selected="selected ? true : undefined">
    <ProductImage>
      <img v-if="!images.length" :src="no_image" :alt="`${name} image`">
      <img v-else v-for="image of images" :src="image ? image : no_image" :alt="`${name} image`">
    </ProductImage>
    <div class="vc-sales-form-product__detail">
      <template v-if="type === 'form'">
        <Text heading="6" truncate margin="0 0 4px">{{ name }}</Text>
        <Text body="small" truncate margin="0">Quantity per Order: {{ quantity }}</Text>
      </template>
      <template v-else>
        <Text heading="6" truncate margin="0">{{ name }}</Text>
      </template>
    </div>
    <template v-if="type === 'form'">
      <QuantityEditor
        v-if="quantity"
        class="order-product__quantity"
        readonly
        :value="quantity"
        :min="1"
        @clickDecrement="$emit('clickDecrement', $event)"
        @clickIncrement="$emit('clickIncrement', $event)"
      />
      <Button
        v-if="$attrs.onClickRemove"
        color="red"
        icon
        :aria-label="`Remove ${name}`"
        @click="$emit('clickRemove')"
      >
        <ComposIcon :icon="XLarge" size="18" />
      </Button>
    </template>
    <ComposIcon
      v-if="selected && type === 'selection'"
      :icon="CheckLarge"
      class="sales-product__selected"
    />
  </div>
</template>

<style lang="scss">
.vc-sales-form-product {
  background-color: var(--color-white);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  margin-top: -1px;

  &:first-of-type {
    margin-top: 0;
  }

  > * {
    flex-shrink: 0;
  }

  .vc-product-image {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    display: none;
  }

  &__detail {
    min-width: 0%;
    flex: 1;
  }

  &--small {
    .vc-product-image {
      width: 60px;
      height: 60px;
      display: block;
    }
  }

  &--variant {
    background-color: var(--color-neutral-1);
    padding-left: 48px;
  }

  &[data-selected] {
    background-color: var(--color-blue-1);
  }

  &[role="button"] {
    cursor: pointer;
  }
}

@include screen-sm {
  .vc-sales-form-product {
    .vc-product-image {
      display: block;
    }
  }
}
</style>
