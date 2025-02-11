import { ref } from 'vue';
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
      control: 'text',
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
      control: 'number',
    },
  },
  args: {
    disabled: false,
    error: false,
    min: 0,
    small: false,
    step: 1,
    width: 2,
  },
};

export default meta;

type Story = StoryObj<QuantityEditorProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { QuantityEditor },
    setup() {
      return { args };
    },
    template: `<QuantityEditor v-bind="args" />`,
  }),
};

export const DocUsage = {
  render: () => ({
    components: { QuantityEditor, Text },
    setup() {
      const quantityValue = ref('0');

      return { quantityValue };
    },
    template: `
      <Text>QuantityEditor value: {{ quantityValue ? quantityValue : '-' }}</Text>
      <QuantityEditor v-model="quantityValue" />
    `,
  }),
};

export const DocNonTWDB = {
  render: () => ({
    components: { QuantityEditor, Text },
    setup() {
      const quantityValue = ref(0);

      const handleButtons = (value: string) => {
        quantityValue.value = parseInt(value);
      };

      return { quantityValue, handleButtons };
    },
    template: `
      <Text>QuantityEditor value: {{ quantityValue ? quantityValue : '-' }}</Text>
      <QuantityEditor
        @clickIncrement="handleButtons"
        @clickDecrement="handleButtons"
      />
    `,
  }),
};
