<script setup lang="ts">
import Text from '@components/Text';
import { ArrowLeftShort, Archive } from '@icons';

type Props = {
  title: string;
  onBack?: () => void;
}

defineProps<Props>();
</script>

<template>
  <nav class="cp-navbar">
    <button
      v-if="$props.onBack"
      class="cp-navbar__back"
      type="button"
      @click="$emit('back')"
    >
      <ArrowLeftShort color="white" size="42" />
    </button>
    <h2 class="cp-navbar__title">{{ title }}</h2>
    <div v-if="$slots.default" class="cp-navbar__actions">
      <slot />
    </div>
  </nav>
</template>

<style lang="scss">
.cp-navbar {
  height: 56px;
  color: var(--color-white);
  background-color: var(--color-black);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;

  &__back {
    background-color: transparent;
    border: none;
    padding: 0;
    cursor: pointer;

    .cp-icon {
      fill: var(--color-white);
    }
  }

  &__title {
    color: inherit;
    font-size: var(--text-heading-2-size);
    line-height: var(--text-heading-2-height);
    margin-top: 0;
    margin-bottom: 0;
  }

  &__actions {
    display: flex;
    margin-left: auto;
  }

  &__action {
    color: var(--color-white);
    background-color: transparent;
    border: none;
    padding: 0;
  }
}

@include screen-md {
  .cp-navbar {
    &__title {
      font-size: var(--text-heading-4-size);
      line-height: var(--text-heading-4-height);
    }
  }
}
</style>
