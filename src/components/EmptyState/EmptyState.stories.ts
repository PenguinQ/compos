import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { Button, Text } from '@components';
import EmptyState from './EmptyState.vue';

type EmptyStateProps = ComponentProps<typeof EmptyState>;

const meta: Meta<EmptyStateProps> = {
  component: EmptyState,
  argTypes: {
    description: {
      control: 'text',
    },
    emoji: {
      control: 'text',
    },
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
    subtitle: {
      control: 'text',
    },
    title: {
      control: 'text',
    },
    width: {
      control: 'text',
    },
    height: {
      control: 'text',
    },
    padding: {
      control: 'text',
    },
    margin: {
      control: 'text',
    },
  },
  args: {
    image: 'https://upload-static.hoyoverse.com/hoyolab-wiki/2023/06/22/250281765/b6bbbd8e0c5c4bf49ead5a39b6429041_4585180775013259954.png',
    orientation: 'vertical',
    title: 'Aha',
    subtitle: 'Aeon',
    description: 'The Aeon of Elation. No one can predict what this Aeon might express THEIR mirth at. Joy is a right of sentient beings, and Aha inspires THEIR believers to delight in the joys of life. THEY take pleasure in the sharp turns of fate.',
  },
};

export default meta;

type Story = StoryObj<EmptyStateProps>;

export const Playground: Story = {
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

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: { EmptyState },
    setup() {
      return {};
    },
    template: `
      <EmptyState
        image="https://upload-static.hoyoverse.com/hoyolab-wiki/2023/06/22/250281765/b6bbbd8e0c5c4bf49ead5a39b6429041_4585180775013259954.png"
        title="Aha"
        subtitle="Aeon"
        description="The Aeon of Elation. No one can predict what this Aeon might express THEIR mirth at. Joy is a right of sentient beings, and Aha inspires THEIR believers to delight in the joys of life. THEY take pleasure in the sharp turns of fate."
      />
    `,
  }),
};

export const DocSlots = {
  tags: ['!dev'],
  render: () => ({
    components: { Button, EmptyState, Text },
    setup() {
      return {};
    },
    template: `
      <EmptyState image="https://upload-static.hoyoverse.com/hoyolab-wiki/2023/06/22/250281765/b6bbbd8e0c5c4bf49ead5a39b6429041_4585180775013259954.png">
        <template #title>
          <Text heading="2" color="var(--color-red-4)" margin="0 0 4px">Aha?</Text>
        </template>
        <template #subtitle>
          <Text heading="3" color="var(--color-blue-4)" margin="0 0 4px">? Aeon ?</Text>
        </template>
        <template #description>
          <Text body="medium" color="var(--color-green-4)" margin="0">Aha is Aeon ??</Text>
        </template>
        <template #action>
          <Button color="red" variant="outline">Fight me?</Button>
          <Button>Fight me!</Button>
        </template>
      </EmptyState>
    `,
  }),
};
