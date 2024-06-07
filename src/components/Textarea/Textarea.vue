<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { TextareaHTMLAttributes } from 'vue';
import type * as CSS from 'csstype'

interface Props extends /* @vue-ignore */ TextareaHTMLAttributes {
  /**
   * Set additional properties for the textarea container.
   */
  containerProps?: object;
  /**
   * Set the textarea into disabled state.
   */
  disabled?: boolean;
  /**
   * Set the textarea into error state.
   */
  error?: boolean;
  /**
   * Set the textarea label.
   */
  label?: string;
  /**
   * Set the textarea label additional properties.
   */
  labelProps?: object;
  /**
   * Set the textarea CSS margin.
   */
  margin?: CSS.Property.Margin;
  /**
   * Set the maximum rows for textarea.
   */
  maxRows?: number;
  /**
   * Set the message for the textarea.
   */
  message?: string;
  /**
   * Set the minimum rows for textarea.
   */
  minRows?: number;
  /**
   * Set the value using v-model two way data binding.
   */
  modelValue?: string | number;
  /**
   * Set the textarea placeholder.
   */
  placeholder?: string;
  /**
   * Set the textarea into success state.
   */
  success?: boolean;
  /**
   * Set the value for the textarea without using v-model two way data binding.
   */
  value?: string | number;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  error: false,
  success: false,
  minRows: 4,
});

const emit = defineEmits(['update:modelValue']);

const LINE_HEIGHT = 22;
const min_height = ref<number>(props.minRows ? props.minRows * LINE_HEIGHT : LINE_HEIGHT);
const max_height = ref<number>(props.maxRows ? props.maxRows * LINE_HEIGHT : 0);
const field_ref = ref<HTMLTextAreaElement>();

const updateHeight = (elem: HTMLTextAreaElement, height?: number) => {
  elem.style.height = `${min_height.value}px`;
  elem.style.height = `${height ? height : elem.scrollHeight}px`;
};

const handleInput = (e: Event) => {
  const el = field_ref.value;

  if (!el) return false;

  const elScrollHeight = el.scrollHeight;

  if (props.maxRows) {
    if (props.minRows > props.maxRows) return false;

    if (max_height.value! >= elScrollHeight) updateHeight(el);
  } else {
    if (min_height.value! <= elScrollHeight) updateHeight(el);
  }

  emit('update:modelValue', (e.target as HTMLTextAreaElement).value);
};

const handlePaste = (e: Event) => {
  const el = field_ref.value;

  if (!el) return false;

  requestAnimationFrame(() => {
    const elScrollHeight = el.scrollHeight;

    if (max_height.value! <= elScrollHeight) updateHeight(el, max_height.value!);

    emit('update:modelValue', (e.target as HTMLTextAreaElement).value);
  });
};

const handleFieldClick = () => {
  field_ref.value?.focus();
};

onMounted(() => {
  if (field_ref.value) {
    if (props.maxRows) {
      field_ref.value.style.height = `${props.minRows > props.maxRows ? max_height.value : min_height.value}px`;
    } else {
      field_ref.value.style.height = `${min_height.value}px`;
    }
  }
});

watch(
  [() => props.minRows, () => props.maxRows],
  ([min, max], [prev_min, prev_max]) => {
    if (field_ref.value) {
      if (max !== prev_max && max) {
        max_height.value = max * LINE_HEIGHT;

        if (min && min >= max) field_ref.value.style.height = `${max_height.value}px`;
      }

      if (min !== prev_min && min) {
        min_height.value = max && min >= max ? max * LINE_HEIGHT : min * LINE_HEIGHT;

        field_ref.value.style.height = `${min_height.value}px`;
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
    <label v-if="label || $slots['label']" v-bind="labelProps" class="cp-form-label">
      <slot name="label" />
      {{ label }}
    </label>
    <div class="cp-form-container" @click="handleFieldClick">
      <textarea
        ref="field_ref"
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
