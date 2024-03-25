import type { Meta, StoryObj } from '@storybook/vue3';

import Button from './Button.vue';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['red', 'green', 'blue'],
    },
    disabled: {
      control: 'boolean',
    },
    variant: {
      control: 'select',
      options: ['outline', 'text'],
    },
    default: {
      control: 'text',
    },
  },
  args: {
    color: '',
    disabled: false,
    default: 'Button',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: `<Button v-bind="args">{{ args.default }}</Button>`,
  }),
};
