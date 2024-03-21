import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import Ticker from './Ticker.vue';
import TickerItem from './TickerItem.vue';

const meta: Meta<typeof Ticker> = {
  component: Ticker,
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
    },
  },
  args: {
    items: [
      {
        title: 'Item 1',
        description: 'Dosanko Gal wa Namaramenkoi',
      },
      {
        title: 'Item 2',
        description:
          'Shiki Tsubasa has just moved from Tokyo to Hokkaido in the middle of winter. Not quite appreciating how far apart towns are in the country, he gets off the taxi at the next town over from his destination so he can see the sights around his home, but he is shocked when he learns the "next town" is a 3-hour walk away. However, he also meets a cute Dosanko (born and raised in Hokkaido) gyaru named Fuyuki Minami who is braving 8 degrees celcius below 0 weather in the standard gyaru outfit of short skirts and bare legs!',
      },
      {
        title: 'Item 3',
        description:
          'Shiki Tsubasa has just moved from Tokyo to Hokkaido in the middle of winter. Not quite appreciating how far apart towns are in the country, he gets off the taxi at the next town over from his destination so he can see the sights around his home, but he is shocked when he learns the "next town" is a 3-hour walk away. However, he also meets a cute Dosanko (born and raised in Hokkaido) gyaru named Fuyuki Minami who is braving 8 degrees celcius below 0 weather in the standard gyaru outfit of short skirts and bare legs!',
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof Ticker>;

export const Default: Story = {
  render: (args) => ({
    components: { Ticker, TickerItem },
    setup() {
      const slotObject = ref([
        {
          title: 'Title One',
          description: 'Description one.',
        }, {
          title: 'Title Two',
          description: 'Description two.',
        },
        {
          title: 'Title Three',
          description: 'Description three.',
        }
      ]);

      const removeChild = () => {
        slotObject.value.pop();
      };

      const tickerState = ref(false);

      const toggleTicker = () => {
        tickerState.value = !tickerState.value;
      };

      return { args, slotObject, removeChild, tickerState, toggleTicker };
    },
    template: `
      <Ticker></Ticker>
      `,
      // <Ticker v-bind="args" />
      // <button @click="removeChild">Remove 1 Child</button>
      // <button @click="toggleTicker">Toggle Ticker</button>
      // <Ticker>
      //   <TickerItem v-if="tickerState" title="Ticker One Title" description="Ticker one description." type="info" />
      //   <TickerItem type="info">
      //     <template #title>Berak</template>
      //     <template #description>Berak description</template>
      //   </TickerItem>
      // </Ticker>

    // <Ticker>
    //     <TickerItem :key="object.title" v-for="object in slotObject" :title="object.title" :description="object.description" />
    //     <TickerItem title="Ticker One Title" description="Ticker one description." type="info" />
    //     <TickerItem v-if="appear" title="Ticker Two Title" description="Ticker two description." type="warning" />
    //   </Ticker>
  }),
};
