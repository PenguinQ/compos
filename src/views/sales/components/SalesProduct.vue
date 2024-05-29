<script setup lang="ts">
import { computed } from 'vue';

// Common Components
import Text from '@components/Text';
import Button from '@components/Button';
import { IconCheckLarge, IconXLarge } from '@components/icons';

// View Components
import ProductImage from '@/views/components/ProductImage.vue';

// Assets
import no_image from '@assets/illustration/no_image.svg';

type SalesProductProps = {
  image?: string;
  name: string;
  selected?: boolean;
  small?: boolean;
  variant?: boolean;
  clickRemove?: () => void;
};

const props = withDefaults(defineProps<SalesProductProps>(), {
  selected: false,
  small: false,
});

const classes = computed(() => ({
  'sales-product': true,
  'sales-product--small': props.small,
  'sales-product--variant': props.variant,
}));
</script>

<template>
  <div :class="classes" :data-selected="selected ? true : undefined">
    <ProductImage>
      <img :src="image ? image : no_image" :alt="`${name} image`">
    </ProductImage>
    <div class="sales-product__detail">
      <Text body="large" truncate margin="0">{{ name }}</Text>
    </div>
    <IconCheckLarge v-if="selected" class="sales-product__selected" />
    <Button
      v-if="$attrs.onClickRemove"
      class="sales-product__remove"
      color="red"
      icon
      :aria-label="`Remove ${name}`"
      @click="$emit('clickRemove')"
    >
      <IconXLarge size="18" />
    </Button>
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
