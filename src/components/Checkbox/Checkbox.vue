<script setup lang="ts">
import { computed, ref } from 'vue';
import type { InputHTMLAttributes } from 'vue';

import ComposIcon, { Check } from '@/components/Icons';

interface Props extends /* @vue-ignore */ InputHTMLAttributes {
  /**
   * Set the class for checkbox outer container.
   */
  class?: string;
  /**
   * Set the checkbox label additional properties.
   */
  labelProps?: object;
  /**
   * Set checkbox to disabled state.
   */
  disabled?: boolean;
  /**
   * Set the false value for the checkbox without using v-model two way data binding.
   */
  falseValue?: string | number | boolean;
  /**
   * Set the checkbox width to 100%.
   */
  full?: boolean;
  /**
   * Set the checkbox label.
   */
  label?: string;
  /**
   * Set the message for the quantity editor.
   */
  message?: string;
  /**
   * Set the value using v-model two way data binding.
   */
  modelValue?: string | number | boolean | [];
  /**
   * Set the checkbox tabindex.
   */
  tabindex?: string | number;
  /**
   * Set the true value for the checkbox without using v-model two way data binding.
   */
  trueValue?: string | number | boolean;
  /**
   * Set the value for the checkbox without using v-model two way data binding.
   */
  value?: string | number | boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  full: false,
  tabindex: 0,
});

const emits = defineEmits(['update:modelValue']);

const container = ref();
const input = ref<HTMLInputElement>();
const computedValue = computed(() => props.trueValue ? props.trueValue : props.value);
const computedArray = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});
const isArray = computed(() => props.modelValue instanceof Array);
const isChecked = computed((): any => {
  if (computedValue.value) {
    return props.modelValue === computedValue.value;
  } else {
    if (typeof props.modelValue !== 'string') return props.modelValue;
  }
});
const classes = computed(() => ({
  'cp-form-checkbox': true,
  'cp-form-checkbox--full': props.full,
}));

const handleChange = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked;
  let updateValue: string | number | boolean;

  if (checked) {
    updateValue = props.trueValue
      ? props.trueValue
      : props.value
      ? props.value
      : true;
  } else {
    updateValue = props.falseValue ? props.falseValue : false;
  }

  emits('update:modelValue', updateValue);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') input.value?.click();
};
</script>

<template>
  <div :class="[classes, $props.class]" :data-cp-disabled="disabled ? disabled : undefined">
    <label
      ref="container"
      v-bind="labelProps"
      class="cp-form-checkbox__field"
      @keydown="handleKeydown"
    >
      <div class="cp-form-checkbox__input">
        <input
          v-if="isArray"
          ref="input"
          type="checkbox"
          v-bind="$attrs"
          v-model="computedArray"
          :tabindex="tabindex"
          :checked="computedArray === computedValue"
          :disabled="disabled"
          :value="computedValue"
        />
        <input
          v-else
          ref="input"
          type="checkbox"
          v-bind="$attrs"
          :tabindex="tabindex"
          :checked="isChecked"
          :disabled="disabled"
          :value="computedValue"
          @input="handleChange"
        />
        <div class="cp-form-checkbox__box">
          <ComposIcon :icon="Check" color="var(--color-white)" />
        </div>
      </div>
      <span v-if="label && !$slots.label" class="cp-form-checkbox__label">{{ label }}</span>
      <div v-if="$slots.label" class="cp-form-checkbox__label">
        <slot name="label"></slot>
      </div>
    </label>
    <div class="cp-form-message" v-if="message || $slots['message']">
      <template v-if="!$slots.message">{{ message }}</template>
      <slot name="message" />
    </div>
  </div>
</template>

<style src="../../assets/form.scss" />
<style lang="scss">
.cp-form-checkbox {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;

  &__field {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  &__input {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    position: relative;
    flex-shrink: 0;

    &:focus-within {
      outline: 2px solid var(--color-focus-outline);
    }
  }

  input[type="checkbox"] {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;

    &:checked + .cp-form-checkbox__box {
      background-color: var(--color-black);
      border-color: var(--color-black);

      compos-icon {
        opacity: 1;
      }
    }
  }

  &__box {
    color: var(--color-white);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-black);
    border-radius: 4px;
    position: absolute;
    inset: 0;

    compos-icon {
      width: 100%;
      height: 100%;
      opacity: 0;
    }
  }

  &__label {
    @include text-body-md;
    color: var(--color-black);
    font-weight: 400;
    flex: 1;
  }

  &--full {
    width: 100%;

    .cp-form-checkbox__field {
      width: 100%;
    }
  }

  &[data-cp-disabled] {
    .cp-form-checkbox__field {
      cursor: not-allowed;
    }

    input[type="checkbox"] + .cp-form-checkbox__box,
    input[type="checkbox"]:checked + .cp-form-checkbox__box {
      background-color: var(--color-disabled-background);
      border-color: var(--color-disabled-border);

      compos-icon {
        color: var(--color-disabled-border);
      }
    }
  }
}
</style>
