<script setup lang="ts">
import type { Slot } from 'vue';
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

defineProps<RadioGroup>();
defineSlots<RadioSlots>();

const emits = defineEmits(['update:modelValue']);

const groupId = `radio-group-${crypto.randomUUID().slice(0, 8)}`;

const handleClick = (e: Event) => {
  const target = e.target as HTMLInputElement;

  emits('update:modelValue', target.value);
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
      v-for="(radio, index) in $slots.default()"
      :is="radio"
      :name="groupId"
      :checked="modelValue === radio.props?.value ? true : false"
      :aria-checked="modelValue === radio.props?.value ? true : false"
      @click="handleClick"
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
