import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import Shimmer from './Shimmer.vue';
import Bar from './Bar.vue';

type ShimmerProps = ComponentProps<typeof Shimmer>;
type BarProps = ComponentProps<typeof Bar>;

const meta: Meta<ShimmerProps> = {
  component: Shimmer,
  subcomponents: { Bar },
};

export default meta;

type StoryShimmer = StoryObj<ShimmerProps>;
type StoryBar = StoryObj<BarProps>;

export const ShimmerPlayground: StoryShimmer = {
  render: (args) => ({
    components: { Shimmer },
    setup() {
      return { args };
    },
    template: `<Shimmer v-bind="args" />`,
  }),
  argTypes: {
    animate: {
      control: 'boolean',
    },
    block: {
      control: 'boolean',
    },
    width: {
      control: 'text',
    },
    height: {
      control: 'text',
    },
    radius: {
      control: 'text',
    },
    margin: {
      control: 'text',
    },
  },
  args: {
    animate: false,
  },
};

ShimmerPlayground.storyName = 'Shimmer';

export const BarPlayground: StoryBar = {
  storyName: 'Bar',
  render: (args) => ({
    components: { Bar },
    setup() {
      return { args };
    },
    template: `<Bar v-bind="args" />`,
  }),
  argTypes: {
    color: {
      control: 'text',
    },
    height: {
      control: 'text',
    },
    margin: {
      control: 'text',
    },
    size: {
      control: 'text',
    },
    width: {
      control: 'text',
    },
  },
  args: {
    color: 'var(--color-black)',
    size: '56px',
  },
};

BarPlayground.storyName = 'Bar';
