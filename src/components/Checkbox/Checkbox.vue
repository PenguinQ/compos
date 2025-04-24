<script setup lang="ts">
import { computed, ref } from 'vue';
import type { InputHTMLAttributes, Slot } from 'vue';

import ComposIcon, { Check } from '@/components/Icons';

type CheckboxValue = string | number | boolean;

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
  label?: Slot;
  /**
   * Slot used to create custom message, since message property only accept string.
   */
  message?: Slot;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Checkbox>(), {
  disabled  : false,
  error     : false,
  full      : false,
  tabindex  : 0,
  modelValue: undefined,
  trueValue : undefined, // Redeclared with default since defineProps set the default value of any undefined props with boolean type as false.
  falseValue: undefined, // Redeclared with default since defineProps set the default value of any undefined props with boolean type as false.
  value     : undefined, // Redeclared with default since defineProps set the default value of any undefined props with boolean type as false.
});

const emits = defineEmits([
  /**
   * Callback for v-model two-way data binding, **used internally**, Storybook shows by default.
   */
  'update:modelValue',
]);

defineSlots<CheckboxSlots>();

const containerRef  = ref<HTMLLabelElement | null>(null);
const inputRef      = ref<HTMLInputElement | null>(null);
const inListItem    = ref(false);
const isControlled  = computed(() => props.modelValue !== undefined);
const isArray       = computed(() => props.modelValue instanceof Array);
const checkboxValue = computed(() => {
  if (props.trueValue !== undefined) return props.trueValue;

  if (props.value !== undefined) return props.value;

  return true;
});
const checkboxArrayValues = computed({
  get() {
    return props.modelValue as CheckboxValue[];
  },
  set(value) {
    emits('update:modelValue', value);
  },
});
const isChecked = computed(() => {
  if (checkboxValue.value !== undefined && isControlled.value) return props.modelValue === checkboxValue.value;

  return false;
});
const classes = computed(() => ({
  'cp-form-checkbox'      : true,
  'cp-form-checkbox--full': props.full,
  'cp-form-checkbox--list': inListItem.value,
}));

const handleChange = (e: Event) => {
  e.stopPropagation();

  const target  = e.target as HTMLInputElement;
  const checked = target.checked;
  let updateValue;

  if (isControlled.value) {
    if (checked) {
      if (props.trueValue !== undefined) {
        updateValue = props.trueValue;
      } else if (props.value !== undefined) {
        updateValue = props.value;
      } else {
        updateValue = true;
      }
    } else {
      if (props.falseValue !== undefined) {
        updateValue = props.falseValue;
      } else {
        updateValue = false;
      }
    }

    emits('update:modelValue', updateValue);
  } else {
    // Update input aria-checked attribute if the Radio is uncontrolled element
    target.setAttribute('aria-checked', `${checked}`);
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') inputRef.value?.click();
};

const inArray = (array: CheckboxValue[], value: CheckboxValue) => {
  return array.includes(value);
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
          v-model="checkboxArrayValues"
          :tabindex="tabindex"
          :checked="inArray(checkboxArrayValues, checkboxValue)"
          :disabled="disabled"
          :value="checkboxValue"
          :aria-disabled="disabled"
          :aria-label="label"
          :aria-checked="($attrs['aria-checked'] as 'true' | 'false' | 'mixed') || inArray(checkboxArrayValues, checkboxValue)"
        />
        <input
          v-else
          ref="inputRef"
          type="checkbox"
          v-bind="$attrs"
          :tabindex="tabindex"
          :checked="($attrs['checked'] as 'true' | 'false') || isChecked"
          :disabled="disabled"
          :value="checkboxValue"
          :aria-disabled="disabled"
          :aria-label="label"
          :aria-checked="($attrs['aria-checked'] as 'true' | 'false' | 'mixed') || isChecked"
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
    <div class="cp-form-message" v-if="message || $slots.message">
      <template v-if="!$slots.message">{{ message }}</template>
      <slot name="message" />
    </div>
  </div>
</template>

<style src="@/assets/component.form.scss" />
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
      outline: 2px solid var(--color-blue-5);
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
      background-color: var(--color-stone-2);
      border-color: var(--color-stone-3);

      compos-icon {
        color: var(--color-stone-3);
      }
    }
  }
}
</style>
