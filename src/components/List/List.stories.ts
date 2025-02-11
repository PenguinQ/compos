import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { Text, Select, Checkbox } from '@components';
import ComposIcon, { Box, Boxes } from '@components/Icons';
import List from './List.vue';
import ListItem from './ListItem.vue';
import ListTitle from './ListTitle.vue';
import ListDescription from './ListDescription.vue';

type ListProps = ComponentProps<typeof List>;

const meta: Meta<ListProps> = {
  component: List,
  subcomponents: {
    ListItem,
    ListTitle,
    ListDescription,
  },
  argTypes: {
    title: {
      control: 'text',
    },
    inset: {
      control: 'boolean',
    },
    items: {
      control: 'object',
    },
  },
  args: {
    inset: false,
  },
};

export default meta;

type Story = StoryObj<ListProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { List },
    setup() {
      return { args };
    },
    template: `
      <List v-bind="args" />
    `,
  }),
  args: {
    items: [
      {
        title: 'Firmament Frontline: Glamoth',
        description: 'Firmament Frontline: Glamoth is a Planar Ornament Relic Set that can be obtained by challenging World 8 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.',
      },
      {
        title: 'Rutilant Arena',
        description: 'Rutilant Arena is a Planar Ornament Relic Set that can be obtained by challenging World 7 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.',
      },
      {
        title: 'Duran, Dynasty of Running Wolves',
        description: 'Duran, Dynasty of Running Wolves is a Planar Ornament Relic Set that can be obtained by challenging Divergent Universe: Eternal Comedy in 2-5 ✨ rarities.',
      },
      {
        title: 'Izumo Gensei and Takama Divine Realm',
        description: 'Izumo Gensei and Takama Divine Realm is a Planar Ornament Relic Set that can be obtained by challenging World 9 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.',
      },
    ],
  },
};

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: { List },
    setup() {
      const items = [
        {
          title: 'Firmament Frontline: Glamoth',
          description: 'Firmament Frontline: Glamoth is a Planar Ornament Relic Set that can be obtained by challenging World 8 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.',
        },
        {
          title: 'Rutilant Arena',
          description: 'Rutilant Arena is a Planar Ornament Relic Set that can be obtained by challenging World 7 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.',
        },
        {
          title: 'Duran, Dynasty of Running Wolves',
          description: 'Duran, Dynasty of Running Wolves is a Planar Ornament Relic Set that can be obtained by challenging Divergent Universe: Eternal Comedy in 2-5 ✨ rarities.',
        },
        {
          title: 'Izumo Gensei and Takama Divine Realm',
          description: 'Izumo Gensei and Takama Divine Realm is a Planar Ornament Relic Set that can be obtained by challenging World 9 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.',
        },
      ];

      return { items };
    },
    template: `
      <List :items="items" />
    `,
  }),
};

export const DocSubcomponent = {
  tags: ['!dev'],
  render: () => ({
    components: {
      List,
      ListItem,
      ListTitle,
      ListDescription,
    },
    setup() {
      const items = [
        {
          title: 'Firmament Frontline: Glamoth',
          description: 'Firmament Frontline: Glamoth is a Planar Ornament Relic Set that can be obtained by challenging World 8 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.',
        },
        {
          title: 'Rutilant Arena',
          description: 'Rutilant Arena is a Planar Ornament Relic Set that can be obtained by challenging World 7 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.',
        },
        {
          title: 'Duran, Dynasty of Running Wolves',
          description: 'Duran, Dynasty of Running Wolves is a Planar Ornament Relic Set that can be obtained by challenging Divergent Universe: Eternal Comedy in 2-5 ✨ rarities.',
        },
        {
          title: 'Izumo Gensei and Takama Divine Realm',
          description: 'Izumo Gensei and Takama Divine Realm is a Planar Ornament Relic Set that can be obtained by challenging World 9 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.',
        },
      ];

      return { items };
    },
    template: `
      <List>
        <ListItem v-for="item in items">
          <ListTitle>{{ item.title }}</ListTitle>
          <ListDescription>{{ item.description }}</ListDescription>
        </ListItem>
      </List>
    `,
  }),
};

export const DocAppendPrepend = {
  tags: ['!dev'],
  render: () => ({
    components: {
      ComposIcon,
      Text,
      List,
      ListItem,
      ListTitle,
      ListDescription,
    },
    setup() {
      const items = [
        {
          title: 'Firmament Frontline: Glamoth',
          description: 'Firmament Frontline: Glamoth is a Planar Ornament Relic Set that can be obtained by challenging World 8 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.',
          append: 'Prepend',
        },
        {
          title: 'Rutilant Arena',
          description: 'Rutilant Arena is a Planar Ornament Relic Set that can be obtained by challenging World 7 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.',
          prepend: 'Append',
        },
      ];

      return { items, Box, Boxes };
    },
    template: `
      <Text heading="5">Using Prop 💬</Text>
      <List :items="items" />

      <Text heading="5" margin="36px 0 16px">Using Slot 🎰</Text>
      <List>
        <ListItem v-for="item in items">
          <ListTitle>{{ item.title }}</ListTitle>
          <ListDescription>{{ item.description }}</ListDescription>
          <template v-if="item.prepend" #prepend>{{ item.prepend }}</template>
          <template v-if="item.append" #append>{{ item.append }}</template>
        </ListItem>
        <ListItem v-for="item in items">
          <ListTitle>{{ item.title }}</ListTitle>
          <ListDescription>{{ item.description }}</ListDescription>
          <template v-if="item.prepend" #prepend>
            <ComposIcon :icon="Box" />
          </template>
          <template v-if="item.append" #append>
            <ComposIcon :icon="Boxes" />
          </template>
        </ListItem>
      </List>
    `,
  }),
};

export const DocClickable = {
  tags: ['!dev'],
  render: () => ({
    components: {
      List,
      ListItem,
      ListTitle,
      ListDescription,
    },
    setup() {
      const items = [
        {
          title: 'Firmament Frontline: Glamoth',
          description: 'Firmament Frontline: Glamoth is a Planar Ornament Relic Set that can be obtained by challenging World 8 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.',
          clickable: true,
        },
        {
          title: 'Rutilant Arena',
          description: 'Rutilant Arena is a Planar Ornament Relic Set that can be obtained by challenging World 7 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.',
          clickable: true,
        },
        {
          title: 'Duran, Dynasty of Running Wolves',
          description: 'Duran, Dynasty of Running Wolves is a Planar Ornament Relic Set that can be obtained by challenging Divergent Universe: Eternal Comedy in 2-5 ✨ rarities.',
          clickable: true,
        },
        {
          title: 'Izumo Gensei and Takama Divine Realm',
          description: 'Izumo Gensei and Takama Divine Realm is a Planar Ornament Relic Set that can be obtained by challenging World 9 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.',
          clickable: true,
        },
      ];

      return { items };
    },
    template: `
      <List :items="items" />
    `,
  }),
};

export const DocCheckbox = {
  tags: ['!dev'],
  render: () => ({
    components: {
      Text,
      List,
      ListItem,
      ListTitle,
      ListDescription,
      Checkbox,
    },
    setup() {
      const value = ref(false);

      return { value };
    },
    template: `
      <List>
        <ListItem :key="n" v-for="n in 6">
          <ListTitle>Effect Hit Rate Boost</ListTitle>
          <ListDescription>In the Simulated Universe, all character's Effect Hit Rate increases by 8%.</ListDescription>
          <template v-if="n < 4" #prepend>
            <Checkbox v-model="value" :error="(n % 3) === 1" :disabled="(n % 3) === 2" />
          </template>
          <template v-else #append>
            <Checkbox v-model="value" :error="(n % 3) === 1" :disabled="(n % 3) === 2" />
          </template>
        </ListItem>
      </List>
    `,
  }),
};

export const DocSelect = {
  tags: ['!dev'],
  render: () => ({
    components: {
      List,
      ListItem,
      ListTitle,
      ListDescription,
      Select,
    },
    setup() {
      const value = ref('');
      const options = [
        { value: '', label: 'Select Path' },
        { value: 'Remembrance', label: 'Remembrance' },
        { value: 'Elation', label: 'Elation' },
        { value: 'The Hunt', label: 'The Hunt' },
        { value: 'Destruction', label: 'Destruction' },
        { value: 'Nihility', label: 'Nihility' },
        { value: 'Abundance', label: 'Abundance' },
        { value: 'Propagation', label: 'Propagation' },
        { value: 'Erudition', label: 'Erudition' },
      ];

      return { value, options };
    },
    template: `
      <List>
        <ListItem :key="n" v-for="n in 6">
          <ListTitle>Simulated Universe</ListTitle>
          <ListDescription>
            Please select which Path you want to travel on.
          </ListDescription>
          <template v-if="n < 4" #prepend>
            <Select v-model="value" :error="(n % 3) === 1" :disabled="(n % 3) === 2">
              <option v-for="option of options" :value="option.value">{{ option.label }}</option>
            </Select>
          </template>
          <template v-else #append>
            <Select v-model="value" :error="(n % 3) === 1" :disabled="(n % 3) === 2">
              <option v-for="option of options" :value="option.value">{{ option.label }}</option>
            </Select>
          </template>
        </ListItem>
      </List>
    `,
  }),
};
