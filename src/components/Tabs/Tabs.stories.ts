import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { Text } from '@components';
import TabControls from './TabControls.vue';
import TabControl from './TabControl.vue';
import TabPanels from './TabPanels.vue';
import TabPanel from './TabPanel.vue';

type TabControlsProps = ComponentProps<typeof TabControls>;

const meta: Meta<TabControlsProps> = {
  component: TabControls,
  subcomponents: {
    TabControl,
    TabPanels,
    TabPanel,
  },
  argTypes: {
    grow: {
      control: 'boolean',
    },
    modelValue: {
      name: 'v-model',
      control: 'number',
    },
    variant: {
      control: 'select',
      options: ['alternate'],
    },
  },
  args: {
    grow: false,
    modelValue: 0,
  },
};

export default meta;

type Story = StoryObj<TabControlsProps>;

export const Playground: Story = {
  render: (args) => ({
    components: {
      TabControls,
      TabControl,
      TabPanels,
      TabPanel,
      Text,
    },
    setup() {
      const tab = ref(0);

      return { args, tab };
    },
    template: `
      <Text>Active TabControl/TabPanel index: {{ args.modelValue }}</Text>
      <TabControls v-bind="args" v-model="args.modelValue">
        <TabControl title="Himeko" />
        <TabControl title="Jade" />
        <TabControl title="Aglaea" />
        <TabControl title="Kafka" />
      </TabControls>
      <TabPanels v-model="args.modelValue">
        <TabPanel>An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.</TabPanel>
        <TabPanel lazy>A senior manager in the IPC Strategic Investment Department and one of the Ten Stonehearts. Her Cornerstone is the "Jade of Credit."</TabPanel>
        <TabPanel>Aglaea the Goldweaver, the Chrysos Heir bearing the Coreflame of "Romance"</TabPanel>
        <TabPanel>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</TabPanel>
      </TabPanels>
    `,
  }),
};

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: {
      TabControl,
      TabControls,
      TabPanel,
      TabPanels,
      Text,
    },
    setup() {
      const tab = ref(0);

      return { tab };
    },
    template: `
      <Text>Active TabControl/TabPanel index: {{ tab }}</Text>
      <TabControls v-model="tab">
        <TabControl title="Himeko" />
        <TabControl title="Jade" />
        <TabControl title="Aglaea" />
        <TabControl title="Kafka" />
      </TabControls>
      <TabPanels v-model="tab">
        <TabPanel>An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.</TabPanel>
        <TabPanel>A senior manager in the IPC Strategic Investment Department and one of the Ten Stonehearts. Her Cornerstone is the "Jade of Credit."</TabPanel>
        <TabPanel>Aglaea the Goldweaver, the Chrysos Heir bearing the Coreflame of "Romance"</TabPanel>
        <TabPanel>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</TabPanel>
      </TabPanels>
    `,
  }),
};

export const DocLazy = {
  tags: ['!dev'],
  render: () => ({
    components: {
      TabControl,
      TabControls,
      TabPanel,
      TabPanels,
      Text,
    },
    setup() {
      const tab = ref(0);

      return { tab };
    },
    template: `
      <Text>Active TabControl/TabPanel index: {{ tab }}</Text>
      <TabControls v-model="tab">
        <TabControl title="Himeko" />
        <TabControl title="Jade" />
        <TabControl title="Aglaea" />
        <TabControl title="Kafka" />
      </TabControls>
      <TabPanels v-model="tab">
        <TabPanel>An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.</TabPanel>
        <TabPanel lazy>A senior manager in the IPC Strategic Investment Department and one of the Ten Stonehearts. Her Cornerstone is the "Jade of Credit."</TabPanel>
        <TabPanel lazy>Aglaea the Goldweaver, the Chrysos Heir bearing the Coreflame of "Romance"</TabPanel>
        <TabPanel lazy>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</TabPanel>
      </TabPanels>
    `,
  }),
};
