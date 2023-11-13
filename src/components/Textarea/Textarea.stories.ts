import type { Meta, StoryObj } from '@storybook/vue3';

import Textarea from './Textarea.vue';

const meta: Meta<typeof Textarea> = {
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    class: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
    focus: {
      control: 'boolean',
    },
    label: {
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
      control: 'text',
    },
    ['modelValue']: {
      table: {
        disable: true,
      },
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
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  render: (args) => ({
    components: { Textarea },
    setup() {
      return { args };
    },
    template: '<Textarea v-bind="args" />',
  }),
};
