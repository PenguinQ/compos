<script setup lang="ts">
import { useRouter } from 'vue-router';

import Button from '@components/Button';
import Text from '@components/Text';
import EmptyState from '@components/EmptyState';
import { Shimmer } from '@components/Loader';
import Navbar, { NavbarAction } from '@components/Navbar';
import { IconPencilSquare, IconTrash } from '@icons';

import Error from '@assets/illustration/error.svg';

import { useBundleDetail } from './hooks/BundleDetail.hook';

const router = useRouter();
const {
  data,
  isLoading,
  isError,
  refetch,
} = useBundleDetail();
</script>

<template>
  <Navbar :title="data ? data.name : ''" sticky>
    <template v-if="!isError && !isLoading" #action>
      <NavbarAction
        backgroundColor="var(--color-blue-3)"
        @click="router.push(`/bundle/edit/${data.id}`)"
      >
        <IconPencilSquare color="#FFF" />
      </NavbarAction>
      <NavbarAction
        backgroundColor="var(--color-red-3)"
        @click="() => {}"
      >
        <IconTrash color="#FFF" />
      </NavbarAction>
    </template>
  </Navbar>
  <EmptyState
    v-if="isError"
    :image="Error"
    title="Oops..."
    description="Looks like there's some thing wrong, please try again."
    margin="80px 0"
  >
    <template #action>
      <Button @click="refetch">Try Again</Button>
    </template>
  </EmptyState>
  <template v-else>
    <Shimmer v-if="isLoading" width="100%" height="50px" animate />
    <template v-else>
      <pre style="overflow: auto;">
        {{ data }}
      </pre>
    </template>
  </template>
</template>

<style lang="scss"></style>
