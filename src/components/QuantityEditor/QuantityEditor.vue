<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { InputHTMLAttributes } from 'vue';

import ComposIcon, { Plus, Dash } from '@/components/Icons';

interface QuantityEditor extends /* @vue-ignore */ InputHTMLAttributes {
  /**
   * Set the QuantityEditor into disabled state.
   */
  disabled?: boolean;
  /**
   * Set the QuantityEditor into disabled state.
   */
  error?: boolean;
  /**
   * Set the QuantityEditor label.
   */
  label?: string;
  /**
   * Set the QuantityEditor label additional properties.
   */
  labelProps?: object;
  /**
   * Set the maximum number allowed in QuantityEditor.
   */
  max?: number;
  /**
   * Set the minimum number allowed in QuantityEditor.
   */
  min?: number;
  /**
   * Set the message for the QuantityEditor.
   */
  message?: string;
  /**
   * Set the value using v-model two way data binding.
   */
  modelValue?: string | number;
  /**
   * Set the v-model modifiers.
   */
  modelModifiers?: Record<string, boolean>;
  /**
   * Set the QuantityEditor size.
   */
  size?: 'small';
  /**
   * Set the increment/decrement number of steps.
   */
  step?: number;
  /**
   * Set the value for the QuantityEditor without using v-model two way data binding.
   */
  value?: string | number;
  /**
   * Set the width of the QuantityEditor input, represented as a number of digits.
   */
  width?: 'auto' | number | string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<QuantityEditor>(), {
  disabled: false,
  error   : false,
  min     : 0,
  step    : 1,
  width   : 'auto',
});

const emits = defineEmits([
  /**
   * Callback for v-model two-way data binding, **used internally**, Storybook shows by default.
   */
  'update:modelValue',
  /**
   * Callback for change event, return event.
   */
  'change',
  /**
   * Callback for input event, return event.
   */
  'input',
  /**
   * Callback when - button is clicked, return value of the input with the type of **string**.
   */
  'clickDecrement',
  /**
   * Callback when + button is clicked, return value of the input with the type of **string**.
   */
  'clickIncrement',
]);

const inputRef       = ref<HTMLInputElement | null>(null);
const computedValue  = computed(() => props.modelValue ?? props.value);
const inputValue     = ref(computedValue.value != null ? String(computedValue.value) : '');
const inputWidth     = computed(() => {
  if (props.width === 'auto') return inputValue.value.length > 2 ? `calc(${inputValue.value.length}ch + 16px)` : '';

  return `calc(${props.width}ch + 16px)`;
});
const isNumber = computed(() => {
  const hasModifiers = props.modelModifiers && props.modelModifiers.number;

  return (computedValue.value != null && typeof computedValue.value === 'number') || hasModifiers;
});
const classes = computed(() => ({
  'cp-form'                : true,
  'cp-form-quantity'       : true,
  'cp-form-quantity--small': props.size === 'small',
}));
let timeout: ReturnType<typeof setTimeout>;

const normalizeInput = (input: string) => {
  let number = input.replace(/^-+/, '-');

  number = number.replace(/(?!^)-/g, '');

  if (number === '-') return '-';

  number = number.replace(/^(-?)0+(?=\d)/g, '$1');
  number = number.replace(/^0+$/, '0');

  if (number === '-0') return '0';

  return number;
};

const handleStep = (direction: 'up' | 'down') => {
  if (!inputRef.value) return;

  const input  = inputRef.value;
  const value  = Number(input.value === '-' ? '' : input.value);
  const step   = Math.round(props.step);
  let newValue = direction === 'up' ? value + step : value - step;

  if (props.max != null && newValue > props.max) newValue = props.max;

  if (props.min != null && newValue < props.min) newValue = props.min;

  inputValue.value = String(newValue);
};

const updateQuantity = (e: Event | undefined, increment = true) => {
  e?.preventDefault();
  clearTimeout(timeout);

  increment ? handleStep('up') : handleStep('down');

  const returnValue = isNumber.value ? Number(inputValue.value) : inputValue.value;

  emits('update:modelValue', returnValue);

  increment ? emits('clickIncrement', returnValue) : emits('clickDecrement', returnValue);

  if (
    props.min >= Number(inputValue.value) ||
    props.max && props.max <= Number(inputValue.value)
  ) return;

  timeout = setTimeout(() => updateQuantity(e, increment), 200);
};

const stopUpdateQuantity = () => clearTimeout(timeout);

const handleStepKeydown = (e: KeyboardEvent, increment: boolean = true) => {
  if (e.key === 'Enter') updateQuantity(undefined, increment);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
};

const handleKeyPress = (e: KeyboardEvent) => {
  const keyMap = ['-', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Tab'];

  if (!/^\d$/.test(e.key) && !keyMap.includes(e.key)) e.preventDefault();
};

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;

  target.value = normalizeInput(target.value);

  if (props.max != null && props.max < Number(target.value)) {
    target.value = String(props.max);
  } else if (props.min != null && props.min > Number(target.value)) {
    target.value = String(props.min);
  }

  inputValue.value = target.value;

  if (inputValue.value.startsWith('-') && inputValue.value.length < 2) return;

  emits('update:modelValue', isNumber.value ? Number(inputValue.value) : inputValue.value);
  emits('input', e);
};

watch(computedValue, newValue => {
  const normalizedValue = normalizeInput(String(newValue));

  // Detect and apply changes coming from external update
  if (inputValue.value && inputValue.value !== normalizedValue) inputValue.value = normalizedValue;
});
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
        :disabled="disabled || min === Number(inputValue)"
        @mousedown="updateQuantity($event, false)"
        @mouseup="stopUpdateQuantity"
        @mouseleave="stopUpdateQuantity"
        @touchstart="updateQuantity($event, false)"
        @touchend="stopUpdateQuantity"
        @keydown="handleStepKeydown($event, false)"
        @keyup="stopUpdateQuantity"
      >
        <ComposIcon :icon="Dash" size="28" />
      </button>
      <input
        ref="inputRef"
        v-bind="$attrs"
        type="text"
        pattern="-?[0-9]*"
        inputmode="numeric"
        :disabled="disabled"
        :value="inputValue"
        @input="handleInput"
        @keydown="handleKeyDown"
        @keypress="handleKeyPress"
        :style="{ width: inputWidth }"
      />
      <button
        type="button"
        :disabled="disabled || max === Number(inputValue)"
        @mousedown="updateQuantity($event)"
        @mouseup="stopUpdateQuantity"
        @mouseleave="stopUpdateQuantity"
        @touchstart="updateQuantity($event)"
        @touchend="stopUpdateQuantity"
        @keydown="handleStepKeydown($event)"
        @keyup="stopUpdateQuantity"
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
    transition-property: background-color, border-color;
    transition-duration: var(--transition-duration-normal);
    transition-timing-function: var(--transition-timing-function);

    &:first-child {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    &:last-child {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    compos-icon {
      fill: var(--color-white);
      transition: transform var(--transition-duration-normal) var(--transition-timing-function);
    }

    &:not(:disabled) {
      &:hover,
      &:focus {
        background-color: var(--color-primary);
      }

      &:active {
        compos-icon {
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
    transition-property: background-color, border-color;
    transition-duration: var(--transition-duration-normal);
    transition-timing-function: var(--transition-timing-function);

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
