import type { Meta, StoryObj } from '@storybook/vue3';

import Card from '@components/Card';
import DescriptionList from './DescriptionList.vue';

const meta: Meta<typeof DescriptionList> = {
  component: DescriptionList,
  argTypes: {
    alignment: {
      control: 'select',
      options: ['default', 'horizontal'],
    },
    density: {
      control: 'select',
      options: ['default', 'compact'],
    },
    direction: {
      control: 'select',
      options: ['default', 'rtl'],
    },
    items: {
      control: 'object',
    },
  },
  args: {
    alignment: undefined,
    density: undefined,
    direction: undefined,
    items: [
      {
        title: 'Name',
        description: "<script>console.log('haha')</script>Dosanko Gal wa Namaramenkoi",
      },
      {
        title: 'Description',
        description:
          'Shiki Tsubasa has just moved from Tokyo to Hokkaido in the middle of winter. Not quite appreciating how far apart towns are in the country, he gets off the taxi at the next town over from his destination so he can see the sights around his home, but he is shocked when he learns the "next town" is a 3-hour walk away. However, he also meets a cute Dosanko (born and raised in Hokkaido) gyaru named Fuyuki Minami who is braving 8 degrees celcius below 0 weather in the standard gyaru outfit of short skirts and bare legs!',
      },
      {
        title: 'Stock',
        description: '87',
      },
      {
        title: 'Price',
        description: 'Rp100,000',
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof DescriptionList>;

export const Default: Story = {
  render: (args: any) => ({
    components: { Card, DescriptionList },
    setup() {
      return { args };
    },
    template: `
      <Card>
        <DescriptionList v-bind="args" />
      </Card>
    `,
  }),
};
