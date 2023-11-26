<script setup lang="ts">
import Text from '@components/Text';
import Textfield from '@components/Textfield';
import Textarea from '@components/Textarea';
import Link from '@components/Link';
import QuantityEditor from '@components/QuantityEditor';
import { Check, Eye, EyeFilled, ArrowDown } from '@icons';

const testCallback = () => {
  console.log('Test Callback');
};
</script>

<template>
  <Text heading="1">This is Sales Dashboard page</Text>
  <Text heading="2">This is Sales Dashboard page</Text>
  <Text heading="3">This is Sales Dashboard page</Text>
  <Text heading="4">This is Sales Dashboard page</Text>
  <Text heading="5">This is Sales Dashboard page</Text>
  <Text heading="6">This is Sales Dashboard page</Text>
  <Text body="large">This is Sales Dashboard page</Text>
  <Text body="medium">This is Sales Dashboard page</Text>
  <Text body="small">This is Sales Dashboard page</Text>
  <Text body="micro">This is Sales Dashboard page</Text>
  <Text body="medium">
    External link inside {{ `<Text>` }} <Link to="https://www.google.com">Link Text</Link>
  </Text>
  <Text body="medium">
    App link inside {{ `<Text>` }} <Link to="/sales/running">Link Text</Link>
  </Text>
  <hr />
  <Eye size="48px" />
  <EyeFilled />
  <ArrowDown />
  <Check />
  <hr />
  <Textfield />
  <Textfield label="Textfield Label" />
  <Textfield label="Textfield Label" message="Textarea message" />
  <hr />
  <Textarea />
  <Textarea label="Textarea Label" />
  <Textarea label="Textarea Label" message="Textarea message" />
  <hr />
  <QuantityEditor
    @on-click-decrement="testCallback"
    @on-click-increment="testCallback"
  />
  <hr />
</template>

<style lang="scss" scoped></style>
