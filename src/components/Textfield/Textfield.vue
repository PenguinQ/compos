<script setup lang="ts">
import { computed, ref } from 'vue';
import type { InputHTMLAttributes } from 'vue';
import type * as CSS from 'csstype'

import { IconEye, IconEyeSlash } from '@icons';

interface Props extends /* @vue-ignore */ InputHTMLAttributes {
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

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  error: false,
  success: false,
  type: 'text',
});

const emits = defineEmits(['update:modelValue']);

const isPassword = computed(() => props.type === 'password');
const showPassword = ref(false);
const input_value = ref(props.modelValue || props.value);

const handleInput = (e: Event) => {
  input_value.value = (e.target as HTMLInputElement).value;

  emits('update:modelValue', input_value.value);
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div
    v-bind="containerProps"
    class="cp-form cp-form--textfield"
    :data-cp-disabled="disabled ? true : undefined"
    :data-cp-error="error ? true : undefined"
    :data-cp-success="success ? true : undefined"
    :style="{ margin }"
  >
    <label v-if="label || $slots['label']" v-bind="labelProps">
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
        class="cp-form-field"
        v-bind="$attrs"
        :disabled="disabled"
        :placeholder="placeholder"
        :type="showPassword ? 'text' : 'password'"
        :value="input_value"
        @input="handleInput"
      />
      <input
        v-else
        class="cp-form-field"
        v-bind="$attrs"
        :disabled="disabled"
        :placeholder="placeholder"
        :type="type"
        :value="input_value"
        @input="handleInput"
      />
      <div v-if="append || $slots['append'] || isPassword" class="cp-form-affix">
        <button
          class="cp-form--textfield__password-toggle"
          v-if="isPassword"
          type="button"
          @click="togglePassword"
        >
          <IconEye v-if="!showPassword" />
          <IconEyeSlash v-else />
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

<style src="../../assets/_form.scss" />
<style lang="scss">
.cp-form--textfield {
  .cp-form-affix {
    color: inherit;
    font-size: 16px;
    line-height: 22px;
    font-weight: 400;
    transition: color 300ms cubic-bezier(0.63, 0.01, 0.29, 1);
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
