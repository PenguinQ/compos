<script setup lang="ts">
import Text from '@components/Text';
import Link from '@components/Link';
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
</template>

<style lang="scss" scoped></style>
