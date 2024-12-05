<script setup lang="ts">
import { computed } from 'vue';
import type { OptionHTMLAttributes } from 'vue';
import type * as CSS from 'csstype'

import ComposIcon, { ChevronUp } from '@/components/Icons';

type SelectOptions = OptionHTMLAttributes & {
  text: string;
};

type Select = {
  /**
   * Append text to the select.
   */
  append?: string;
  /**
   * Set additional properties for the select container.
   */
  containerProps?: object;
  /**
   * Set the select into disabled state.
   */
  disabled?: boolean;
  /**
   * Set the select into error state.
   */
  error?: boolean;
  /**
   * Set the select label.
   */
  label?: string;
  /**
   * Set the select label additional properties.
   */
  labelProps?: object;
  /**
   * Set the select CSS margin.
   */
  margin?: CSS.Property.Margin;
  /**
   * Set the select message.
   */
  message?: string;
  /**
   * Set the select options in object way.
   */
  options?: SelectOptions[],
  /**
   * Set the value using v-model two way data binding.
   */
  modelValue?: string | number;
  /**
   * Prepend text to the select.
   */
  prepend?: string;
  /**
   * Set the select into success state.
   */
  success?: boolean;
  /**
   * Set the value for the select without using v-model two way data binding.
   */
  value?: string | number;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Select>(), {
  disabled: false,
  error: false,
  success: false,
});

const emits = defineEmits(['update:modelValue']);
</script>

<template>
  <div
    v-bind="containerProps"
    class="cp-form cp-form-select"
    :data-cp-disabled="disabled ? true : undefined"
    :data-cp-error="error ? true : undefined"
    :data-cp-success="success ? true : undefined"
    :style="{ margin }"
  >
    <label v-if="label || $slots['label']" v-bind="labelProps" class="cp-form-label">
      <slot name="label" />
      {{ label }}
    </label>
    <div class="cp-form-container">
      <div v-if="prepend || $slots['prepend']" class="cp-form-affix">
        <slot name="prepend" />
        {{ prepend }}
      </div>
      <select
        v-bind="$attrs"
        class="cp-form-field"
        :disabled="disabled"
        :value="value || modelValue"
        @input="emits('update:modelValue', $event)"
      >
        <option v-if="options" v-for="{ text, ...rest } of options" v-bind="rest">
          {{ text }}
        </option>
        <slot v-else></slot>
      </select>
      <div class="cp-form-affix">
        <ComposIcon :icon="ChevronUp" size="16px" />
      </div>
      <div v-if="append || $slots['append']" class="cp-form-affix">
        <slot name="append" />
        {{ append }}
      </div>
    </div>
    <div class="cp-form-message" v-if="message || $slots['message']">
      <slot name="message" />
      {{ message }}
    </div>
  </div>
</template>

<style src="@/assets/form.scss" />
<style lang="scss">
.cp-form-select {
  .cp-form-affix {
    color: inherit;
    font-size: 16px;
    line-height: 22px;
    font-weight: 400;
    transition: color var(--transition-duration-normal) var(--transition-timing-function);
    display: flex;

    &:first-child {
      padding-left: 12px;
    }

    &:last-child {
      padding-right: 12px;
    }
  }

  .cp-form-field {
    background-color: transparent;
    border: none;
    appearance: none;
    padding: 0;
    outline: none;
    padding-top: 14px;
    padding-bottom: 14px;

    &:first-child {
      padding-left: 12px;
    }

    &:last-child {
      padding-right: 12px;
    }
  }
}
</style>
