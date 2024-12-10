<script setup lang="ts">
import { computed, ref } from 'vue';
import type { InputHTMLAttributes } from 'vue';
import type * as CSS from 'csstype'

import ComposIcon, { Eye, EyeSlash } from '@/components/Icons';

interface TextfieldProps extends /* @vue-ignore */ InputHTMLAttributes {
  /**
   * Append text to the textfield.
   */
  append?: string;
  /**
   * Set additional properties for the textfield container.
   */
  containerProps?: object;
  /**
   * Set the textfield into disabled state.
   */
  disabled?: boolean;
  /**
   * Set the textfield into disabled state.
   */
  error?: boolean;
  /**
   * Set the textfield label.
   */
  label?: string;
  /**
   * Set the textfield label additional properties.
   */
  labelProps?: object;
  /**
   * Set the textfield CSS margin.
   */
  margin?: CSS.Property.Margin;
  /**
   * Set the message for the textfield.
   */
  message?: string;
  /**
   * Set the value using v-model two way data binding.
   */
  modelValue?: string | number;
  modelModifiers?: object;
  /**
   * Set the textarea placeholder.
   */
  placeholder?: string;
  /**
   * Prepend text to the textfield.
   */
  prepend?: string;
  /**
   * Set the textfield into disabled state.
   */
  success?: boolean;
  /**
   * Set the textfield input type.
   */
  type?: 'email' | 'number' | 'password' | 'tel' | 'text';
  /**
   * Set the value for the textfield without using v-model two way data binding.
   */
  value?: string | number;
}

export interface TextfieldExpose {
  input: typeof input;
}

type TextfieldSlots = {
  /**
   * Slot used to create custom append, since append property only accept string.
   */
  append?: any;
  /**
   * Slot used to create custom label, since label property only accept string.
   */
  label?: any;
  /**
   * Slot used to create custom message, since message property only accept string.
   */
  message?: any;
  /**
   * Slot used to create custom prepend, since prepend property only accept string.
   */
  prepend?: any;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TextfieldProps>(), {
  disabled: false,
  error: false,
  success: false,
  type: 'text',
});
const emits = defineEmits([
  /**
   * Callback for v-model two-way data binding, **used internally**, Storybook shows by default.
   */
  'update:modelValue'
]);

defineSlots<TextfieldSlots>();

const isPassword = computed(() => props.type === 'password');
const showPassword = ref(false);
const input = ref<HTMLInputElement | null>(null);

const handleInput = (e: Event) => {
  emits('update:modelValue', (e.target as HTMLInputElement).value);
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Expose
defineExpose<TextfieldExpose>({ input });
</script>

<template>
  <div
    v-bind="containerProps"
    class="cp-form cp-form-textfield"
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
      <input
        v-if="isPassword"
        ref="input"
        class="cp-form-field"
        v-bind="$attrs"
        :disabled="disabled"
        :placeholder="placeholder"
        :type="showPassword ? 'text' : 'password'"
        :value="value || modelValue"
        @input="handleInput"
      />
      <input
        v-else
        ref="input"
        class="cp-form-field"
        v-bind="$attrs"
        :disabled="disabled"
        :placeholder="placeholder"
        :type="type"
        :value="value || modelValue"
        @input="handleInput"
      />
      <div v-if="append || $slots['append'] || isPassword" class="cp-form-affix">
        <button
          class="cp-form--textfield__password-toggle"
          v-if="isPassword"
          type="button"
          @click="togglePassword"
        >
          <ComposIcon :icon="Eye" v-if="!showPassword" />
          <ComposIcon :icon="EyeSlash" v-else />
        </button>
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
.cp-form-textfield {
  width: 100%;

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
    padding: 14px 0;

    &:first-child {
      padding-left: 12px;
    }

    &:last-child {
      padding-right: 12px;
    }
  }

  &__password-toggle {
    background-color: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 4px;
  }
}
</style>
