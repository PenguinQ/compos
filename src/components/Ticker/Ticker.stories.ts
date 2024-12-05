import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import { Card, Text } from '@components';
import Ticker from './Ticker.vue';
import TickerItem from './TickerItem.vue';

const meta: Meta<typeof Ticker> = {
  component: Ticker,
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
  },
  args: {
    activeIndex: 0,
    autoplay: false,
    autoplayDuration: 5000,
  },
};

export default meta;

type Story = StoryObj<typeof Ticker>;

export const Items: Story = {
  render: (args) => ({
    components: { Ticker, TickerItem, Card, Text },
    setup() {
      const index = ref(0);
      const autoplay = ref(false);
      const autoplay_duration = ref(2000);

      return { args, index, autoplay, autoplay_duration };
    },
    template: `
      <Ticker v-bind="args" />
    `,
  }),
  argTypes: {
    items: {
      control: 'object',
    },
  },
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

export const DefaultSlot: Story = {
  render: (args) => ({
    components: { Ticker, TickerItem, Card, Text },
    setup() {
      const slotObject = ref([
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
      ]);

      const addTicker = () => {
        slotObject.value.push({
          title: 'Dynamic Error Ticker',
          description: 'Description for dynamic error ticker.',
          type: 'error',
        });
      };

      const tickerState = ref(false);

      const toggleTicker = () => {
        tickerState.value = !tickerState.value;
      };

      return { args, slotObject, addTicker, tickerState, toggleTicker };
    },
    template: `
      <Ticker v-bind="args">
        <TickerItem title="Default Ticker" description="Description for default ticker" />
        <TickerItem title="Info Ticker" description="Description for info ticker" type="info" />
        <TickerItem title="Warning Ticker" description="Description for warning ticker" type="warning" />
        <TickerItem title="Error Ticker" description="Description for error ticker" type="error" />
      </Ticker>
    `,
  }),
};

DefaultSlot.storyName = 'Default Slot';

export const DefaultSlotLoop: Story = {
  render: (args) => ({
    components: { Ticker, TickerItem, Card, Text },
    setup() {
      return { args };
    },
    template: `
      <Ticker
        :autoplay="args.autoplay"
        :autoplayDuration="args.autoplayDuration"
        :activeIndex="args.activeIndex"
      >
        <TickerItem
          v-for="item in args.items"
          :title="item.title"
          :description="item.title"
          :type="item.type"
        />
      </Ticker>
    `,
  }),
  argTypes: {
    items: {
      control: 'object',
    },
  },
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

DefaultSlotLoop.storyName = 'Default Slot (Looping)';
