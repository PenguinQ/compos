import type { Meta, StoryObj } from '@storybook/vue3';

import Label from './Label.vue';

const meta: Meta<typeof Label> = {
  component: Label,
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
    default: 'Label',
  },
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  render: (args) => ({
    components: { Label },
    setup() {
      return { args };
    },
    template: `<Label v-bind="args">{{ args.default }}</Label>`,
  }),
};
