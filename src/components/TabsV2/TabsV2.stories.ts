import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import TabControls from './TabControls.vue';
import TabControl from './TabControl.vue';
import TabPanels from './TabPanels.vue';
import TabPanel from './TabPanel.vue';
import Text from '@components/Text';

const meta: Meta<typeof TabControls> = {
  component: TabControls,
  argTypes: {
    grow: {
      control: 'boolean',
    },
    sticky: {
      control: 'boolean',
    },
    variant: {
      control: 'select',
      options: ['alternate'],
    },
  },
  args: {
    grow: false,
    sticky: false,
    variant: undefined,
  },
};

export default meta;

type Story = StoryObj<typeof TabControls>;

export const Default: Story = {
  render: (args: any) => ({
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
      <div>Index: {{ tab }}</div>
      <hr />
      <TabControls v-bind="args" v-model="tab">
        <TabControl title="Himeko" />
        <TabControl title="Kafka" />
        <TabControl title="Ruan Mei" />
        <TabControl title="Black Swan" />
        <TabControl title="Jade" />
        <TabControl title="Acheron" />
        <TabControl title="Natasha" />
        <TabControl title="Yukong" />
        <TabControl title="Jingliu" />
        <TabControl title="Robin" />
        <TabControl title="Guinafen" />
        <TabControl title="Sushang" />
        <TabControl title="Serval" />
      </TabControls>
      <TabPanels v-model="tab">
        <TabPanel>Panel for Himeko</TabPanel>
        <TabPanel>Panel for Kafka</TabPanel>
        <TabPanel>Panel for Ruan Mei</TabPanel>
        <TabPanel>Panel for Black Swan</TabPanel>
        <TabPanel>Panel for Jade</TabPanel>
        <TabPanel>Panel for Acheron</TabPanel>
        <TabPanel>Panel for Natasha</TabPanel>
        <TabPanel>Panel for Yukong</TabPanel>
        <TabPanel>Panel for Jingliu</TabPanel>
        <TabPanel>Panel for Robin</TabPanel>
        <TabPanel>Panel for Guinafen</TabPanel>
        <TabPanel>Panel for Sushang</TabPanel>
        <TabPanel>Panel for Serval</TabPanel>
      </TabPanels>
    `,
  }),
};

// export const CustomControlButton: Story = {
//   render: (args: any) => ({
//     components: { Tabs, Tab },
//     setup() {
//       return { args };
//     },
//     template: `
//       <Tabs v-bind="args">
//         <Tab title="Himeko">
//           <template #title>
//             <span style="color: var(--color-red-2);">Himeko</span>
//           </template>
//           <p>The tab button are rendered using <strong>#title</strong> slot, title props will be ignored.</p>
//           <p>An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.</p>
//         </Tab>
//         <Tab title="Kafka">
//           <template #title>
//             <span style="color: #D3A6FF;">Kafka</span>
//           </template>
//           <p>The tab button are rendered using <strong>#title</strong> slot, title props will be ignored.</p>
//           <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
//         </Tab>
//       </Tabs>
//     `,
//   }),
// };

// CustomControlButton.storyName = 'Set Custom Control';

// export const LazyTabs: Story = {
//   render: (args: any) => ({
//     components: { Tabs, Tab },
//     setup() {
//       return { args };
//     },
//     template: `
//       <Tabs v-bind="args">
//         <Tab title="Himeko" lazy>
//           <p>Use the <strong>lazy</strong> prop to set the tab item as lazy.</p>
//           <p>An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.</p>
//         </Tab>
//         <Tab title="Kafka" lazy>
//           <p>Use the <strong>lazy</strong> prop to set the tab item as lazy.</p>
//           <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
//         </Tab>
//       </Tabs>
//     `,
//   }),
// };

// LazyTabs.storyName = 'Set Lazy Tab'

// export const ProgrammaticalTabs: Story = {
//   render: (args: any) => ({
//     components: { Tabs, Tab },
//     setup() {
//       return { args };
//     },
//     template: `
//       <Tabs v-bind="args">
//         <Tab title="Himeko">
//           <p>Use the modelValue control to set the active tab.</p>
//           <p>An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.</p>
//         </Tab>
//         <Tab title="Kafka">
//           <p>Use the modelValue control to set the active tab.</p>
//           <p>A member of the Stellaron Hunters who is calm, collected, and beautiful. Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby. People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.</p>
//         </Tab>
//       </Tabs>
//     `,
//   }),
//   argTypes: {
//     modelValue: {
//       control: 'number',
//     },
//   },
//   args: {
//     modelValue: 0,
//   },
// };

// ProgrammaticalTabs.storyName = 'Set Active Tab (v-model)'
