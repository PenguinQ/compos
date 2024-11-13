<script setup lang="ts">
import ComposIcon from '@/components/Icons';

type Props = {
  active?: boolean;
  icon?: string;
  title: string;
};

defineProps<Props>()
</script>

<template>
  <button class="cp-bottom-navbar-button" type="button" :data-cp-active="active ? true : undefined">
    <div class="cp-bottom-navbar-button__wrapper">
      <ComposIcon :icon="icon" :size="20" />
      {{ title }}
    </div>
  </button>
</template>

<style lang="scss">
.cp-bottom-navbar-button {
  flex: 1;
  color: var(--color-white);
  font-size: var(--text-body-small-size);
  line-height: var(--text-body-small-height);
  font-weight: 400;
  background-color: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 12px 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:focus {
    outline: 2px dashed var(--color-blue);
    outline-offset: 4px;
  }

  &::before {
    content: "";
    width: 0;
    height: 2px;
    position: absolute;
    top: 0;
    background-color: var(--color-white);
    transition: width var(--transition-duration-very-fast) var(--transition-timing-function);
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
  }

  compos-icon {
    color: var(--color-white);
  }

  &[data-cp-active] {
    &::before {
      width: 100%;
    }
  }
}
</style>
