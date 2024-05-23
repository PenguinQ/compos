import type { Meta, StoryObj } from '@storybook/vue3';

import Shimmer from './Shimmer.vue';
import Bar from './Bar.vue';

const meta: Meta<typeof Shimmer> = {
  component: Shimmer,
  tags: ['autodocs'],
};

export default meta;

type StoryShimmer = StoryObj<typeof Shimmer>;
type StoryBar = StoryObj<typeof Bar>;

export const ShimmerStory: StoryShimmer = {
  render: (args) => ({
    components: { Shimmer },
    setup() {
      return { args };
    },
    template: `
      <Shimmer v-bind="args" />
    `,
  }),
  argTypes: {
    animate: {
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
    }
  },
  args: {
    animate: false,
  },
};

ShimmerStory.storyName = 'Shimmer';

export const BarStory: StoryBar = {
  render: (args) => ({
    components: { Bar },
    setup() {
      return { args };
    },
    template: `
      <Bar v-bind="args" size="56px" />
    `,
  }),
  argTypes: {

  },
  args: {

  },
};

BarStory.storyName = 'Bar';
