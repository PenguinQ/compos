<script setup lang="ts">
import { reactive, ref, onMounted, StyleValue } from 'vue';

import Button from '@components/Button';
import Text from '@components/Text';
import Textfield from '@components/Textfield';
import Textarea from '@components/Textarea';
import QuantityEditor from '@components/QuantityEditor';
import { Container, Row, Column } from '@components/Layout';
import { useBundleForm } from './hooks/BundleForm.hook';

const {
  bundleID,
  formData,
  detailLoading,
  mutateAdd,
  mutateAddLoading,
  mutateEdit,
  mutateEditLoading,
} = useBundleForm();

const handleSubmit = (e: Event) => {
  e.preventDefault();

  bundleID ? mutateEdit() : mutateAdd();
};

const productStyle: StyleValue = {
  border: '1px solid black',
  borderRadius: '6px',
  padding: '8px',
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
};

const imageStyle: StyleValue = {
  width: '40px',
  height: '40px',
  objectFit: 'contain',
};
</script>

<template>
  <Container>
    <Text v-if="detailLoading">Loading...</Text>
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
