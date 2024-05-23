<script setup lang=ts>
import Button from '@components/Button';
import Text from '@components/Text';
import Card, { CardHeader, CardTitle, CardBody } from '@components/Card';
import EmptyState from '@components/EmptyState';
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import { IconArrowLeftShort } from '@components/icons';

import { useSalesForm } from './hooks/SalesForm.hook';

const {
  sales_id,
  isError,
  isLoading,
} = useSalesForm();
</script>

<template>
  <Toolbar sticky>
    <ToolbarAction icon @click="">
      <IconArrowLeftShort size="40" />
    </ToolbarAction>
    <ToolbarTitle>Edit Sales</ToolbarTitle>
    <ToolbarSpacer />
  </Toolbar>
  Edit {{ sales_id }}
</template>
