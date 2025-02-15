<script setup lang="ts">
import { computed, Fragment } from 'vue';
import type { Slot, VNode } from 'vue';
import type * as CSSType from 'csstype'

type RadioGroup = {
  /**
   * Set the RadioGroup CSS margin.
   */
  margin?: CSSType.Property.Margin;
  /**
   * Set the RadioGroup CSS padding.
   */
  padding?: CSSType.Property.Padding;
  /**
   * Set the value of all Radio in the group using v-model two way data binding.
   */
  modelValue?: string | number | boolean;
};

type RadioSlots = {
  default?: Slot;
};

const props = defineProps<RadioGroup>();
const slots = defineSlots<RadioSlots>();

const emits = defineEmits([
  /**
   * Callback for v-model two-way data binding, **used internally**, Storybook shows by default.
   */
  'update:modelValue',
]);

const groupId = `radio-group-${crypto.randomUUID().slice(0, 8)}`;
const radios = computed(() => {
  if (!slots.default) return [];

  return slots.default().map(vnode => {
    if (vnode.type === Fragment) return vnode.children;

    return vnode;
  }).flat();
});

const handleChange = (e: Event, vnode: VNode) => {
  const { props } = vnode;
  const target    = e.target as HTMLInputElement;
  let targetValue = props?.value;

  if (target.checked) {
    if (props?.trueValue !== undefined) {
      targetValue = props.trueValue;
    } else if (props?.value !== undefined) {
      targetValue = props.value;
    } else {
      targetValue = true;
    }
  } else {
    if (props?.falseValue !== undefined) {
      targetValue = props.falseValue;
    } else {
      targetValue = false;
    }
  }

  emits('update:modelValue', targetValue);
};

const isChecked = (vnode: VNode) => {
  const { props: vnodeProps } = vnode;

  if (vnodeProps?.trueValue !== undefined) {
    return vnodeProps.trueValue === props.modelValue;
  }

  return vnodeProps?.value === props.modelValue;
};
</script>

<template>
  <div
    class="cp-radio-group"
    :style="{ margin, padding }"
    role="radiogroup"
  >
    <component
      :key="index"
      v-if="$slots.default"
      v-for="(radio, index) in (radios as VNode[])"
      :is="radio"
      :name="groupId"
      :checked="isChecked(radio as VNode)"
      :aria-checked="isChecked(radio as VNode)"
      @change="handleChange($event, radio as VNode)"
    />
  </div>
</template>

<style lang="scss">
.cp-radio-group {
  display: flex;
  flex-direction: column;
  margin: 8px 0;
}
</style>
