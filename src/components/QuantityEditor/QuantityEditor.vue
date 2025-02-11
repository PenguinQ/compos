<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { InputHTMLAttributes } from 'vue';

import ComposIcon, { Plus, Dash } from '@/components/Icons';

interface QuantityEditor extends /* @vue-ignore */ InputHTMLAttributes {
  /**
   * Set the quantity editor into disabled state.
   */
  disabled?: boolean;
  /**
   * Set the quantity editor into disabled state.
   */
  error?: boolean;
  /**
   * Set the quantity editor label.
   */
  label?: string;
  /**
   * Set the quantity editor label additional properties.
   */
  labelProps?: object;
  /**
   * Set the maximum number allowed in quantity editor.
   */
  max?: number;
  /**
   * Set the minimum number allowed in quantity editor.
   */
  min?: number;
  /**
   * Set the message for the quantity editor.
   */
  message?: string;
  /**
   * Set the value using v-model two way data binding.
   */
  modelValue?: string | number;
  /**
   * Reduce the size of the quantity editor.
   */
  small?: boolean;
  /**
   * Set the increment/decrement number of steps.
   */
  step?: number;
  /**
   * Set the value for the quantity editor without using v-model two way data binding.
   */
  value?: string | number;
  /**
   * Set the width of the quantity editor input, represented as a number of digits.
   */
  width?: number | string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<QuantityEditor>(), {
  disabled: false,
  error   : false,
  min     : 0,
  small   : false,
  step    : 1,
  width   : 2,
});

const emits = defineEmits([
  /**
   * Callback for v-model two-way data binding, **used internally**, Storybook shows by default.
   */
  'update:modelValue',
  /**
   * Callback when the input value changes, return event.
   */
  'change',
  /**
   * Callback when - button is clicked, return value of the input with the type of **string**.
   */
  'clickDecrement',
  /**
   * Callback when + button is clicked, return value of the input with the type of **string**.
   */
  'clickIncrement',
]);

const inputRef = ref<HTMLInputElement | null>(null);
const classes = computed(() => ({
  'cp-form'                : true,
  'cp-form-quantity'       : true,
  'cp-form-quantity--small': props.small,
}));
let timeout: ReturnType<typeof setTimeout>;

const updateQuantity = (e: Event | undefined, increment: boolean = true) => {
  e?.preventDefault();
  clearTimeout(timeout);

  const el = inputRef.value;

  increment ? el?.stepUp(props.step) : el?.stepDown(props.step);

  timeout = setTimeout(() => updateQuantity(e, increment), 200);

  emits('update:modelValue', el?.value)
  increment ? emits('clickIncrement', el?.value) : emits('clickDecrement', el?.value);
};

const stopQuantityUpdate = () => clearTimeout(timeout);

const handleKeyDown = (e: KeyboardEvent, increment: boolean = true) => {
  if (e.key === 'Enter') updateQuantity(undefined, increment);
};

const handleInput = (e: Event) => {
  emits('update:modelValue', (e.target as HTMLInputElement).value);
};

watch(
  () => props.modelValue,
  () => {
    emits('change');
  },
);
</script>

<template>
  <div
    :class="classes"
    :data-cp-disabled="disabled ? disabled : undefined"
    :data-cp-error="error ? true : undefined"
  >
    <label v-if="label || $slots.label" v-bind="labelProps" class="cp-form-label">
      <slot name="label" />
      {{ label }}
    </label>
    <div class="cp-form-quantity__field">
      <button
        type="button"
        :disabled="disabled"
        @mousedown="updateQuantity($event, false)"
        @mouseup="stopQuantityUpdate"
        @mouseleave="stopQuantityUpdate"
        @touchstart="updateQuantity($event, false)"
        @touchend="stopQuantityUpdate"
        @keydown="handleKeyDown($event, false)"
        @keyup="stopQuantityUpdate"
      >
        <ComposIcon :icon="Dash" size="28" />
      </button>
      <input
        ref="inputRef"
        v-bind="$attrs"
        type="number"
        inputmode="numeric"
        :disabled="disabled"
        :min="min"
        :max="max"
        :value="value || modelValue"
        @input="handleInput"
        @change="$emit('change', $event)"
        :style="{ width: `calc(${width}ch + 16px)` }"
      />
      <button
        type="button"
        :disabled="disabled"
        @mousedown="updateQuantity($event)"
        @mouseup="stopQuantityUpdate"
        @mouseleave="stopQuantityUpdate"
        @touchstart="updateQuantity($event)"
        @touchend="stopQuantityUpdate"
        @keydown="handleKeyDown($event)"
        @keyup="stopQuantityUpdate"
      >
        <ComposIcon :icon="Plus" size="28" />
      </button>
    </div>
    <div class="cp-form-message" v-if="message || $slots.message">
      <slot name="message" />
      {{ message }}
    </div>
  </div>
</template>

<style src="../../assets/form.scss" />
<style lang="scss">
.cp-form-quantity {
  display: inline-grid;
  justify-items: start;

  &__field {
    display: inline-flex;
  }

  .cp-form-message {
    justify-self: stretch;
  }

  button {
    color: var(--color-white);
    background-color: var(--color-black);
    border: 1px solid transparent;
    border-radius: 8px;
    align-self: stretch;
    outline: none;
    cursor: pointer;
    padding: 0 4px;
    transition: all 300ms cubic-bezier(0.63, 0.01, 0.29, 1);

    &:first-child {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    &:last-child {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    svg {
      fill: var(--color-white);
      transition: transform 300ms cubic-bezier(0.63, 0.01, 0.29, 1);
    }

    &:not(:disabled) {
      &:hover,
      &:focus {
        background-color: var(--color-primary);
      }

      &:active {
        svg {
          transform: scale(0.8);
        }
      }
    }

    &:disabled {
      background-color: var(--color-disabled-2);
      border-color: transparent;
      cursor: not-allowed;
    }
  }

  input {
    width: calc(2ch + 16px);
    color: var(--color-black);
    font-size: 16px;
    line-height: 22px;
    font-weight: 400;
    text-align: center;
    background-color: transparent;
    border-top: 1px solid var(--color-black);
    border-right: none;
    border-bottom: 1px solid var(--color-black);
    border-left: none;
    border-radius: 0;
    outline: none;
    padding: 8px 0;
    transition: all 300ms cubic-bezier(0.63, 0.01, 0.29, 1);

    &::placeholder {
      color: #CED3DC;
      opacity: 1;
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      appearance: none;
      margin: 0;
    }

    &[type="number"] {
      -moz-appearance: textfield;
      appearance: textfield;
    }

    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 2px 6px rgba(127, 90, 255, 0.1);
      outline: none;
    }

    &:disabled {
      background-color: var(--color-disabled-background);
      border-color: var(--color-disabled-border);
      cursor: not-allowed;
    }
  }

  &--small {
    button {
      padding: 0;
    }

    input {
      padding-top: 4px;
      padding-bottom: 4px;
    }
  }
}
</style>
