<script setup lang="ts">
import { computed, ref } from 'vue';
import type { InputHTMLAttributes } from 'vue';

interface Props extends /* @vue-ignore */ InputHTMLAttributes {
  class?: string;
  containerProps?: object;
  disabled?: boolean;
  full?: boolean;
  label?: string;
  modelValue?: string | number | boolean;
  tabindex?: string | number
  value?: string | number | boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  full: false,
});

const container = ref<HTMLLabelElement>();
const input = ref<HTMLInputElement>();
const isChecked = computed(() => props.modelValue === props.value);
const radioClass = computed(() => ({
  'cp-radio': true,
  'cp-radio--full': props.full,
}));

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') input.value?.click();
};
</script>

<template>
  <label
    ref="container"
    v-bind="containerProps"
    :class="[radioClass, $props.class]"
    :data-cp-disabled="disabled ? disabled : undefined"
    @keydown="handleKeydown"
  >
    <div class="cp-radio__container">
      <input
        ref="input"
        type="radio"
        v-bind="$attrs"
        :tabindex="tabindex"
        :checked="isChecked"
        :disabled="disabled"
        :value="value"
        @change="$emit('update:modelValue', value)"
      />
      <div class="cp-radio__circle" />
    </div>
    <span v-if="label" class="cp-radio__label">{{ label }}</span>
    <div v-if="$slots.label" class="cp-radio__label">
      <slot name="label"></slot>
    </div>
  </label>
</template>

<style lang="scss">
.cp-radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:focus-within .cp-radio__circle {
    outline: 2px solid var(--color-focus-outline);
  }

  &__container {
    width: 20px;
    height: 20px;
    position: relative;
    flex-shrink: 0;
  }

  input[type="radio"] {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;

    &:checked + .cp-radio__circle {
      border-color: var(--color-primary);

      &::before {
        transform: scale(1);
      }
    }
  }

  &__circle {
    width: 100%;
    height: 100%;
    border: 2px solid var(--color-black);
    border-radius: 50%;
    position: relative;
    padding: 2px;

    &::before {
      content: "";
      width: 100%;
      height: 100%;
      display: block;
      background-color: var(--color-primary);
      border-radius: 50%;
      transform: scale(0);
      transition: transform 100ms cubic-bezier(0.63, 0.01, 0.29, 1);
    }
  }

  &__label {
    color: var(--color-black);
    font-size: var(--text-body-medium-size);
    line-height: var(--text-body-medium-height);
    font-weight: 400;
    flex: 1;
  }

  &--full {
    width: 100%;
  }

  &[data-cp-disabled] {
    cursor: not-allowed;

    input[type="radio"] + .cp-radio__circle,
    input[type="radio"]:checked + .cp-radio__circle {
      background-color: var(--color-disabled-background);
      border-color: var(--color-disabled-border);

      &::before {
        background-color: var(--color-disabled-border);
      }
    }
  }
}
</style>
