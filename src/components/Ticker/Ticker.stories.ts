import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { Text } from '@components';
import Ticker from './Ticker.vue';
import TickerItem from './TickerItem.vue';

type TickerProps = ComponentProps<typeof Ticker>;

const meta: Meta<TickerProps> = {
  component: Ticker,
  subcomponents: { TickerItem },
  argTypes: {
    activeIndex: {
      control: 'number',
    },
    autoplay: {
      control: 'boolean',
    },
    autoplayDuration: {
      control: 'number',
    },
    items: {
      control: 'object',
    },
    margin: {
      control: 'text',
    },
  },
  args: {
    activeIndex: 0,
    autoplay: false,
    autoplayDuration: 5000,
  },
};

export default meta;

type Story = StoryObj<TickerProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { Ticker },
    setup() {
      return { args };
    },
    template: `<Ticker v-bind="args" />`,
  }),
  args: {
    items: [
      {
        title: 'Default Ticker',
        description: 'Description for default ticker.',
      },
      {
        title: 'Info Ticker',
        description: 'Description for info ticker.',
        type: 'info',
      },
      {
        title: 'Warning Ticker',
        description: 'Description for warning ticker.',
        type: 'warning',
      },
      {
        title: 'Error Ticker',
        description: 'Description for error ticker.',
        type: 'error',
      },
    ],
  },
};

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: { Ticker },
    setup() {
      const items = [
        {
          title: 'Default Ticker',
          description: 'Description for default ticker.',
        },
        {
          title: 'Info Ticker',
          description: 'Description for info ticker.',
          type: 'info',
        },
        {
          title: 'Warning Ticker',
          description: 'Description for warning ticker.',
          type: 'warning',
        },
        {
          title: 'Error Ticker',
          description: 'Description for error ticker.',
          type: 'error',
        },
      ];

      return { items };
    },
    template: `
      <Ticker :items="items" />
    `,
  }),
};

export const DocSubcomponents = {
  tags: ['!dev'],
  render: () => ({
    components: { Ticker, TickerItem },
    setup() {
      const items = [
        {
          title: 'Default Ticker',
          description: 'Description for default ticker.',
        },
        {
          title: 'Info Ticker',
          description: 'Description for info ticker.',
          type: 'info',
        },
        {
          title: 'Warning Ticker',
          description: 'Description for warning ticker.',
          type: 'warning',
        },
        {
          title: 'Error Ticker',
          description: 'Description for error ticker.',
          type: 'error',
        },
      ];

      return { items };
    },
    template: `
      <Ticker>
        <TickerItem
          :key="index"
          v-for="(item, index) in items"
          :title="item.title"
          :description="item.description"
          :type="item.type"
        />
      </Ticker>
    `,
  }),
};

export const DocSlots = {
  tags: ['!dev'],
  render: () => ({
    components: { Text, Ticker, TickerItem },
    setup() {
      return {};
    },
    template: `
      <Ticker>
        <TickerItem type="error">
          <template #title>
            <Text heading="1" color="var(--color-blue-4)" fontWeight="600">Warning!!!</Text>
          </template>
          <template #description>
            <Text color="var(--color-red-4" margin="0">
              The unique plants grown here have not undergone a comprehensive safety test. Any unauthorized contact might lead to unthinkable consequences!
            </Text>
          </template>
        </TickerItem>
      </Ticker>
    `,
  }),
};
