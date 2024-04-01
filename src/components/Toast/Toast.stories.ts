import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import Toast from './Toast.vue';
import ToastItem from './ToastItem.vue';
import Button from '@components/Button';
import Text from '@components/Text';
import Ticker from '@components/Ticker';

const meta: Meta<typeof Toast> = {
  component: Toast,
  tags: ['autodocs'],
  argTypes: {

  },
  args: {

  },
};

export default meta;

type Story = StoryObj<typeof Toast>;

export const Items: Story = {
  render: (args) => ({
    components: { Button, Ticker, Toast, ToastItem, Text },
    setup() {
      const toast = ref();
      const show = ref(false);

      const handleShow = () => {
        show.value = !show.value;
      };

      const handleClick = () => {
        toast.value.add({ message: 'Toast Item', duration: 1000 });
      };

      return { args, toast, show, handleClick, handleShow };
    },
    template: `
      <Button @click="handleClick">Add</Button>
      <Toast ref="toast" v-bind="args" />

      <br />
      <br />

      <Button @click="handleShow">Show Toast</Button>
      <Toast>
        <ToastItem v-model="show" message="Test" :duration="1000" />
      </Toast>
    `,
  }),
};
