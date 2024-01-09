<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';

import { createBlob } from 'rxdb';
import Button from '@components/Button';
import Text from '@components/Text';
import Textfield from '@components/Textfield';
import Textarea from '@components/Textarea';
import QuantityEditor from '@components/QuantityEditor';
import { Container, Row, Column } from '@components/Layout';

import { useProductDetail } from './hooks/ProductDetail.hook';

const {
  productID,
  formData,
  isLoading,
  imagePreview,
  handleAddImage,
  handleAddVariant,
  handleRemoveVariant,
  mutateAdd,
  mutateAddLoading,
  mutateEdit,
  mutateEditLoading,
} = useProductDetail();

const handleSubmit = (e: Event) => {
  e.preventDefault();

  productID ? mutateEdit() : mutateAdd();
};
</script>

<template>
  <Text v-if="isLoading">Loading...</Text>
  <form v-else id="product-form" @submit="handleSubmit">
    <Container>
      <Row>
        <Column>
          <Text heading="4">formData</Text>
          <pre>
            {{ formData }}
          </pre>
        </Column>
        <Column>
          <Row>
            <Textfield label="Name" v-model="formData.name" />
            <Textarea label="Description" v-model="formData.description" />
          </Row>
          <br />
          <div>
            <div style="display: flex; gap: 8px;">
              <img
                v-if="imagePreview"
                :src="imagePreview"
                style="width: 100px; height: 100px; object-fit: contain;"
              />
            </div>
            <br />
            <input type="file" accept=".jpg, .jpeg, .png, .gif" @change="handleAddImage" />
          </div>
          <br />
          <Button @click="handleAddVariant">Add Variant</Button>
          <Row>
            <Column col="6" :key="`variant-${index}`" v-for="(variant, index) in formData.variant">
              <Textfield label="Variant Name" v-model="variant.name" />
              <Textfield label="Price" v-model="variant.price" />
              <QuantityEditor v-model="variant.stock" />
              <Button @click="handleRemoveVariant(index, variant.id)">Remove Variant</Button>
            </Column>
          </Row>
          <br />
          <Row>
            <Column>
              <Textfield label="By" v-model="formData.by" />
            </Column>
          </Row>
          <Row>
            <Column>
              <Textfield label="Price" v-model="formData.price" />
            </Column>
            <Column>
              <QuantityEditor v-model="formData.stock" />
            </Column>
          </Row>
        </Column>
      </Row>
    </Container>
  </form>
  <Button form="product-form" type="submit">
    {{ mutateAddLoading ? 'Loading' : 'Submit' }}
  </Button>
</template>

<style lang="scss"></style>
