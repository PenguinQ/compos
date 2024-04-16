import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import Text from '@components/Text';
import Textarea from './Textarea.vue';

const meta: Meta<typeof Textarea> = {
  component: Textarea,
  tags: ['autodocs'],
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
      control: 'number'
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
      table: {
        disable: true,
      },
    },
    ['modelValue']: {
      table: {
        disable: true,
      },
    },
    ['update:modelValue']: {
      table: {
        disable: true,
      },
    },
  },
  args: {
    containerProps: {},
    disabled: false,
    error: false,
    label: '',
    labelProps: {},
    margin: '',
    maxRows: undefined,
    message: '',
    minRows: 4,
    placeholder: '',
    success: false,
  },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  render: (args) => ({
    components: { Textarea },
    setup() {
      return { args };
    },
    template: `<Textarea v-bind="args" />`,
  }),
};

export const UsingVModel: Story = {
  render: (args) => ({
    components: { Text, Textarea },
    setup() {
      const value = ref('');

      return { args, value };
    },
    template: `
      <Text>v-model: {{ value }}</Text>
      <Textarea v-bind="args" v-model="value" />
    `,
  }),
};

UsingVModel.storyName = 'Using v-model (recommended)';

export const UsingValue: Story = {
  render: (args) => ({
    components: { Text, Textarea },
    setup() {
      const input_value = ref('');

      const handleInput = (e: Event) => {
        input_value.value = (e.target as HTMLTextAreaElement).value;
      };

      return { args, input_value, handleInput };
    },
    template: `
      <Text>value: {{ input_value }}</Text>
      <Textarea v-bind="args" :value="input_value" @input="handleInput" />
    `,
  }),
};

UsingValue.storyName = 'Using value';
