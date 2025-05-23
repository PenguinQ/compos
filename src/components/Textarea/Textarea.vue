<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { TextareaHTMLAttributes, Slot } from 'vue';
import type * as CSSType from 'csstype'

interface Textarea extends /* @vue-ignore */ TextareaHTMLAttributes {
  /**
   * Set additional properties for the Textarea container.
   */
  containerProps?: object;
  /**
   * Set the Textarea into disabled state.
   */
  disabled?: boolean;
  /**
   * Set the Textarea into error state.
   */
  error?: boolean;
  /**
   * Set the Textarea label.
   */
  label?: string;
  /**
   * Set the Textarea label additional properties.
   */
  labelProps?: object;
  /**
   * Set the Textarea CSS margin.
   */
  margin?: CSSType.Property.Margin;
  /**
   * Set the maximum rows for Textarea.
   */
  maxRows?: number;
  /**
   * Set the message for the Textarea.
   */
  message?: string;
  /**
   * Set the minimum rows for Textarea.
   */
  minRows?: number;
  /**
   * Set the value using v-model two way data binding.
   */
  modelValue?: string | number;
  /**
   * Set the Textarea placeholder.
   */
  placeholder?: string;
  /**
   * Set the Textarea into success state.
   */
  success?: boolean;
  /**
   * Set the value for the Textarea without using v-model two way data binding.
   */
  value?: string | number;
}

type TextareaSlots = {
  /**
   * Slot used to create custom label, since label property only accept string.
   */
  label?: Slot;
  /**
   * Slot used to create custom message, since message property only accept string.
   */
  message?: Slot;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Textarea>(), {
  disabled: false,
  error   : false,
  success : false,
  minRows : 4,
});

const emits = defineEmits([
  /**
   * Callback for v-model two-way data binding, **used internally**, Storybook shows by default.
   */
  'update:modelValue',
]);

defineSlots<TextareaSlots>();

const lineHeight = ref(24); // Initial start (--text-body-size-lg * --text-body-height-lg)
const minHeight  = ref<number>(props.minRows ? props.minRows * lineHeight.value : lineHeight.value);
const maxHeight  = ref<number>(props.maxRows ? props.maxRows * lineHeight.value : 0);
const inputRef   = ref<HTMLTextAreaElement>();

const updateHeight = (elem: HTMLTextAreaElement, height?: number) => {
  elem.style.height = `${minHeight.value}px`;
  elem.style.height = `${height ? height : elem.scrollHeight}px`;
};

const handleInput = (e: Event) => {
  const el = inputRef.value;

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
  const el = inputRef.value;

  if (!el) return false;

  requestAnimationFrame(() => {
    const elScrollHeight = el.scrollHeight;

    if (maxHeight.value! <= elScrollHeight) updateHeight(el, maxHeight.value!);

    emits('update:modelValue', (e.target as HTMLTextAreaElement).value);
  });
};

const handleFieldClick = () => {
  inputRef.value?.focus();
};

onMounted(() => {
  if (inputRef.value) {
    if (typeof window !== 'undefined') {
      const inputStyle  = getComputedStyle(inputRef.value);
      const inputHeight = inputStyle.getPropertyValue('line-height');

      lineHeight.value = parseInt(inputHeight);
      minHeight.value  = props.minRows ? props.minRows * parseInt(inputHeight) : parseInt(inputHeight)
      maxHeight.value  = props.maxRows ? props.maxRows * parseInt(inputHeight) : 0;
    }

    if (props.maxRows) {
      inputRef.value.style.height = `${props.minRows > props.maxRows ? maxHeight.value : minHeight.value}px`;
    } else {
      inputRef.value.style.height = `${minHeight.value}px`;
    }
  }
});

watch(
  [() => props.minRows, () => props.maxRows],
  ([min, max], [prevMin, prevMax]) => {
    if (inputRef.value) {
      if (max !== prevMax && max) {
        maxHeight.value = max * lineHeight.value;

        if (min && min >= max) inputRef.value.style.height = `${maxHeight.value}px`;
      }

      if (min !== prevMin && min) {
        minHeight.value = max && min >= max ? max * lineHeight.value : min * lineHeight.value;

        inputRef.value.style.height = `${minHeight.value}px`;
      }
    }
  },
);
</script>

<template>
  <div
    v-bind="containerProps"
    class="cp-form cp-form-textarea"
    :data-cp-disabled="disabled ? true : undefined"
    :data-cp-error="error ? true : undefined"
    :data-cp-success="success ? true : undefined"
    :style="{ margin }"
  >
    <label v-if="label || $slots.label" v-bind="labelProps" class="cp-form-label">
      <slot name="label" />
      {{ label }}
    </label>
    <div class="cp-form-container" @click="handleFieldClick">
      <textarea
        ref="inputRef"
        class="cp-form-field"
        v-bind="$attrs"
        :disabled="disabled"
        :placeholder="placeholder"
        :value="value || modelValue"
        @input="handleInput"
        @paste="maxRows && handlePaste($event)"
      />
    </div>
    <div class="cp-form-message" v-if="message || $slots.message">
      <slot name="message" />
      {{ message }}
    </div>
  </div>
</template>

<style src="@/assets/component.form.scss" />
<style lang="scss">
.cp-form-textarea {
  width: 100%;

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
