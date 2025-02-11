import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import Card from './Card.vue';
import CardHeader from './CardHeader.vue';
import CardTitle from './CardTitle.vue';
import CardSubtitle from './CardSubtitle.vue';
import CardBody from './CardBody.vue';

type CardProps = ComponentProps<typeof Card>;

const meta: Meta<CardProps> = {
  component: Card,
  subcomponents: {
    CardHeader,
    CardTitle,
    CardSubtitle,
    CardBody
  },
  argTypes: {
    clickable: {
      control: 'boolean',
    },
    radius: {
      control: 'text',
    },
    content: {
      control: 'text',
    },
    subtitle: {
      control: 'text',
    },
    to: {
      control: 'text',
    },
    title: {
      control: 'text',
    },
    target: {
      control: 'select',
      options: ['_blank', '_self'],
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
    clickable: false,
    target: '_self',
  },
};

export default meta;

type Story = StoryObj<CardProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { Card },
    setup() {
      return { args };
    },
    template: `
      <Card v-bind="args" />
    `,
  }),
  args: {
    content: 'A colossal structure located in the Asdana system, with the soaring hotel "The Reverie" as its iconic landmark. Once a frontier prison belonging to the IPC, The Family had modeled it to serve as an interstellar transportation hub and the gateway to the Sweetdream Paradise.',
    subtitle: 'Planet of Festivities',
    title: 'Penacony',
  },
};

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: { Card },
    setup() {
      return {};
    },
    template: `
      <Card
        title="Penacony"
        subtitle="Planet of Festivities"
        content='A colossal structure located in the Asdana system, with the soaring hotel "The Reverie" as its iconic landmark. Once a frontier prison belonging to the IPC, The Family had modeled it to serve as an interstellar transportation hub and the gateway to the Sweetdream Paradise.'
      />
    `,
  }),
};

export const DocSubcomponents = {
  tags: ['!dev'],
  render: () => ({
    components: {
      Card,
      CardHeader,
      CardTitle,
      CardSubtitle,
      CardBody,
    },
    setup() {
      return {};
    },
    template: `
      <Card>
        <CardHeader>
          <CardTitle>Penacony</CardTitle>
          <CardSubtitle>Planet of Festivities</CardSubtitle>
        </CardHeader>
        <CardBody>
          A colossal <a href="#">structure</a> located in the Asdana system, with the soaring hotel "The Reverie" as its iconic landmark. Once a frontier prison belonging to the IPC, The Family had modeled it to serve as an interstellar transportation hub and the gateway to the Sweetdream Paradise.
        </CardBody>
      </Card>
    `,
  }),
};

export const DocClickable = {
  tags: ['!dev'],
  render: () => ({
    components: { Card },
    setup() {
      const handleClick = () => {
        alert('Clickable Card!');
      };

      return { handleClick };
    },
    template: `
      <Card
        title="Penacony"
        subtitle="Planet of Festivities"
        content='A colossal structure located in the Asdana system, with the soaring hotel "The Reverie" as its iconic landmark. Once a frontier prison belonging to the IPC, The Family had modeled it to serve as an interstellar transportation hub and the gateway to the Sweetdream Paradise.'
        clickable
        @click="handleClick"
      />
    `,
  }),
};

export const DocLink = {
  tags: ['!dev'],
  render: () => ({
    components: { Card },
    setup() {
      return {};
    },
    template: `
      <Card
        title="Penacony"
        subtitle="Planet of Festivities"
        content='A colossal structure located in the Asdana system, with the soaring hotel "The Reverie" as its iconic landmark. Once a frontier prison belonging to the IPC, The Family had modeled it to serve as an interstellar transportation hub and the gateway to the Sweetdream Paradise.'
        to="https://honkai-star-rail.fandom.com/wiki/Penacony"
        target="_blank"
      />
    `,
  }),
};
