import type { Meta, StoryObj } from '@storybook/vue3';

import Card from './Card.vue';
import CardHeader from './CardHeader.vue';
import CardBody from './CardBody.vue';
import CardTitle from './CardTitle.vue';
import CardSubtitle from './CardSubtitle.vue';
import Text from '../Text';

const meta: Meta<typeof Card> = {
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    clicky: {
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
    margin: '',
    padding: '',
    clicky: false,
    to: '',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args: any) => ({
    components: { Card, CardHeader, CardBody, CardTitle, CardSubtitle, Text },
    setup() {
      return { args };
    },
    template: `
      <Card v-bind="args">
        <CardHeader>
          <CardTitle>Heading</CardTitle>
          <CardSubtitle>Subtitle</CardSubtitle>
        </CardHeader>
        <CardBody>Card content.</CardBody>
      </Card>
    `,
  }),
};
