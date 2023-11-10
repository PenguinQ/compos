<script lang="ts">
export default { inheritAttrs: false };
</script>
<script setup lang="ts">
import { computed, ref } from 'vue';
import type { InputHTMLAttributes } from 'vue';

interface Props extends InputHTMLAttributes {
  append?: string | Node;
  error?: boolean;
  focus?: boolean;
  label?: string | Node;
  message?: string | Node;
  modelValue?: string | number;
  placeholder?: string;
  prepend?: string | Node;
  success?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  error: false,
  focus: false,
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
  <div class="cp-form cp-form--textfield" :class="class">
    <label v-if="label">{{ label }}</label>
    <div class="cp-form-container">
      <div v-if="prepend || $slots['prepend']" class="cp-form-affix">
        <slot name="prepend" />
        {{ prepend }}
      </div>
      <input
        v-if="isPassword"
        class="cp-form-field"
        v-bind="$attrs"
        :type="showPassword ? 'text' : 'password'"
        :disabled="disabled"
        :value="value || modelValue"
        @input="handleInput"
      />
      <input
        v-else
        class="cp-form-field"
        v-bind="$attrs"
        :type="type"
        :disabled="disabled"
        :value="value || modelValue"
        @input="handleInput"
      />
      <div v-if="append || $slots['append'] || isPassword" class="cp-form-affix">
        <button>Eye</button>
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

<style lang="scss"></style>
