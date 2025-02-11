import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import Bar from './Bar.vue';

type BarProps = ComponentProps<typeof Bar>;

const meta: Meta<BarProps> = {
  title: 'Components/Loader/Bar',
  component: Bar,
};

export default meta;

type StoryBar = StoryObj<BarProps>;

export const Playground: StoryBar = {
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
