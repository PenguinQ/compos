<script lang="ts">
export default { inheritAttrs: false };
</script>
<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import type { TextareaHTMLAttributes } from 'vue';

interface Props extends /* @vue-ignore */ TextareaHTMLAttributes {
  class?: string;
  disabled?: boolean;
  error?: boolean;
  focus?: boolean;
  label?: string;
  maxRows?: number;
  message?: string;
  minRows?: number;
  modelValue?: string | number;
  placeholder?: string;
  success?: boolean;
  value?: any;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  error: false,
  focus: false,
  success: false,
  minRows: 4,
});

const emits = defineEmits(['update:modelValue']);

const minHeight = computed(() => props.minRows * 22);
const maxHeight = computed(() => props.maxRows && props.maxRows * 22);
const fieldRef = ref<HTMLTextAreaElement | null>(null);

const handleInput = (e: Event) => {
  const el = fieldRef.value;

  if (el) {
    const fieldScrollHeight = el.scrollHeight;

    if (maxHeight.value) {
      if (maxHeight.value >= fieldScrollHeight) {
        el.style.height = `${minHeight.value}px`;
        el.style.height = `${el.scrollHeight}px`;
      }
    } else {
      if (minHeight.value !== fieldScrollHeight) {
        el.style.height = `${minHeight.value}px`;
        el.style.height = `${el.scrollHeight}px`;
      }
    }
  }

  emits('update:modelValue', (e.target as HTMLTextAreaElement).value);
};

const handleFieldClick = () => {
  fieldRef.value?.focus();
};

onMounted(() => {
  if (fieldRef.value) {
    fieldRef.value.style.height = `${minHeight.value}px`;

    if (props.focus) fieldRef.value.focus();
  }
});

watch(
  () => props.minRows,
  (a, b) => {
    if (a < b) {
      console.log('update height');
    }
  }
);
</script>

<template>
  <div
    class="cp-form cp-form--textarea"
    :class="class"
    :data-mt-disabled="disabled ? true : undefined"
    :data-mt-error="error ? true : undefined"
    :data-mt-success="success ? true : undefined"
  >
    <label v-if="label || $slots['label']">
      <slot name="label" />
      {{ label }}
    </label>
    <div class="cp-form-container" @click="handleFieldClick">
      <textarea
        ref="fieldRef"
        class="cp-form-field"
        v-bind="$attrs"
        :disabled="disabled"
        :placeholder="placeholder"
        :value="value || modelValue"
        @input="handleInput"
      />
    </div>
    <div class="cp-form-message" v-if="message || $slots['message']">
      <slot name="message" />
      {{ message }}
    </div>
  </div>
</template>

<style lang="scss">
.cp-form--textarea {

}
</style>
