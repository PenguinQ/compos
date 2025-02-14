import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import {
  Button,
  Text,
  Ticker,
  TickerItem,
  Toolbar,
  ToolbarAction,
  ToolbarSpacer,
  ToolbarTitle,
} from '@components';
import ComposIcon, { X, WarningCircle } from '@components/Icons';
import Dialog from './Dialog.vue';

type DialogProps = ComponentProps<typeof Dialog>;

const meta: Meta<DialogProps> = {
  component: Dialog,
  argTypes: {
    fullscreen: {
      control: 'boolean',
    },
    hideHeader: {
      control: 'boolean',
    },
    maxWidth: {
      control: 'text',
    },
    minWidth: {
      control: 'text',
    },
    modelValue: {
      name: 'v-model',
      control: 'boolean',
    },
    noClose: {
      control: 'boolean',
    },
    persistent: {
      control: 'boolean',
    },
    title: {
      control: 'text',
    },
    width: {
      control: 'text',
    },
  },
  args: {
    fullscreen: false,
    hideHeader: false,
    modelValue: true,
    noClose: false,
    persistent: false,
    title: 'Kafka',
  },
};

export default meta;

type Story = StoryObj<DialogProps>;

export const Playground: Story = {
  render: (args) => ({
    components: {
      Button,
      Dialog,
      Text,
    },
    setup() {
      return { args };
    },
    template: `
      <Dialog v-bind="args">
        <Text>
          A member of the Stellaron Hunters who is calm, collected, and beautiful.
          Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby.
          People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.
        </Text>
      </Dialog>
    `,
  }),
};

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: {
      Button,
      Dialog,
      Text,
    },
    setup() {
      const show = ref(false);

      return { show };
    },
    template: `
      <Button @click="show = !show">Show Dialog</Button>
      <Dialog v-model="show" title="Kafka">
        <Text>
          A member of the Stellaron Hunters who is calm, collected, and beautiful.
          Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby.
          People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.
        </Text>
      </Dialog>
    `,
  }),
};

export const DocActivator = {
  tags: ['!dev'],
  render: () => ({
    components: {
      Button,
      Dialog,
      Text,
    },
    setup() {
      return {};
    },
    template: `
      <Dialog title="Kafka">
        <template #activator="{ props }">
          <Button v-bind="props">Show Dialog</Button>
        </template>
        <Text>
          A member of the Stellaron Hunters who is calm, collected, and beautiful.
          Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby.
          People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.
        </Text>
      </Dialog>
    `,
  }),
};

export const DocSlotHeader = {
  tags: ['!dev'],
  render: () => ({
    components: {
      Button,
      Dialog,
      Text,
    },
    setup() {
      const show = ref(false);

      return { show };
    },
    template: `
      <Button @click="show = !show">Show Dialog</Button>
      <Dialog v-model="show">
        <template #header>
          <Text
            heading="3"
            color="var(--color-red-4)"
            textAlign="center"
            margin="16px 0 0"
          >
            Kafka
          </Text>
        </template>
        <Text>
          A member of the Stellaron Hunters who is calm, collected, and beautiful.
          Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby.
          People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.
        </Text>
      </Dialog>
    `,
  }),
};

export const DocSlotFooter = {
  tags: ['!dev'],
  render: () => ({
    components: {
      Button,
      Dialog,
      Text,
    },
    setup() {
      const show = ref(false);

      return { show };
    },
    template: `
      <Button @click="show = !show">Show Dialog</Button>
      <Dialog v-model="show" title="Kafka">
        <Text>
          A member of the Stellaron Hunters who is calm, collected, and beautiful.
          Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby.
          People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.
        </Text>
        <template #footer>
          <div style="padding: 0 16px 16px;">
            <Button full @click="show = false">Close Dialog</Button>
          </div>
        </template>
      </Dialog>
    `,
  }),
};

export const DocFullscreen = {
  tags: ['!dev'],
  render: () => ({
    components: {
      Button,
      Dialog,
      Text,
    },
    setup() {
      const show = ref(false);

      return { show };
    },
    template: `
      <Button @click="show = !show">Show Dialog</Button>
      <Dialog v-model="show" title="Kafka" fullscreen>
        <Text>
          A member of the Stellaron Hunters who is calm, collected, and beautiful.
          Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby.
          People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.
        </Text>
      </Dialog>
    `,
  }),
};
