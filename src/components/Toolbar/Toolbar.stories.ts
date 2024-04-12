import type { Meta, StoryObj } from '@storybook/vue3';

import Ticker,  { TickerItem } from '@components/Ticker';
import Button from '@components/Button';
import Toolbar from './Toolbar.vue';
import ToolbarAction from './ToolbarAction.vue';
import ToolbarSpacer from './ToolbarSpacer.vue';
import { IconBag } from '@icons';

const meta: Meta<typeof Toolbar> = {
  component: Toolbar,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text'
    },
    ['onBack']: {
      table: {
        disable: true,
      },
    },
  },
  args: {
    title: 'Jarilo-VI',
    onBack: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
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

export const WithAction: Story = {
  render: (args) => ({
    components: {
      Button,
      IconBag,
      Toolbar,
      ToolbarAction,
      ToolbarSpacer,
      Ticker,
      TickerItem,
    },
    setup() {
      return { args };
    },
    template: `
      <Ticker>
        <TickerItem
          title="Import ToolbarAction and ToolbarSpacer"
          description="Add stylized button for Navbar by importing NavbarAction and space it between title and action using NavbarSpacer"
        />
      </Ticker>
      <br />
      <Toolbar v-bind="args">
        <ToolbarSpacer />
        <ToolbarAction icon>
          <IconBag />
        </ToolbarAction>
      </Toolbar>
      <br />
      <Toolbar v-bind="args">
        <ToolbarSpacer />
        <ToolbarAction>Action</ToolbarAction>
      </Toolbar>
    `,
  }),

};
