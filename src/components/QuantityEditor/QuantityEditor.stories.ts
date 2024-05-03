import type { Meta, StoryObj } from '@storybook/vue3';

import QuantityEditor from './QuantityEditor.vue';

const meta: Meta<typeof QuantityEditor> = {
  component: QuantityEditor,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    labelProps: {
      control: 'object',
    },
    message: {
      control: 'text',
    },
  },
  args: {
    disabled: false,
    label: '',
    labelProps: {},
    message: '',
  },
};

export default meta;
type Story = StoryObj<typeof QuantityEditor>;

export const Default: Story = {
  render: (args) => ({
    components: { QuantityEditor },
    setup() {
      return { args };
    },
    template: `<QuantityEditor v-bind="args" />`,
  }),
};
