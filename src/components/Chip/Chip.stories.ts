import type { Meta, StoryObj } from '@storybook/vue3';

import Chip from './Chip.vue';

const meta: Meta<typeof Chip> = {
  component: Chip,
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
    default: 'Remembrance',
  },
};

export default meta;

type Story = StoryObj<typeof Chip>;

export const Playground: Story = {
  render: (args) => ({
    components: { Chip },
    setup() {
      return { args };
    },
    template: `<Chip v-bind="args">{{ args.default }}</Chip>`,
  }),
};
