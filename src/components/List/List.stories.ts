import { ref } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import {
  Text,
  Select,
  Checkbox,
} from '@components';
import List from './List.vue';
import ListItem from './ListItem.vue';
import ListTitle from './ListTitle.vue';
import ListDescription from './ListDescription.vue';

import { onlyShowArgs } from '@docs/helpers';

type ListProps = ComponentProps<typeof List>;
type ListItemProps = ComponentProps<typeof ListItem>;

const defaultArgTypes = {
  inset: {
    control: 'boolean',
  },
  items: {
    control: 'object',
  },
};

const defaultItems = [
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

const meta: Meta<ListProps> = {
  component: List,
  subcomponents: { ListItem, ListTitle, ListDescription },
  argTypes: defaultArgTypes,
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
    items: defaultItems,
  },
};

export const UsingSubcomponents: Story = {
  render: (args) => ({
    components: {
      List,
      ListItem,
      ListTitle,
      ListDescription,
    },
    setup() {
      return { args, defaultItems };
    },
    template: `
      <List>
        <ListItem v-for="item of defaultItems">
          <ListTitle>{{ item.title }}</ListTitle>
          <ListDescription>{{ item.description }}</ListDescription>
        </ListItem>
      </List>
    `,
  }),
  argTypes: onlyShowArgs(defaultArgTypes, []),
};

export const AsClickable: StoryObj<ListItemProps> = {
  render: (args) => ({
    components: {
      List,
      ListItem,
      ListTitle,
      ListDescription,
    },
    setup() {
      const handleClick = () => {
        console.log('Clicked!');
      };

      return { args, handleClick };
    },
    template: `
      <List>
        <ListItem clickable @click="handleClick">
          <ListTitle>Firmament Frontline: Glamoth</ListTitle>
          <ListDescription>Firmament Frontline: Glamoth is a Planar Ornament Relic Set that can be obtained by challenging World 8 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.</ListDescription>
        </ListItem>
        <ListItem clickable @click="handleClick">
          <ListTitle>Rutilant Arena</ListTitle>
          <ListDescription>Rutilant Arena is a Planar Ornament Relic Set that can be obtained by challenging World 7 in Simulated Universe or Divergent Universe in 2-5 ✨ rarities.</ListDescription>
        </ListItem>
      </List>
    `,
  }),
  argTypes: onlyShowArgs(defaultArgTypes, []),
};

export const AsSelectInput: Story = {
  render: (args) => ({
    components: {
      List,
      ListItem,
      ListTitle,
      ListDescription,
      Select,
      Text,
    },
    setup() {
      const selectValue   = ref('');
      const selectOptions = [
        { value: '', label: 'Select Path' },
        { value: 'Remembrance', label: 'Remembrance' },
        { value: 'Elation', label: 'Elation' },
        { value: 'The Hunt', label: 'The Hunt' },
        { value: 'Destruction', label: 'Destruction' },
        { value: 'Nihility', label: 'Nihility' },
        { value: 'Abundance', label: 'Abundance' },
        { value: 'Propagation', label: 'Propagation' },
        { value: 'Erudition', label: 'Erudition' },
      ]

      return { args, selectValue, selectOptions };
    },
    template: `
      <List>
        <ListItem>
          <ListTitle>Simulated Universe</ListTitle>
          <ListDescription>
            Please select which Path you want to travel on.
          </ListDescription>
          <template #prepend>
            <Select v-model="selectValue" error>
              <option v-for="option of selectOptions" :value="option.value">{{ option.label }}</option>
            </Select>
          </template>
        </ListItem>
        <ListItem>
          <ListTitle>Simulated Universe</ListTitle>
          <ListDescription>
            Please select which Path you want to travel on.
          </ListDescription>
          <template #prepend>
            <Select v-model="selectValue" disabled>
              <option v-for="option of selectOptions" :value="option.value">{{ option.label }}</option>
            </Select>
          </template>
        </ListItem>
        <ListItem>
          <ListTitle>Simulated Universe</ListTitle>
          <ListDescription>
            Please select which Path you want to travel on.
          </ListDescription>
          <template #prepend>
            <Select v-model="selectValue">
              <option v-for="option of selectOptions" :value="option.value">{{ option.label }}</option>
            </Select>
          </template>
        </ListItem>
        <ListItem>
          <ListTitle>Simulated Universe</ListTitle>
          <ListDescription>
            Please select which Path you want to travel on.
          </ListDescription>
          <template #append>
            <Select v-model="selectValue" error>
              <option v-for="option of selectOptions" :value="option.value">{{ option.label }}</option>
            </Select>
          </template>
        </ListItem>
        <ListItem>
          <ListTitle>Simulated Universe</ListTitle>
          <ListDescription>
            Please select which Path you want to travel on.
          </ListDescription>
          <template #append>
            <Select v-model="selectValue" disabled>
              <option v-for="option of selectOptions" :value="option.value">{{ option.label }}</option>
            </Select>
          </template>
        </ListItem>
        <ListItem>
          <ListTitle>Simulated Universe</ListTitle>
          <ListDescription>
            Please select which Path you want to travel on.
          </ListDescription>
          <template #append>
            <Select v-model="selectValue">
              <option v-for="option of selectOptions" :value="option.value">{{ option.label }}</option>
            </Select>
          </template>
        </ListItem>
      </List>
    `,
  }),
  argTypes: onlyShowArgs(defaultArgTypes, []),
};

export const AsCheckboxInput: Story = {
  render: (args) => ({
    components: {
      List,
      ListItem,
      ListTitle,
      ListDescription,
      Checkbox,
    },
    setup() {
      const checkboxValue = ref(false);

      return { args, checkboxValue };
    },
    template: `
      <List>
        <ListItem>
          <ListTitle>Effect Hit Rate Boost</ListTitle>
          <ListDescription>
            In the Simulated Universe, all character's Effect Hit Rate increases by 8%.
          </ListDescription>
          <template #prepend>
            <Checkbox v-model="checkboxValue" error />
          </template>
        </ListItem>
        <ListItem>
          <ListTitle>Effect Hit Rate Boost</ListTitle>
          <ListDescription>
            In the Simulated Universe, all character's Effect Hit Rate increases by 8%.
          </ListDescription>
          <template #prepend>
            <Checkbox v-model="checkboxValue" disabled />
          </template>
        </ListItem>
        <ListItem>
          <ListTitle>Effect Hit Rate Boost</ListTitle>
          <ListDescription>
            In the Simulated Universe, all character's Effect Hit Rate increases by 8%.
          </ListDescription>
          <template #prepend>
            <Checkbox v-model="checkboxValue" />
          </template>
        </ListItem>
        <ListItem>
          <ListTitle>Effect Hit Rate Boost</ListTitle>
          <ListDescription>
            In the Simulated Universe, all character's Effect Hit Rate increases by 8%.
          </ListDescription>
          <template #append>
            <Checkbox v-model="checkboxValue" error />
          </template>
        </ListItem>
        <ListItem>
          <ListTitle>Effect Hit Rate Boost</ListTitle>
          <ListDescription>
            In the Simulated Universe, all character's Effect Hit Rate increases by 8%.
          </ListDescription>
          <template #append>
            <Checkbox v-model="checkboxValue" disabled />
          </template>
        </ListItem>
        <ListItem>
          <ListTitle>Effect Hit Rate Boost</ListTitle>
          <ListDescription>
            In the Simulated Universe, all character's Effect Hit Rate increases by 8%.
          </ListDescription>
          <template #append>
            <Checkbox v-model="checkboxValue" />
          </template>
        </ListItem>
      </List>
    `,
  }),
  argTypes: onlyShowArgs(defaultArgTypes, []),
};
