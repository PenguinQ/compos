import type { Meta, StoryObj } from '@storybook/vue3';

import Icons from './Icons.vue';
import ComposIcon, { Archive } from '@components/Icons';

const meta: Meta<typeof ComposIcon> = {
  component: ComposIcon,
  argTypes: {
    size: {
      control: 'text',
    },
    color: {
      conrol: 'text',
    },
  },
  args: {
    size: '48px',
    color: '',
  },
};

export default meta;

type Story = StoryObj<typeof ComposIcon>;

export const Default: Story = {
  render: (args) => ({
    components: { ComposIcon },
    setup() {
      return { args, Archive };
    },
    template: `
      <ComposIcon v-bind="args" :icon="Archive" />
    `,
  }),
};

export const List: Story = {
  tags: ['!dev'], // Hide from sidebar
  render: (args) => ({
    components: { Icons },
    setup() {
      return { args };
    },
    template: `<Icons />`,
  }),
};
