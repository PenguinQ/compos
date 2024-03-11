<script setup lang="ts">
import { ref } from 'vue';
import type { InputHTMLAttributes } from 'vue';

import { IconPlus, IconDash } from '@icons';

interface Props extends /* @vue-ignore */ InputHTMLAttributes {
  disabled?: boolean;
  min?: number;
  modelValue?: string | number;
  value?: string | number;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  min: 0,
});

const emits = defineEmits([
  'update:modelValue',
  'onClickDecrement',
  'onClickIncrement',
]);

let timeout: any = null;
const input = ref<HTMLInputElement | null>(null);

const updateQuantity = (e: Event | undefined, increment: boolean = true) => {
  e?.preventDefault();
  clearTimeout(timeout);

  const el = input.value;

  increment ? el?.stepUp() : el?.stepDown();

  timeout = setTimeout(() => updateQuantity(e, increment), 200);

  emits('update:modelValue', el?.value)
};

const stopQuantityUpdate = () => clearTimeout(timeout);

const handleKeyDown = (e: KeyboardEvent, increment: boolean = true) => {
  if (e.key === 'Enter') updateQuantity(undefined, increment);
};

const handleInput = (e: Event) => {
  emits('update:modelValue', (e.target as HTMLInputElement).value)
};
</script>

<template>
  <div class="cp-quantity-editor" :data-mt-disabled="disabled ? disabled : undefined">
    <button
      type="button"
      :disabled="disabled"
      @click="$emit('onClickDecrement')"
      @mousedown="(e) => updateQuantity(e, false)"
      @mouseup="stopQuantityUpdate"
      @mouseleave="stopQuantityUpdate"
      @touchstart="(e) => updateQuantity(e, false)"
      @touchend="stopQuantityUpdate"
      @keydown="(e) => handleKeyDown(e, false)"
      @keyup="stopQuantityUpdate"
    >
      <IconDash size="28" />
    </button>
    <input
      ref="input"
      v-bind="$attrs"
      type="number"
      inputmode="numeric"
      :disabled="disabled"
      :min="min"
      :value="value || modelValue"
      @input="handleInput"
    />
    <button
      type="button"
      :disabled="disabled"
      @click="$emit('onClickIncrement')"
      @mousedown="(e) => updateQuantity(e)"
      @mouseup="stopQuantityUpdate"
      @mouseleave="stopQuantityUpdate"
      @touchstart="(e) => updateQuantity(e)"
      @touchend="stopQuantityUpdate"
      @keydown="(e) => handleKeyDown(e)"
      @keyup="stopQuantityUpdate"
    >
      <IconPlus size="28" />
    </button>
  </div>
</template>

<style src="../../assets/_form.scss" />
<style lang="scss">
.cp-quantity-editor {
  display: inline-flex;
  align-items: center;

  button {
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
    width: calc(4ch + 16px);
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
}
</style>
