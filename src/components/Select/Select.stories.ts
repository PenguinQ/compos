import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import Select from './Select.vue';

const meta: Meta<typeof Select> = {
  component: Select,
  argTypes: {
    append: {
      control: 'text',
    },
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
    message: {
      control: 'text',
    },
    prepend: {
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
  },
  args: {
    append: '',
    containerProps: {},
    disabled: false,
    error: false,
    label: '',
    labelProps: {},
    margin: '',
    message: '',
    prepend: '',
    success: false,
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: (args) => ({
    components: { Select },
    setup() {
      return { args };
    },
    template: `
      <Select v-bind="args">
        <option value="">Option 1</option>
        <option value="">Option 2</option>
        <option value="">Option 3</option>
      </Select>
    `,
  }),
};
