<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { InputHTMLAttributes } from 'vue';

import { IconCheck } from '@icons';

interface Props extends /* @vue-ignore */ InputHTMLAttributes {
  class?: string;
  containerProps?: object;
  disabled?: boolean;
  falseValue?: string | number | boolean;
  full?: boolean;
  label?: string;
  modelValue?: string | number | boolean | [];
  tabindex?: string | number;
  trueValue?: string | number | boolean;
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
const checkboxClass = computed(() => ({
  'cp-checkbox': true,
  'cp-checkbox--full': props.full,
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
  <label
    ref="container"
    v-bind="containerProps"
    :class="[checkboxClass, $props.class]"
    :data-cp-disabled="disabled ? disabled : undefined"
    @keydown="handleKeydown"
  >
    <div class="cp-checkbox__container">
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
      <div class="cp-checkbox__box">
        <IconCheck color="var(--color-white)" />
      </div>
    </div>
    <span v-if="label" class="cp-checkbox__label">{{ label }}</span>
    <div v-if="$slots.label" class="cp-checkbox__label">
      <slot name="label"></slot>
    </div>
  </label>
</template>

<style lang="scss">
.cp-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &__container {
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

    &:checked + .cp-checkbox__box {
      background-color: var(--color-black);
      border-color: var(--color-black);

      .cp-icon {
        opacity: 1;
      }
    }
  }

  &__box {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-black);
    border-radius: 4px;
    position: absolute;
    inset: 0;

    .cp-icon {
      width: 100%;
      height: 100%;
      opacity: 0;
    }
  }

  &__label {
    color: var(--color-black);
    font-size: var(--text-body-medium-size);
    line-height: var(--text-body-medium-height);
    font-weight: 400;
    flex: 1;
  }

  &--full {
    width: 100%;
  }

  &[data-cp-disabled] {
    cursor: not-allowed;

    input[type="checkbox"] + .cp-checkbox__box,
    input[type="checkbox"]:checked + .cp-checkbox__box {
      background-color: var(--color-disabled-background);
      border-color: var(--color-disabled-border);

      .cp-icon {
        fill: var(--color-disabled-border);
      }
    }
  }
}
</style>
