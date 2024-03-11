import type { Meta, StoryObj } from '@storybook/vue3';

import List from './List.vue';
import ListItem from './ListItem.vue';
import ListTitle from './ListTitle.vue';
import ListSubtitle from './ListSubtitle.vue';
import Icon, { IconBag } from '@icons';

const meta: Meta<typeof List> = {
  component: List,
  tags: ['autodocs'],
  argTypes: {

  },
  args: {

  },
};

export default meta;
type Story = StoryObj<typeof List>;

export const Default: Story = {
  render: (args: any) => ({
    components: { List, ListItem, ListTitle, ListSubtitle, Icon, IconBag },
    setup() {
      const items = [
        {
          title: 'Name',
          subtitle: 'Dosanko Gal wa Namaramenkoi',
        },
        {
          title: 'Description',
          subtitle: 'Shiki Tsubasa has just moved from Tokyo to Hokkaido in the middle of winter. Not quite appreciating how far apart towns are in the country, he gets off the taxi at the next town over from his destination so he can see the sights around his home, but he is shocked when he learns the "next town" is a 3-hour walk away. However, he also meets a cute Dosanko (born and raised in Hokkaido) gyaru named Fuyuki Minami who is braving 8 degrees celcius below 0 weather in the standard gyaru outfit of short skirts and bare legs!',
        },
        {
          title: 'Stock',
          subtitle: '87'
        },
        {
          title: 'Price',
          subtitle: 'Rp100,000'
        },
      ];

      return { args, items };
    },
    template: `
      <br />
      <List :items="items" />
      <br />
      <List>
        <ListItem>
          <ListTitle>Item 1</ListTitle>
          <ListSubtitle>Item 1 Description</ListSubtitle>
        </ListItem>
      </List>
    `,
  }),
};
