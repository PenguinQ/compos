import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import Button from '@components/Button';
import Dialog from './Dialog.vue';

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  tags: ['autodocs'],
  argTypes: {

  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: (args) => ({
    components: { Button, Dialog },
    setup() {
      const show1 = ref(false)
      const show2 = ref(false);

      const testCallback = (text: string) => {
        console.log(text);
      };

      const closeAll = () => {
        show1.value = false;
        show2.value = false;
      };

      // @beforeEnter="testCallback('before-enter')"
      // @enter="testCallback('enter')"
      // @afterEnter="testCallback('after-enter')"
      // @enterCancelled="testCallback('enter-cancelled')"
      // @beforeLeave="testCallback('before-leave')"
      // @leave="testCallback('leave')"
      // @afterLeave="testCallback('after-leave')"
      // @leaveCancelled="testCallback('leave-cancelled')"

      return { args, show1, show2, testCallback, closeAll };
    },
    template: `
      <Button @click="show1 = true">Show Dialog 1</Button>
      <Dialog v-model="show1" overflow>
        <Button @click="show2 = true">Show Dialog 2</Button>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
        <p>Lorem</p>
      </Dialog>
      <Dialog v-model="show2">
        <Button @click="closeAll">Close All Dialog</Button>
      </Dialog>
    `,
  }),
};
