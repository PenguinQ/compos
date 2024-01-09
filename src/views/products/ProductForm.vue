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
  handleAddImage,
  handleAddVariant,
  handleAddVariantImage,
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
        <Column col="6">
          <Text heading="4">formData</Text>
          <pre style="overflow: auto;">
            {{ formData }}
          </pre>
          <br />
          <Button form="product-form" type="submit">
            {{ mutateAddLoading ? 'Loading' : 'Submit' }}
          </Button>
        </Column>
        <Column col="6">
          <Textfield label="Name" v-model="formData.name" />
          <br />
          <Textarea label="Description" v-model="formData.description" />
          <br />
          <div>
            <div style="display: flex; gap: 8px;">
              <img
                v-if="productID ? formData.image[0] : formData.image_preview"
                :src="productID ? formData.image[0] : formData.image_preview"
                style="width: 100px; height: 100px; object-fit: contain;"
              />
            </div>
            <br />
            <input type="file" accept=".jpg, .jpeg, .png, .gif" @change="handleAddImage" />
          </div>
          <br />
          <hr />
          <br />
          <Button @click="handleAddVariant">Add Variant</Button>
          <Row>
            <Column col="6" :key="`variant-${index}`" v-for="(variant, index) in formData.variant">
              <div>
                <div style="display: flex; gap: 8px;">
                  <img
                    v-if="variant.image_preview"
                    :src="variant.image_preview"
                    style="width: 100px; height: 100px; object-fit: contain;"
                  />
                </div>
                <br />
                <input type="file" accept=".jpg, .jpeg, .png, .gif" @change="handleAddVariantImage($event, index)" />
              </div>
              <Textfield label="Variant Name" v-model="variant.name" />
              <Textfield label="Price" v-model="variant.price" />
              <QuantityEditor v-model="variant.stock" />
              <Button @click="handleRemoveVariant(index, variant.id)">Remove Variant</Button>
            </Column>
          </Row>
          <br />
          <hr />
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
</template>

<style lang="scss"></style>
