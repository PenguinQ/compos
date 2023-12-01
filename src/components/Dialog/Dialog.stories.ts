import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import Button from '@components/Button';
import Text from '@components/Text';
import Dialog from './Dialog.vue';

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  tags: ['autodocs'],
  argTypes: {
    maxWidth: {
      control: 'text',
    },
    minWidth: {
      control: 'text',
    },
    fullscreen: {
      control: 'boolean',
    },
    noClose: {
      control: 'boolean',
    },
    overflow: {
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
    overflow: false,
    persistent: false,
  }
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: (args) => ({
    components: { Button, Dialog, Text },
    setup() {
      const show = ref(false)

      return { args, show };
    },
    template: `
      <Text>Modal shown: {{ show }}</Text>
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
