<script lang="ts">
export default { inheritAttrs: false };
</script>
<script setup lang="ts">
import { computed, ref } from 'vue';
import type { InputHTMLAttributes } from 'vue';
import { Eye, EyeSlash } from '@icons';

interface Props extends /* @vue-ignore */ InputHTMLAttributes {
  append?: string;
  class?: string;
  disabled?: boolean;
  error?: boolean;
  label?: string;
  message?: string;
  modelValue?: string | number;
  placeholder?: string;
  prepend?: string;
  success?: boolean;
  type?: 'email' | 'number' | 'password' | 'tel' | 'text';
  value?: any;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  error: false,
  success: false,
  type: 'text',
});

const emits = defineEmits(['update:modelValue']);

const isPassword = computed(() => props.type === 'password');
const showPassword = ref(false);

const handleInput = (e: Event) => {
  emits('update:modelValue', (e.target as HTMLInputElement).value);
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div
    class="cp-form cp-form--textfield"
    :class="class"
    :data-mt-disabled="disabled ? true : undefined"
    :data-mt-error="error ? true : undefined"
    :data-mt-success="success ? true : undefined"
  >
    <label v-if="label || $slots['label']">
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
        :value="value || modelValue"
        @input="handleInput"
      />
      <input
        v-else
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
          <Eye v-if="!showPassword" />
          <EyeSlash v-else />
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
