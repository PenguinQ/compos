import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import Shimmer from './Shimmer.vue';

type ShimmerProps = ComponentProps<typeof Shimmer>;

const meta: Meta<ShimmerProps> = {
  title: 'Components/Loader/Shimmer',
  component: Shimmer,
};

export default meta;

type StoryShimmer = StoryObj<ShimmerProps>;

export const Playground: StoryShimmer = {
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
