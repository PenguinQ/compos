import type { Meta, StoryObj } from '@storybook/vue3';

import Button from './Button.vue';
import ComposIcon, { Archive } from '@components/Icons';

const meta: Meta<typeof Button> = {
  component: Button,
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
  },
  args: {
    color: undefined,
    disabled: false,
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
    template: `
      <Button v-bind="args">{{ args.default }}</Button>
    `,
  }),
  argTypes: {
    default: {
      control: 'text',
    },
  },
  args: {
    default: 'Button',
  },
};

export const IconButton: Story = {
  render: (args) => ({
    components: { Button, ComposIcon },
    setup() {
      return { args, Archive };
    },
    template: `
      <Button v-bind="args">
        <ComposIcon :icon="Archive" />
      </Button>
    `,
  }),
  argTypes: {
    icon: {
      control: 'boolean',
    },
  },
  args: {
    icon: true,
  },
};
