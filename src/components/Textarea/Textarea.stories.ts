import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { Text } from '@components';
import Textarea from './Textarea.vue';

type TextareaProps = ComponentProps<typeof Textarea>;

const meta: Meta<TextareaProps> = {
  component: Textarea,
  argTypes: {
    containerProps: {
      control: 'object',
    },
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
    margin: {
      control: 'text',
    },
    maxRows: {
      control: 'number',
    },
    message: {
      control: 'text',
    },
    minRows: {
      control: 'number',
    },
    placeholder: {
      control: 'text',
    },
    success: {
      control: 'boolean',
    },
    value: {
      control: 'text',
    },
    modelValue: {
      name: 'v-model',
      control: 'text',
    },
  },
  args: {
    disabled: false,
    error: false,
    success: false,
    minRows: 4,
  },
};

export default meta;

type Story = StoryObj<TextareaProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { Textarea },
    setup() {
      return { args };
    },
    template: `<Textarea v-bind="args" />`,
  }),
};

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: { Text, Textarea },
    setup() {
      const value = ref('');

      return { value };
    },
    template: `
      <Text>Textarea value: {{ value ? value : '-' }}</Text>
      <Textarea v-model="value" />
    `,
  }),
};

export const DocNonTWDB = {
  tags: ['!dev'],
  render: () => ({
    components: { Text, Textarea },
    setup() {
      const value = ref('');

      const handleInput = (e: Event) => {
        value.value = (e.target as HTMLInputElement).value;
      };

      return { value, handleInput };
    },
    template: `
      <Text>Textarea value: {{ value ? value : '-' }}</Text>
      <Textarea @input="handleInput" />
    `,
  }),
};
