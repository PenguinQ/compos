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
  addVariant,
  removeVariant,
  mutateAddLoading,
  mutateAdd,
  mutateEditLoading,
  mutateEdit,
} = useProductDetail();

const handleSubmit = (e: Event) => {
  e.preventDefault();

  productID ? mutateEdit() : mutateAdd();
};

const handleFileChange = (e: any) => {
  const files = e.target.files;
  const reader = new FileReader();
  const blobArray = [];

  [...files].forEach((element: any) => {
    const { type } = element

    console.log(element)
    const blob = createBlob(element, type);

    console.log(blob);

    // reader.onload = () => {
    //   console.log(reader.result);
    // }
    // reader.readAsDataURL(blob);
    // console.log(createBlob('wkwkwk', 'text/plain'));
  });

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
            <input type="file" @change="handleFileChange" multiple accept=".jpg, .jpeg, .png, .gif" />
            <img src="" />
          </Row>
          <br />
          <Button @click="addVariant">Add Variant</Button>
          <Row>
            <Column col="6" :key="`variant-${index}`" v-for="(variant, index) in formData.variant">
              <Textfield label="Variant Name" v-model="variant.name" />
              <Textfield label="Price" v-model="variant.price" />
              <QuantityEditor v-model="variant.stock" />
              <Button @click="removeVariant(index, variant.id)">Remove Variant</Button>
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
