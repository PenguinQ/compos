<script setup lang="ts">
import { ArrowLeftShort } from '@icons';

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
    <div v-if="$slots.default" class="cp-navbar__items">
      <slot />
    </div>
    <div v-if="$slots.action" class="cp-navbar-actions">
      <slot name="action" />
    </div>
  </nav>
</template>

<style lang="scss">
.cp-navbar {
  --navbar-height: 56px;

  height: var(--navbar-height);
  color: var(--color-white);
  background-color: var(--color-black);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;

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
    font-size: var(--text-heading-3-size);
    line-height: var(--text-heading-3-height);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    flex-grow: 1;
    margin-top: 0;
    margin-bottom: 0;
  }

  &__items {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &-actions {
    display: flex;
    align-self: stretch;
    flex-shrink: 0;

    &:last-child {
      margin-right: -16px;
    }
  }
}

@include screen-md {
  .cp-navbar {
    &__title {
      font-size: var(--text-heading-5-size);
      line-height: var(--text-heading-5-height);
    }
  }
}
</style>
