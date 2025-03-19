import { ref, watch } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { Text } from '@components';
import QuantityEditor from './QuantityEditor.vue';

type QuantityEditorProps = ComponentProps<typeof QuantityEditor>;

const meta: Meta<QuantityEditorProps> = {
  component: QuantityEditor,
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    labelProps: {
      control: 'object',
    },
    max: {
      control: 'number',
    },
    min: {
      control: 'number',
    },
    message: {
      control: 'text',
    },
    modelValue: {
      name: 'v-model',
      control: 'number',
    },
    small: {
      control: 'boolean',
    },
    step: {
      control: 'number',
    },
    value: {
      control: 'text',
    },
    width: {
      control: 'text',
    },
  },
  args: {
    disabled: false,
    error: false,
    min: 0,
    small: false,
    step: 1,
    width: 'auto',
  },
};

export default meta;

type Story = StoryObj<QuantityEditorProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { QuantityEditor, Text },
    setup() {
      const quantityValue = ref(args.modelValue);

      return { args, quantityValue };
    },
    template: `
      <Text>QuantityEditor value: {{ quantityValue }}</Text>
      <QuantityEditor v-bind="args" v-model="quantityValue" />
    `,
  }),
  args: {
    modelValue: 0,
  },
};

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: { QuantityEditor, Text },
    setup() {
      const quantityValue = ref(0);

      return { quantityValue };
    },
    template: `
      <Text>QuantityEditor value: {{ quantityValue }}</Text>
      <QuantityEditor v-model="quantityValue" />
    `,
  }),
};

export const DocNonTWDB = {
  tags: ['!dev'],
  render: () => ({
    components: { QuantityEditor, Text },
    setup() {
      const quantityValue = ref(0);

      const handleButtons = (value: string) => {
        quantityValue.value = parseInt(value);
      };

      const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;

        quantityValue.value = target.value as any;
      };

      return { quantityValue, handleInput, handleButtons };
    },
    template: `
      <Text>QuantityEditor value: {{ quantityValue }}</Text>
      <QuantityEditor
        :value="quantityValue"
        @input="handleInput"
        @clickIncrement="handleButtons"
        @clickDecrement="handleButtons"
      />
    `,
  }),
};
