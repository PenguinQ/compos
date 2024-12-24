<script setup lang="ts">
import { computed, ref, getCurrentInstance } from 'vue';
import type { InputHTMLAttributes, Slot } from 'vue';

import ComposIcon, { Check } from '@/components/Icons';

export type CheckboxValue = string | number | boolean;

interface Checkbox extends /* @vue-ignore */ InputHTMLAttributes {
  /**
   * Set the Checkbox container additional properties.
   */
  containerProps?: object;
  /**
   * Set the Checkbox to disabled state.
   */
  disabled?: boolean;
  /**
   * Set the Checkbox into error state.
   */
  error?: boolean;
  /**
   * Set the unchecked value for the Checkbox.
   */
  falseValue?: CheckboxValue;
  /**
   * Set the Checkbox width to 100%.
   */
  full?: boolean;
  /**
   * Set the Checkbox label.
   */
  label?: string;
  /**
   * Set the Checkbox label additional properties.
   */
  labelProps?: object;
  /**
   * Set the message for the Checkbox.
   */
  message?: string;
  /**
   * Set the value using v-model two way data binding.
   */
  modelValue?: CheckboxValue | CheckboxValue[];
  /**
   * Set the Checkbox tabindex.
   */
  tabindex?: string | number;
  /**
   * Set the checked value for the Checkbox.
   */
  trueValue?: CheckboxValue;
  /**
   * Set the value for the Checkbox without using v-model two way data binding.
   */
  value?: CheckboxValue;
}

type CheckboxSlots = {
  /**
   * Slot used to create custom label, since label property only accept string.
   */
  label: Slot;
  /**
   * Slot used to create custom message, since message property only accept string.
   */
  message: Slot;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Checkbox>(), {
  disabled: false,
  full: false,
  tabindex: 0,
  trueValue: undefined, // Redeclared with default since defineProps set the default value of any undefined props with boolean type as false.
  falseValue: undefined, // Redeclared with default since defineProps set the default value of any undefined props with boolean type as false.
});

const emits = defineEmits([
  /**
   * Callback for v-model two-way data binding, **used internally**, Storybook shows by default.
   */
  'update:modelValue',
  /**
   * Callback when the Checkbox state is changed, return Checkbox value.
   */
  'change',
]);

defineSlots<CheckboxSlots>();

const instance     = getCurrentInstance();
const isControlled = computed(() => 'modelValue' in (instance?.vnode.props || {}));
const checkedValue = computed(() => {
  if (props.trueValue !== undefined) return props.trueValue;

  if (props.value !== undefined) return props.value;

  return true;
});
const valueArray   = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});
const isArray   = computed(() => props.modelValue instanceof Array);
const isChecked = computed(() => {
  if (checkedValue.value) {
    if (isControlled.value) return props.modelValue === checkedValue.value;
  }
});
const containerRef = ref<HTMLLabelElement | null>(null);
const inputRef     = ref<HTMLInputElement | null>(null);
const inListItem   = ref(false);

const classes = computed(() => ({
  'cp-form-checkbox'      : true,
  'cp-form-checkbox--full': props.full,
  'cp-form-checkbox--list': inListItem.value,
}));

const handleChange = (e: Event) => {
  e.stopPropagation();

  const checked = (e.target as HTMLInputElement).checked;
  let updateValue;

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
  emits('change', e);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') inputRef.value?.click();
};
</script>

<template>
  <div
    ref="containerRef"
    v-bind="containerProps"
    :class="classes"
    :data-cp-error="error ? error : undefined"
    :data-cp-disabled="disabled ? disabled : undefined"
  >
    <label
      v-bind="labelProps"
      class="cp-form-checkbox__field"
      @keydown="handleKeydown"
    >
      <div class="cp-form-checkbox__input">
        <input
          v-if="isControlled && isArray"
          ref="inputRef"
          type="checkbox"
          v-bind="$attrs"
          v-model="valueArray"
          :tabindex="tabindex"
          :checked="valueArray === checkedValue"
          :disabled="disabled"
          :value="checkedValue"
        />
        <input
          v-else
          ref="inputRef"
          type="checkbox"
          v-bind="$attrs"
          :tabindex="tabindex"
          :checked="isChecked"
          :disabled="disabled"
          :value="checkedValue"
          @change="handleChange"
        />
        <div class="cp-form-checkbox__box">
          <ComposIcon :icon="Check" />
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

<style src="@/assets/form.scss" />
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

  &[data-cp-error] {
    .cp-form-checkbox__box {
      border-color: var(--color-red-4);
    }

    input[type="checkbox"] {
      &:checked + .cp-form-checkbox__box {
        background-color: var(--color-red-4);
        border-color: var(--color-red-4);
      }
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
