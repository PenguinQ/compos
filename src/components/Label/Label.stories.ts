import type { Meta, StoryObj } from '@storybook/vue3';

import Label from './Label.vue';

const meta: Meta<typeof Label> = {
  component: Label,
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

type Story = StoryObj<typeof Label>;

export const Playground: Story = {
  render: (args) => ({
    components: { Label },
    setup() {
      return { args };
    },
    template: `<Label v-bind="args">{{ args.default }}</Label>`,
  }),
};
