import type { Meta, StoryObj } from '@storybook/vue3';
import { ComponentProps } from 'vue-component-type-helpers';

import ComposIcon, { CashCoin } from '@components/Icons';
import IconList from './IconList.vue';

type IconProps = ComponentProps<typeof ComposIcon>;

const meta: Meta<IconProps> = {
  title: 'Icons',
  component: ComposIcon,
};

export default meta;

type PlaygroundStory = StoryObj<IconProps>;

export const Playground: PlaygroundStory = {
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
