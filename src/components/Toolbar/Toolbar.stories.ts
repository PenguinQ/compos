import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { TabControls, TabControl } from '@components';
import ComposIcon, { ArrowLeftShort, Bag } from '@components/Icons';
import Toolbar from './Toolbar.vue';
import ToolbarAction from './ToolbarAction.vue';
import ToolbarSpacer from './ToolbarSpacer.vue';
import ToolbarTitle from './ToolbarTitle.vue';

type ToolbarProps = ComponentProps<typeof Toolbar>;

const meta: Meta<ToolbarProps> = {
  component: Toolbar,
  subcomponents: {
    ToolbarAction,
    ToolbarSpacer,
  },
  argTypes: {
    title: {
      control: 'text',
    },
  },
  args: {
    title: 'Jarilo-VI',
  },
};

export default meta;

type Story = StoryObj<ToolbarProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { Toolbar },
    setup() {
      return { args };
    },
    template: `
      <Toolbar v-bind="args" />
    `,
  }),
};

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: { Toolbar },
    setup() {
      return {};
    },
    template: `
      <Toolbar title="Penacony" />
    `,
  }),
};

export const DocSubcomponents = {
  tags: ['!dev'],
  render: () => ({
    components: {
      ComposIcon,
      Toolbar,
      ToolbarAction,
      ToolbarSpacer,
      ToolbarTitle,
    },
    setup() {
      const handleBack = () => {
        alert('Back button clicked!');
      };

      const handleAction = () => {
        alert('Action button clicked!');
      };

      return {
        ArrowLeftShort,
        Bag,
        handleBack,
        handleAction,
      };
    },
    template: `
      <Toolbar v-bind="args">
        <ToolbarAction icon @click="handleBack">
          <ComposIcon :icon="ArrowLeftShort" :size="40" />
        </ToolbarAction>
        <ToolbarTitle>Penacony</ToolbarTitle>
        <ToolbarSpacer />
        <ToolbarAction icon @click="handleAction">
          <ComposIcon :icon="Bag" :size="24" />
        </ToolbarAction>
      </Toolbar>
    `,
  }),
};

export const DocExtension = {
  tags: ['!dev'],
  render: () => ({
    components: {
      ComposIcon,
      TabControls,
      TabControl,
      Toolbar,
      ToolbarAction,
      ToolbarSpacer,
      ToolbarTitle,
    },
    setup() {
      const tab = ref(0);

      const handleBack = () => {
        alert('Back button clicked!');
      };

      return {
        tab,
        ArrowLeftShort,
        handleBack,
      };
    },
    template: `
      <Toolbar v-bind="args">
        <ToolbarAction icon @click="handleBack">
          <ComposIcon :icon="ArrowLeftShort" :size="40" />
        </ToolbarAction>
        <ToolbarTitle>Penacony</ToolbarTitle>
        <template #extension>
          <TabControls v-model="tab" grow>
            <TabControl title="Reality" />
            <TabControl title="Dreamscape" />
          </TabControls>
        </template>
      </Toolbar>
    `,
  }),
};
