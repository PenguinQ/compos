import type { Meta, StoryObj } from '@storybook/vue3';

import ComposIcon, { CashCoin } from '@components/Icons';
import IconList from './IconList.vue';

type IconProps = typeof ComposIcon;

const meta: Meta<IconProps> = {
  title: 'General/Icons',
  component: ComposIcon,
};

export default meta;

type Story = StoryObj<IconProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { ComposIcon },
    setup() {
      return { args, CashCoin };
    },
    template: `
      <ComposIcon v-bind="args" :icon="CashCoin" />
    `,
  }),
  argTypes: {
    size: {
      control: 'text',
    },
    color: {
      control: 'text',
    },
  },
};

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: { ComposIcon },
    setup() {
      return { CashCoin };
    },
    template: `
      <ComposIcon :icon="CashCoin" />
    `,
  }),
};

export const List = {
  name: 'List',
  render: () => ({
    components: { IconList },
    setup() {
      return {};
    },
    template: `
      <IconList />
    `,
  }),
};
