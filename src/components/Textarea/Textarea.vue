<script lang="ts">
export default { inheritAttrs: false };
</script>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
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

const LINE_HEIGHT = 22;
const minHeight = ref<number | null>(props.minRows * LINE_HEIGHT);
const maxHeight = ref<number | null>(props.maxRows ? props.maxRows * LINE_HEIGHT : null);
const fieldRef = ref<HTMLTextAreaElement | null>(null);

const updateHeight = (elem: HTMLTextAreaElement, height?: number) => {
  elem.style.height = `${minHeight.value}px`;
  elem.style.height = `${height ? height : elem.scrollHeight}px`;
}

const handleInput = (e: Event) => {
  const el = fieldRef.value;

  if (!el) return false;

  const elScrollHeight = el.scrollHeight;

  if (props.maxRows) {
    if (props.minRows > props.maxRows) return false;

    if (maxHeight.value! >= elScrollHeight) updateHeight(el);
  } else {
    if (minHeight.value! <= elScrollHeight) updateHeight(el);
  }

  emits('update:modelValue', (e.target as HTMLTextAreaElement).value);
};

const handlePaste = (e: Event) => {
  const el = fieldRef.value;

  if (!el) return false;

  requestAnimationFrame(() => {
    const elScrollHeight = el.scrollHeight;

    if (maxHeight.value! <= elScrollHeight) updateHeight(el, maxHeight.value!);

    emits('update:modelValue', (e.target as HTMLTextAreaElement).value);
  });
};

const handleFieldClick = () => {
  fieldRef.value?.focus();
};

onMounted(() => {
  if (fieldRef.value) {
    if (props.maxRows) {
      fieldRef.value.style.height = `${props.minRows > props.maxRows ? maxHeight.value : minHeight.value}px`;
    } else {
      fieldRef.value.style.height = `${minHeight.value}px`;
    }
  }
});

watch(
  () =>[props.minRows, props.maxRows],
  ([minRows, maxRows]) => {
    const el = fieldRef.value;

    if (!el) return false;

    if (maxRows) {
      maxHeight.value = maxRows * LINE_HEIGHT;

      if (minRows! >= maxRows) minHeight.value = maxHeight.value;

      el.style.height = `${minHeight.value}px`;
    } else {
      minHeight.value = minRows! * LINE_HEIGHT;
      el.style.height = `${minRows! * LINE_HEIGHT}px`;
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
        @paste="maxRows && handlePaste($event)"
      />
    </div>
    <div class="cp-form-message" v-if="message || $slots['message']">
      <slot name="message" />
      {{ message }}
    </div>
  </div>
</template>

<style src="../../assets/_form.scss" />
<style lang="scss">
.cp-form--textarea {
  .cp-form-container {
    cursor: text;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .cp-form-field {
    resize: none;
    padding: 0 12px;
  }
}
</style>
