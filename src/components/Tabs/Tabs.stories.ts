import type { Meta, StoryObj } from '@storybook/vue3';

import Tabs from './Tabs.vue';
import Tab from './Tab.vue';
import { IconX} from '@icons';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    grow: {
      control: 'boolean',
    },
    sticky: {
      control: 'boolean',
    },
    controlContainerProps: {
      control: 'object',
    },
    controlProps: {
      control: 'object',
    },
    panelContainerProps: {
      control: 'object',
    },
    panelProps: {
      control: 'object',
    },
    variant: {
      control: 'select',
      options: ['alternate'],
    }
  },
  args: {
    grow: false,
    sticky: false,
    controlContainerProps: {},
    controlProps: {},
    panelContainerProps: {},
    panelProps: {},
    variant: undefined,
  },
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: (args: any) => ({
    components: { Tabs, Tab, IconX },
    setup() {
      const styleObj = {
        flex: '1 1 auto',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        padding: '0 8px',
      };

      return { args, styleObj };
    },
    template: `
      <Tabs v-bind="args">
        <Tab title="Himeko">
          <template #title>
            <span>Himeko</span>
          </template>
          <p>An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.</p>
        </Tab>
        <Tab title="Kafka 1">
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
        <Tab title="Kafka 2">
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
        <Tab title="Kafka 3">
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
        <Tab title="Kafka 4">
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
        <Tab title="Kafka 5">
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
        <Tab title="Kafka 6">
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
        <Tab title="Kafka 7">
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
        <Tab title="Kafka 8">
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
        <Tab title="Kafka 9">
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
        <Tab title="Kafka 10">
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
        <Tab title="Kafka 11">
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
        <Tab title="Kafka 12">
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
      </Tabs>
    `,
  }),
};

export const CustomControlButton: Story = {
  render: (args: any) => ({
    components: { Tabs, Tab },
    setup() {
      return { args };
    },
    template: `
      <Tabs v-bind="args">
        <Tab title="Himeko">
          <template #title>
            <span style="color: var(--color-red-2);">Himeko</span>
          </template>
          <p>The tab button are rendered using <strong>#title</strong> slot, title props will be ignored.</p>
          <p>An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.</p>
        </Tab>
        <Tab title="Kafka">
          <template #title>
            <span style="color: #D3A6FF;">Kafka</span>
          </template>
          <p>The tab button are rendered using <strong>#title</strong> slot, title props will be ignored.</p>
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
      </Tabs>
    `,
  }),
};

CustomControlButton.storyName = 'Set Custom Control';

export const LazyTabs: Story = {
  render: (args: any) => ({
    components: { Tabs, Tab },
    setup() {
      return { args };
    },
    template: `
      <Tabs v-bind="args">
        <Tab title="Himeko" lazy>
          <p>Use the <strong>lazy</strong> prop to set the tab item as lazy.</p>
          <p>An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.</p>
        </Tab>
        <Tab title="Kafka" lazy>
          <p>Use the <strong>lazy</strong> prop to set the tab item as lazy.</p>
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
      </Tabs>
    `,
  }),
};

LazyTabs.storyName = 'Set Lazy Tab'

export const ProgrammaticalTabs: Story = {
  render: (args: any) => ({
    components: { Tabs, Tab },
    setup() {
      return { args };
    },
    template: `
      <Tabs v-bind="args">
        <Tab title="Himeko">
          <p>Use the modelValue control to set the active tab.</p>
          <p>An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.</p>
        </Tab>
        <Tab title="Kafka">
          <p>Use the modelValue control to set the active tab.</p>
          <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
        </Tab>
      </Tabs>
    `,
  }),
  argTypes: {
    modelValue: {
      control: 'number',
    },
  },
  args: {
    modelValue: 0,
  },
};

ProgrammaticalTabs.storyName = 'Set Active Tab (v-model)'
