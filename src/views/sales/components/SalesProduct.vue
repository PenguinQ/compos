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

const emits = defineEmits(['clickDecrement', 'clickIncrement']);

const classes = computed(() => ({
  'sales-product': true,
  'sales-product--small': props.small,
  'sales-product--variant': props.variant,
}));
</script>

<template>
  <div :class="classes" :data-selected="selected ? true : undefined">
    <ProductImage>
      <img v-if="!images.length" :src="no_image" :alt="`${name} image`">
      <img v-else v-for="image of images" :src="image ? image : no_image" :alt="`${name} image`">
    </ProductImage>
    <div class="sales-product__detail">
      <template v-if="type === 'form'">
        <Text body="large" truncate margin="0 0 4px">{{ name }}</Text>
        <Text body="small" truncate margin="0">Quantity per Order: {{ quantity }}</Text>
      </template>
      <template v-else>
        <Text body="large" truncate margin="0">{{ name }}</Text>
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
        class="sales-product__remove"
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
.sales-product {
  background-color: var(--color-white);
  border: 1px solid var(--color-neutral-2);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;

  & + .sales-product {
    margin-top: -1px;
  }

  > * {
    flex-shrink: 0;
  }

  picture {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
  }

  &__detail {
    min-width: 0;
    flex-grow: 1;
  }

  &--small {
    .vc-product-image {
      width: 60px;
      height: 60px;
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
</style>
