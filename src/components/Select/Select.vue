<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import type { Slot, OptionHTMLAttributes } from 'vue';
import type * as CSS from 'csstype'

import ComposIcon, { ChevronDown, ChevronExpand } from '@/components/Icons';

import { createLoopKey, hasClassStartsWith, instanceCounters } from '@/helpers';

type SelectOptions = Omit<OptionHTMLAttributes, 'selected'> & {
  text: string;
};

type Select = {
  /**
   * Set additional properties for the Select container.
   */
  containerProps?: object;
  /**
   * Set the Select into disabled state.
   */
  disabled?: boolean;
  /**
   * Set the Select into error state.
   */
  error?: boolean;
  /**
   * Set the Select id.
   */
  id?: string;
  /**
   * Set the Select label.
   */
  label?: string;
  /**
   * Set the Select label additional properties.
   */
  labelProps?: object;
  /**
   * Set the Select CSS margin.
   */
  margin?: CSS.Property.Margin;
  /**
   * Set the Select message.
   */
  message?: string;
  /**
   * Set the Select options in object way.
   */
  options?: SelectOptions[],
  /**
   * Set the value using v-model two way data binding.
   */
  modelValue?: string | number;
  /**
   * Set the Select size.
   */
  size?: 'small';
  /**
   * Set the Select into success state.
   */
  success?: boolean;
  /**
   * Set the value for the Select without using v-model two way data binding.
   */
  value?: string | number;
  /**
   * Set the Select into list mode, to be used inside `ListItem`.
   */
  mode?: 'list';
};

type SelectSlots = {
  /**
   * Slot used to render `option` tag.
   */
  default?: Slot;
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

const props = withDefaults(defineProps<Select>(), {
  disabled: false,
  error   : false,
  success : false,
});

const emits = defineEmits([
  /**
   * Callback for v-model two-way data binding, **used internally**, Storybook shows by default.
   */
  'update:modelValue',
  /**
   * Callback when the value is changed, usually used if you don't want to use v-model two-way data binding.
   */
  'change',
  /**
   * Callback when the value is inputted, usually used if you don't want to use v-model two-way data binding.
   */
  'input',
]);

defineSlots<SelectSlots>();

const instance     = ref(instanceCounters('select'));
const containerRef = ref<HTMLDivElement | null>(null);
const selectRef    = ref<HTMLSelectElement | null>(null);
const inListItem   = ref(false);
const classes      = computed(() => ({
  'cp-form'              : true,
  'cp-form-select'       : true,
  'cp-form-select--small': props.size === 'small',
}));

onMounted(() => {
  const parent = containerRef.value?.parentElement as HTMLElement;

  inListItem.value = parent ? hasClassStartsWith('cp-list-item__', parent) : false;
});

const handleChange = (e: Event) => {
  emits('change', (e.target as HTMLSelectElement).value);
};

const handleInput = (e: Event) => {
  const target = e.target as HTMLSelectElement;

  emits('input', target.value);
  emits('update:modelValue', target.value);
};
</script>

<template>
  <div
    ref="containerRef"
    v-bind="containerProps"
    :class="classes"
    :data-cp-disabled="disabled ? true : undefined"
    :data-cp-error="error ? true : undefined"
    :data-cp-success="success ? true : undefined"
    :style="{ margin }"
  >
    <label v-if="label || $slots.label" v-bind="labelProps" class="cp-form-label">
      <slot name="label" />
      {{ label }}
    </label>
    <div class="cp-form-container">
      <select
        ref="selectRef"
        v-bind="$attrs"
        class="cp-form-field"
        :id="id"
        :disabled="disabled"
        :value="value || modelValue"
        @input="handleInput"
        @change="handleChange"
      >
        <template v-if="options">
          <option
            v-for="({ text, ...rest }, index) in options"
            :key="createLoopKey({ id, index, prefix: instance, suffix: 'option' })"
            v-bind="rest"
          >
            {{ text }}
          </option>
        </template>
        <slot v-else />
      </select>
      <ComposIcon :icon="inListItem ? ChevronExpand : ChevronDown" class="cp-form-select__icon" />
    </div>
    <div class="cp-form-message" v-if="mode !== 'list' && (message || $slots.message)">
      <slot name="message" />
      {{ message }}
    </div>
  </div>
</template>

<style src="@/assets/component.form.scss" />
<style lang="scss">
.cp-form-select {
  .cp-form-field {
    color: var(--color-black);
    background-color: transparent;
    border: none;
    appearance: none;
    position: relative;
    z-index: 2;
    padding: 0;
    outline: none;
    padding-top: 14px;
    padding-bottom: 14px;
    padding-inline-start: 12px;
    padding-inline-end: 42px;

    & + compos-icon {
      width: 18px;
      height: 18px;
      position: absolute;
      top: 50%;
      right: 0;
      z-index: 1;
      margin-inline-end: 12px;
      transition: transform var(--transition-duration-very-fast) var(--transition-timing-function);
      transform: translateY(-50%);
    }

    &:focus + compos-icon {
      transform: translateY(-50%) rotate(180deg);
    }
  }

  &[data-cp-selected] {
    .cp-form-field {
      color: var(--color-black);
    }
  }

  &--small {
    .cp-form-field {
      @include text-body-md;
      padding-top: 12px;
      padding-bottom: 12px;
    }
  }
}
</style>
