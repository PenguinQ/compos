import type { Meta, StoryObj } from '@storybook/vue3';

import Chips from './Chips.vue';

const meta: Meta<typeof Chips> = {
  component: Chips,
  tags: ['autodocs'],
  argTypes: {
    default: {
      control: 'text',
    },
    color: {
      control: 'select',
      options: ['red', 'green', 'blue'],
    },
    variant: {
      control: 'select',
      options: ['outline'],
    },
  },
  args: {
    default: 'Chips',
  },
};

export default meta;

type Story = StoryObj<typeof Chips>;

export const Default: Story = {
  render: (args) => ({
    components: { Chips },
    setup() {
      return { args };
    },
    template: `<Chips v-bind="args">{{ args.default }}</Chips>`,
  }),
};
