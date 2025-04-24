<script setup lang="ts">
import { computed, ref } from 'vue';
import type { InputHTMLAttributes } from 'vue';

import { getSameSiblings, hasClass, setElementsAttribute } from '@/helpers';

export interface Radio extends /* @vue-ignore */ InputHTMLAttributes {
  /**
   * Set the Radio container additional properties.
   */
  containerProps?: object;
  /**
   * Set the Radio to disabled state.
   */
  disabled?: boolean;
  /**
   * Set the unchecked value for the Checkbox.
   */
  falseValue?: string | number | boolean;
  /**
   * Set the Radio width to 100%.
   */
  full?: boolean;
  /**
   * Set the Radio label.
   */
  label?: string;
  /**
   * Set the value using v-model two way data binding.
   */
  modelValue?: string | number | boolean;
  /**
   * Set the Radio name attribute.
   */
  name?: string;
  /**
   * Set the Radio tabindex.
   */
  tabindex?: string | number
  /**
   * Set the checked value for the Checkbox.
   */
  trueValue?: string | number | boolean;
  /**
   * Set the value for the Radio without using v-model two way data binding.
   */
  value?: string | number | boolean;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Radio>(), {
  disabled  : false,
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

const containerRef = ref<HTMLLabelElement | null>(null);
const inputRef     = ref<HTMLInputElement | null>(null);
const isControlled = computed(() => props.modelValue !== undefined);
const radioValue   = computed(() => {
  if (props.trueValue !== undefined) return props.trueValue;

  if (props.value !== undefined) return props.value;

  return true;
});
const isChecked = computed(() => {
  if (isControlled.value && radioValue.value !== undefined) return props.modelValue === radioValue.value;

  return false;
});
const classes = computed(() => ({
  'cp-form-radio'      : true,
  'cp-form-radio--full': props.full,
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
    const inGroup = hasClass('cp-radio-group', containerRef.value?.parentElement as HTMLElement);

    if (!inGroup) {
      if (props.name) {
        const siblings = getSameSiblings(containerRef.value as HTMLElement);

        setElementsAttribute(siblings, {
          target: 'input',
          attributeName: 'aria-checked',
          attributeValue: 'false',
        });
      }

      target.setAttribute('aria-checked', 'true');
    }
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') inputRef.value?.click();
};
</script>

<template>
  <label
    ref="containerRef"
    v-bind="containerProps"
    :class="classes"
    :data-cp-disabled="disabled ? disabled : undefined"
    @keydown="handleKeydown"
  >
    <div class="cp-form-radio__container">
      <input
        ref="inputRef"
        type="radio"
        v-bind="$attrs"
        :checked="($attrs['checked'] as 'true' | 'false') || isChecked"
        :name="name"
        :disabled="disabled"
        :value="radioValue"
        :aria-disabled="disabled"
        :aria-label="label"
        :aria-checked="($attrs['aria-checked'] as 'true' | 'false' | 'mixed') || isChecked"
        @change="handleChange"
      />
      <div class="cp-form-radio__circle" />
    </div>
    <span v-if="label" class="cp-form-radio__label">{{ label }}</span>
    <div v-if="$slots.label" class="cp-form-radio__label">
      <slot name="label"></slot>
    </div>
  </label>
</template>

<style lang="scss">
.cp-form-radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 0;

  &:focus-within .cp-form-radio__circle {
    outline: 2px solid var(--color-blue-5);
  }

  &__container {
    width: 20px;
    height: 20px;
    position: relative;
    flex-shrink: 0;
  }

  input[type="radio"] {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;

    &:checked + .cp-form-radio__circle {
      border-color: var(--color-black);

      &::before {
        transform: scale(1);
      }
    }
  }

  &__circle {
    width: 100%;
    height: 100%;
    border: 2px solid var(--color-black);
    border-radius: 50%;
    position: relative;
    padding: 2px;

    &::before {
      content: "";
      width: 100%;
      height: 100%;
      display: block;
      background-color: var(--color-black);
      border-radius: 50%;
      transform: scale(0);
      transition: transform 100ms cubic-bezier(0.63, 0.01, 0.29, 1);
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
  }

  &[data-cp-disabled] {
    cursor: not-allowed;

    input[type="radio"] + .cp-form-radio__circle,
    input[type="radio"]:checked + .cp-form-radio__circle {
      background-color: var(--color-stone-2);
      border-color: var(--color-stone-3);

      &::before {
        background-color: var(--color-stone-3);
      }
    }
  }
}
</style>
