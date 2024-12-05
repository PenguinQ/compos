import type { Meta, StoryObj } from '@storybook/vue3';

import Card from './Card.vue';
import CardHeader from './CardHeader.vue';
import CardBody from './CardBody.vue';
import CardTitle from './CardTitle.vue';
import CardSubtitle from './CardSubtitle.vue';

type CardStories = {
  slot_title?: string;
} & typeof Card;

const meta: Meta<typeof Card> = {
  component: Card,
  argTypes: {
    clickable: {
      control: 'boolean',
    },
    to: {
      control: 'text',
    },
    margin: {
      control: 'text',
    },
    padding: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['outline', 'flat'],
    },
  },
  args: {
    // clickable: false,
    // margin: '',
    // padding: '',
    // target: '_self',
    // to: '',
    // variant: undefined,
  },
};

export default meta;

type Story = StoryObj<CardStories>;

export const Default: Story = {
  render: (args) => ({
    components: { Card },
    setup() {
      return { args };
    },
    template: `
      <Card v-bind="args" />
    `,
  }),
  argTypes: {
    content: {
      control: 'text',
    },
    subtitle: {
      control: 'text',
    },
    title: {
      control: 'text',
    },
  },
  args: {
    content: 'A colossal structure located in the Asdana system, with the soaring hotel "The Reverie" as its iconic landmark. Once a frontier prison belonging to the IPC, The Family had modeled it to serve as an interstellar transportation hub and the gateway to the Sweetdream Paradise.',
    subtitle: 'Planet of Festivities',
    title: 'Penacony',
  },
};

export const SlotCompose: Story = {
  render: (args) => ({
    components: {
      Card,
      CardHeader,
      CardBody,
      CardTitle,
      CardSubtitle,
    },
    setup() {
      return { args };
    },
    template: `
      <Card v-bind="args">
        <CardHeader>
          <CardTitle>Penacony</CardTitle>
          <CardSubtitle>Planet of Festivities</CardSubtitle>
        </CardHeader>
        <CardBody>
          A colossal structure located in the Asdana system, with the soaring hotel "The Reverie" as its iconic landmark. Once a frontier prison belonging to the IPC, The Family had modeled it to serve as an interstellar transportation hub and the gateway to the Sweetdream Paradise.
        </CardBody>
      </Card>
    `,
  }),
};
