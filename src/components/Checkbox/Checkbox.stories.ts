import { ref, watch } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { Text } from '@components';
import Checkbox from './Checkbox.vue';

import { onlyShowArgs } from '@docs/helpers';

/**
 * ------------------------
 * Reference Checkbox State
 * ------------------------
 * 1. state jade, no value                           : uncheck jade -> checked true     -> uncheck false (PASS)
 * 2. state jade, no value, t-v jade                 : checked jade -> uncheck false    -> checked jade  (PASS)
 * 3. state jade, no value, f-v jade                 : uncheck jade -> checked true     -> uncheck jade  (PASS)
 * 3. state jade, no value, t-v jade, f-v: himeko    : checked jade -> unchecked himeko -> checked jade  (PASS)
 * 4. state jade, value jade                         : checked jade -> uncheck false    -> checked jade  (PASS)
 * 5. state jade, value jade, t-v jade               : checked jade -> uncheck false    -> checked jade  (PASS)
 * 6. state jade, value jade, t-v jade, f-v himeko   : checked jade -> uncheck himeko   -> checked jade  (PASS)
 * 7. state jade, value jade, t-v himeko             : uncheck jade -> checked himeko   -> uncheck false (PASS)
 * 8. state jade, value jade, t-v himeko, f-v jade   : uncheck jade -> checked himeko   -> uncheck jade  (PASS)
 * 9. state jade, value himeko                       : uncheck jade -> checked himeko   -> uncheck false (PASS)
 * 10. state jade, value himeko, t-v himeko          : uncheck jade -> checked himeko   -> uncheck false (PASS)
 * 11. state jade, value himeko, t-v himeko, f-v jade: uncheck jade -> checked himeko   -> uncheck jade  (PASS)
 * 12. state jade, value himeko, t-v jade            : checked jade -> uncheck false    -> checked jade  (PASS)
 * 13. state jade, value himeko, t-v jade, f-v himeko: checked jade -> uncheck himeko   -> checked jade  (PASS)
 *
 */

type CheckboxProps = ComponentProps<typeof Checkbox>;

const defaultArgs: any = {
  containerProps: {
    control: 'object',
  },
  disabled: {
    control: 'boolean',
  },
  error: {
    control: 'boolean',
  },
  falseValue: {
    control: 'text',
  },
  full: {
    control: 'boolean',
  },
  label: {
    control: 'text',
  },
  labelProps: {
    control: 'object',
  },
  message: {
    control: 'text',
  },
  modelValue: {
    name: 'v-model',
    control: 'text',
  },
  tabindex: {
    control: 'text',
  },
  trueValue: {
    control: 'text',
  },
  value: {
    control: 'text',
  },
};

const meta: Meta<CheckboxProps> = {
  component: Checkbox,
  argTypes: defaultArgs,
  args: {
    containerProps: undefined,
    label: '',
    labelProps: undefined,
    message: '',
    modelValue: '',
    value: '',
    trueValue: '',
    falseValue: '',
    disabled: undefined,
    error: undefined,
    full: undefined,
    tabindex: '',
  },
};

export default meta;

type Story = StoryObj<CheckboxProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { Checkbox },
    setup() {
      return { args };
    },
    template: `
      <Checkbox v-bind="args" />
    `,
  }),
};

export const MultipleSelection: Story = {
  render: (args) => ({
    components: { Checkbox, Text },
    setup() {
      const selected = ref([]);

      return { args, selected };
    },
    template: `
      <Text margin="0 0 16px">Selected Checkboxes: {{ selected }}</Text>
      <div style="display: flex; gap: 16px;">
        <Checkbox v-model="selected" value="Kafka" label="Kafka" />
        <Checkbox v-model="selected" value="Himeko" label="Himeko" />
        <Checkbox v-model="selected" value="Natasha" label="Natasha" />
        <Checkbox v-model="selected" value="Ruan Mei" label="Ruan Mei" />
      </div>
    `,
  }),
  argTypes: onlyShowArgs(defaultArgs, []),
};

export const UsingVModel: Story = {
  name: 'Using v-model (two-way data binding)',
  render: (args) => ({
    components: { Text, Checkbox },
    setup() {
      const checkboxValue = ref(args.modelValue);

      watch(
        () => args.modelValue,
        (newValue) => {
          checkboxValue.value = newValue as any;
        },
      );

      return { args, checkboxValue };
    },
    template: `
      <Text margin="0 0 4px">Checkbox value: {{ args.value }}</Text>
      <Text margin="0 0 16px">Checkbox v-model: {{ checkboxValue }}</Text>
      <Checkbox v-bind="args" v-model="checkboxValue" />
    `,
  }),
  argTypes: onlyShowArgs(defaultArgs, [
    'label',
    'value',
    'modelValue',
    'trueValue',
    'falseValue',
  ]),
  args: {
    label: `Make public your Trailblazer Profile's Collection`,
    value: 'Yes',
    modelValue: 'Yes',
    trueValue: undefined,
    falseValue: undefined,
  },
};

export const UsingValue: Story = {
  name: 'Using value (non two-way data binding)',
  render: (args) => ({
    components: { Text, Checkbox },
    setup() {
      const checkboxValue = ref<string | number | boolean>(args.value as string);

      watch(
        () => args.value,
        (newValue) => {
          if (newValue) checkboxValue.value = newValue;
        },
      );

      const handleChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const checked = target.checked;

        if (checked) {
          checkboxValue.value = target.value;
        } else {
          checkboxValue.value = false;
        }
      };

      return { args, checkboxValue, handleChange };
    },
    template: `
      <Text>Checkbox value: {{ checkboxValue }}</Text>
      <Checkbox v-bind="args" @change="handleChange" />
    `,
  }),
  argTypes: onlyShowArgs(defaultArgs, [
    'label',
    'value',
    'trueValue',
  ]),
  args: {
    label: `Make public your Trailblazer Profile's Collection`,
    value: 'Yes',
    trueValue: undefined,
  },
};
