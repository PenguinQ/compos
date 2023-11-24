import type { Meta, StoryObj } from '@storybook/vue3';

import Textfield from './Textfield.vue';

const meta: Meta<typeof Textfield> = {
  component: Textfield,
  tags: ['autodocs'],
  argTypes: {
    append: {
      control: 'text',
    },
    class: {
      control: 'text',
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
    message: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    prepend: {
      control: 'text',
    },
    success: {
      control: 'boolean',
    },
    type: {
      control: 'select',
      options: ['email', 'number', 'password', 'tel', 'text'],
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
    type: 'text',
  },
};

export default meta;
type Story = StoryObj<typeof Textfield>;

export const Default: Story = {
  render: (args) => ({
    components: { Textfield },
    setup() {
      return { args };
    },
    template: `<Textfield v-bind="args" autofocus />`,
  }),
};
