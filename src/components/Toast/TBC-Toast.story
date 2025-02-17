import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import { Button, Text, Ticker } from '@components';
import Toast from './Toast.vue';
import ToastItem from './ToastItem.vue';

const meta: Meta<typeof Toast> = {
  component: Toast,
  argTypes: {},
  args: {},
};

export default meta;

type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  render: (args) => ({
    components: { Button, Ticker, Toast, ToastItem },
    setup() {
      const show = ref(false);

      const handleShow = () => {
        show.value = !show.value;
      };

      return { args, show, handleShow };
    },
    template: `
      <Button @click="handleShow">Show Toast</Button>
      <Toast>
        <ToastItem v-model="show">Toaster message.</ToastItem>
      </Toast>
    `,
  }),
};

export const Expose: Story = {
  render: (args) => ({
    components: { Button, Ticker, Toast, ToastItem },
    setup() {
      const toast = ref();

      const addToast = () => {
        toast.value.add({ message: 'Toaster message.' });
      };

      return { args, toast, addToast };
    },
    template: `
      <Button @click="addToast">Add</Button>
      <Toast ref="toast" v-bind="args" />
    `,
  }),
};

Expose.storyName = 'Exposed Method (Recommended)';
