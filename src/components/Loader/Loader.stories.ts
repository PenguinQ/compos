import type { Meta, StoryObj } from '@storybook/vue3';

import Shimmer from './Shimmer.vue';
// import Spinner from './Spinner.vue';

const meta: Meta<typeof Shimmer> = {
  component: Shimmer,
  tags: ['autodocs'],
};

export default meta;

type StoryShimmer = StoryObj<typeof Shimmer>;
// type StorySpinner = StoryObj<typeof Spinner>;

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
