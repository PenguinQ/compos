<script setup lang="ts">
import { reactive, ref, onMounted, StyleValue } from 'vue';
import { useRouter } from 'vue-router';

// Common Components
import Button from '@components/Button';
import EmptyState from '@components/EmptyState';
import Text from '@components/Text';
import Textfield from '@components/Textfield';
import Textarea from '@components/Textarea';
import QuantityEditor from '@components/QuantityEditor';
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import { Container, Row, Column } from '@components/Layout';
import { Bar } from '@components/Loader';
import { IconArrowLeftShort, IconXLarge } from '@icons';

// Hooks
import { useBundleForm } from './hooks/BundleForm.hook';

// Constants
import GLOBAL from '@/views/constants';

const router = useRouter();
const {
  bundle_id,
  formData,
  bundleDetailError,
  bundleDetailLoading,
  bundleDetailRefetch,
  mutateAdd,
  mutateAddLoading,
  mutateEdit,
  mutateEditLoading,
} = useBundleForm();
</script>

<template>
  <Toolbar sticky>
    <ToolbarAction icon @click="router.back">
      <IconArrowLeftShort size="40" />
    </ToolbarAction>
    <ToolbarTitle>{{ bundle_id ? 'Edit Bundle' : 'Add Bundle' }}</ToolbarTitle>
    <ToolbarSpacer />
    <ToolbarAction @click="() => {}">{{ mutateAddLoading || mutateEditLoading ? 'Loading' : 'Save' }}</ToolbarAction>
  </Toolbar>
  <Container>
    <EmptyState
      v-if="bundleDetailError"
      :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
      :title="GLOBAL.ERROR_EMPTY_TITLE"
      :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
      margin="56px 0"
    >
      <template #action>
        <Button @click="bundleDetailRefetch">Try Again</Button>
      </template>
    </EmptyState>
    <template v-else>
      <Bar v-if="bundleDetailLoading" margin="56px 0" />
      <template v-else>
        <form id="bundle-form"></form>
      </template>
    </template>
    <Row v-else>
      <Column col="6">
        <Text heading="4">Bundle Form Data</Text>
        <pre style="overflow: auto;">
          {{ formData }}
        </pre>
        <br />
        <Button type="button" @click="handleSubmit">
          {{ bundleID ? mutateEditLoading ? 'Loading...' : 'Edit' : mutateAddLoading ? 'Loading...' : 'Add' }}
        </Button>
      </Column>
      <Column col="6">
        <form id="bundle-form" @submit="handleSubmit">
          <Textfield label="Name" v-model="formData.name" />
          <br />
          <Textarea label="Description" v-model="formData.description" />
          <br />
          <Textfield label="Price" v-model="formData.price" />
          <br />
          <Text heading="5">Products</Text>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px;">
            <div v-for="product in formData.product" :style="productStyle">
              <img :style="imageStyle" v-for="image in product.image" :src="image" />
              <template v-if="product.product_name">
                {{ product.product_name }} - {{ product.name }}
              </template>
              <template v-else>
                {{ product.name }}
              </template>
              <Button style="margin-left: auto;" @click="">Remove</Button>
            </div>
          </div>
          <Button @click="">Add</Button>
        </form>
      </Column>
    </Row>
  </Container>
</template>

<style lang="scss"></style>
