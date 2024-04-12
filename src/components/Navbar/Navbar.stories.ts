import type { Meta, StoryObj } from '@storybook/vue3';

import Ticker,  { TickerItem } from '@components/Ticker';
import Button from '@components/Button';
import Navbar from './Navbar.vue';
import NavbarAction from './NavbarAction.vue';
import NavbarSpacer from './NavbarSpacer.vue';
import { IconBag } from '@icons';

const meta: Meta<typeof Navbar> = {
  component: Navbar,
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
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  render: (args) => ({
    components: { Navbar },
    setup() {
      const testBack = () => {
        console.log('Halo');
      };

      return { args, testBack };
    },
    template: `
      <Navbar v-bind="args" />
    `,
  }),
};

export const WithBackButton: Story = {
  render: (args) => ({
    components: {
      Navbar,
      NavbarAction,
      NavbarSpacer,
      Button,
      IconBag,
    },
    setup() {
      const handleBack = () => {
        console.log('Go back');
      };

      return { args, handleBack };
    },
    template: `
      <Navbar v-bind="args" @back="handleBack" />
    `,
  }),
};
export const WithActionButton: Story = {
  render: (args) => ({
    components: {
      Button,
      IconBag,
      Navbar,
      NavbarAction,
      NavbarSpacer,
      Ticker,
      TickerItem,
    },
    setup() {
      return { args };
    },
    template: `
      <Ticker>
        <TickerItem
          title="Import NavbarAction and NavbarSpacer"
          description="Add stylized button for Navbar by importing NavbarAction and space it between title and action using NavbarSpacer"
        />
      </Ticker>
      <br />
      <Navbar v-bind="args">
        <NavbarSpacer />
        <NavbarAction icon>
          <IconBag />
        </NavbarAction>
      </Navbar>
      <br />
      <Navbar v-bind="args">
        <NavbarSpacer />
        <NavbarAction>Action</NavbarAction>
      </Navbar>
    `,
  }),

};
