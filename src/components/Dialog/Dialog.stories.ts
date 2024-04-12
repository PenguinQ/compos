import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import Button from '@components/Button';
import Text from '@components/Text';
import Ticker,  { TickerItem } from '@components/Ticker';
import Toolbar, { ToolbarAction, ToolbarSpacer, ToolbarTitle } from '@components/Toolbar';
import { IconX, IconWarningCircle } from '@icons';
import Dialog from './Dialog.vue';

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  tags: ['autodocs'],
  argTypes: {
    fullscreen: {
      control: 'boolean',
    },
    maxWidth: {
      control: 'text',
    },
    minWidth: {
      control: 'text',
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
    noClose: false,
    persistent: false,
    title: 'Kafka',
  }
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: (args) => ({
    components: {
      Button,
      Dialog,
      Text,
    },
    setup() {
      const show = ref(false)

      return { args, show };
    },
    template: `
      <Button @click="show = true">Show Dialog</Button>
      <Dialog v-model="show" v-bind="args">
        <Text>
          A member of the Stellaron Hunters who is calm, collected, and beautiful.
          Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby.
          People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.
        </Text>
      </Dialog>
    `,
  }),
};

export const Activator: Story = {
  render: (args) => ({
    components: {
      Button,
      Dialog,
      Text,
      Ticker,
      TickerItem,
    },
    setup() {
      const show = ref(false)

      return { args, show };
    },
    template: `
      <Ticker>
        <TickerItem
          title="Trigger Dialog by Activator"
          description="You can also trigger modal without defining v-model by putting the triggering element inside activator slot and bind provided props to the element."
        />
      </Ticker>

      <br />

      <Dialog v-bind="args">
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

Activator.storyName = 'Show using activator slot'

export const FullscreenCustom: Story = {
  render: (args) => ({
    components: {
      Button,
      Dialog,
      Text,
      Ticker,
      TickerItem,
      Toolbar,
      ToolbarAction,
      ToolbarSpacer,
      ToolbarTitle,
      IconX,
      IconWarningCircle,
    },
    setup() {
      const show = ref(false)

      const alertAction = () => {
        alert('Action clicked!');
      };

      return { args, show, alertAction };
    },
    template: `
      <Ticker>
        <TickerItem
          title="Custom Header"
          description="Default header for dialog only support basic info and action such as title, and close button, to have multi functional header you can utilize Toolbar component to create custom header and put it inside header slot."
        />
      </Ticker>

      <br />

      <Button @click="show = true">Show Dialog</Button>
      <Dialog v-model="show" v-bind="args">
        <template #header>
          <Toolbar>
            <ToolbarAction icon>
              <IconX @click="show = false" size="40" />
            </ToolbarAction>
            <ToolbarTitle>{{ args.title }}</ToolbarTitle>
            <ToolbarSpacer />
            <ToolbarAction icon @click="alertAction">
              <IconWarningCircle />
            </ToolbarAction>
          </Toolbar>
        </template>
        <Text>
          A member of the Stellaron Hunters who is calm, collected, and beautiful.
          Her record on the wanted list of the Interastral Peace Corporation only lists her name and her hobby.
          People have always imagined her to be elegant, respectable, and in pursuit of things of beauty even in combat.
        </Text>
        <div style="height: 1000px; background-color: azure;" />
      </Dialog>
    `,
  }),
  args: {
    fullscreen: true,
  },
};

FullscreenCustom.storyName = 'Fullscreen (Custom Header)';
