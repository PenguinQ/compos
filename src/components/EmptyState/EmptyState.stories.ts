import type { Meta, StoryObj } from '@storybook/vue3';

import Button from '@components/Button';
import EmptyState from './EmptyState.vue';

const meta: Meta<typeof EmptyState> = {
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    image: {
      control: 'text',
    },
    imageAlt: {
      control: 'text',
    },
    imageHeight: {
      control: 'text',
    },
    imageWidth: {
      control: 'text',
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    width: {
      control: 'text'
    },
    height: {
      control: 'text',
    },
  },
  args: {
    image: 'https://placehold.co/150x150',
    orientation: 'vertical',
    title: 'Title text',
    subtitle: 'Subtitle text',
    description: 'Description text',
  },
  decorators: [
    () => ({
      template: '<div style="height: 400px; background-color: #FCF7F8;"><story /></div>',
    })
  ],
};

export default meta;

type EmptyState = StoryObj<typeof EmptyState>;

export const Default: EmptyState = {
  render: (args) => ({
    components: { EmptyState },
    setup() {
      return { args };
    },
    template: `
      <EmptyState v-bind="args" />
    `,
  }),
};

export const Slot: EmptyState = {
  render: (args) => ({
    components: { EmptyState, Button },
    setup() {
      return { args };
    },
    template: `
      <EmptyState v-bind="args">
        <template #action>
          <Button>Button 1</Button>
          <Button variant="outline">Button 2</Button>
        </template>
      </EmptyState>
    `,
  }),
};
