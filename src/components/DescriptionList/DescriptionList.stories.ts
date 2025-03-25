import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { Text } from '@components';
import DescriptionList from './DescriptionList.vue';
import DescriptionListItem from './DescriptionListItem.vue';

type DescriptionListProps = ComponentProps<typeof DescriptionList>;

const meta: Meta<DescriptionListProps> = {
  component: DescriptionList,
  subcomponents: {
    DescriptionListItem,
  },
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
    id: {
      control: 'text',
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
        description: "Jade",
      },
      {
        title: 'Description',
        description:
          'A senior manager in the IPC Strategic Investment Department and one of the Ten Stonehearts. Her Cornerstone is the "Jade of Credit."',
      },
      {
        title: 'Path',
        description: 'Erudition',
      },
      {
        title: 'Rarity',
        description: '⭐️⭐️⭐️⭐️⭐️',
      },
    ],
  },
};

export default meta;

type Story = StoryObj<DescriptionListProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { DescriptionList },
    setup() {
      return { args };
    },
    template: `
      <DescriptionList v-bind="args" />
    `,
  }),
};

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: { DescriptionList },
    setup() {
      const items = [
        {
          title: 'Name',
          description: "Jade",
        },
        {
          title: 'Description',
          description:
            'A senior manager in the IPC Strategic Investment Department and one of the Ten Stonehearts. Her Cornerstone is the "Jade of Credit."',
        },
        {
          title: 'Path',
          description: 'Erudition',
        },
        {
          title: 'Rarity',
          description: '⭐️⭐️⭐️⭐️⭐️',
        },
      ];

      return { items };
    },
    template: `
      <DescriptionList :items="items" />
    `,
  }),
};

export const DocSubcomponents = {
  tags: ['!dev'],
  render: () => ({
    components: {
      DescriptionList,
      DescriptionListItem,
    },
    setup() {
      const items = [
        {
          title: 'Name',
          description: "Jade",
        },
        {
          title: 'Description',
          description:
            'A senior manager in the IPC Strategic Investment Department and one of the Ten Stonehearts. Her Cornerstone is the "Jade of Credit."',
        },
        {
          title: 'Path',
          description: 'Erudition',
        },
        {
          title: 'Rarity',
          description: '⭐️⭐️⭐️⭐️⭐️',
        },
      ];

      return { items };
    },
    template: `
      <DescriptionList>
        <DescriptionListItem
          v-for="(item, index) in items"
          :key="\`description-list-$\{index}\`"
          :title="item.title"
          :description="item.description"
        />
      </DescriptionList>
    `,
  }),
};

export const DocCustom = {
  tags: ['!dev'],
  render: () => ({
    components: {
      DescriptionList,
      DescriptionListItem,
      Text,
    },
    setup() {
      const items = [
        {
          title: 'Name',
          description: "Jade",
        },
        {
          title: 'Description',
          description:
            'A senior manager in the IPC Strategic Investment Department and one of the Ten Stonehearts. Her Cornerstone is the "Jade of Credit."',
        },
        {
          title: 'Path',
          description: 'Erudition',
        },
        {
          title: 'Rarity',
          description: '⭐️⭐️⭐️⭐️⭐️',
        },
      ];

      return { items };
    },
    template: `
      <DescriptionList>
        <DescriptionListItem>
          <dt>Name</dt>
          <dd>
            <Text as="span" color="#C77DFF" margin="0">Jade</Text>
          </dd>
        </DescriptionListItem>
        <DescriptionListItem>
          <dt>Description</dt>
          <dd>A senior manager in the IPC Strategic Investment Department and one of the Ten Stonehearts. Her Cornerstone is the "Jade of Credit."</dd>
        </DescriptionListItem>
        <DescriptionListItem>
          <dt>Path</dt>
          <dd><a href="#">Erudition</a></dd>
        </DescriptionListItem>
        <DescriptionListItem>
          <dt>Rarity</dt>
          <dd>⭐️⭐️⭐️⭐️⭐️</dd>
        </DescriptionListItem>
      </DescriptionList>
    `,
  }),
};
