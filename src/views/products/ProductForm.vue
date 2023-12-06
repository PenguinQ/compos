<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';

import Button from '@components/Button';
import Text from '@components/Text';
import Textfield from '@components/Textfield';
import Textarea from '@components/Textarea';
import QuantityEditor from '@components/QuantityEditor';
import { Container, Row, Column } from '@components/Layout';

import { useProductDetail } from './hooks';

const {
  formData,
  isLoading,
  mutateProduct,
} = useProductDetail();

onMounted(() => {

});

const handleSubmit = (e: Event) => {
  e.preventDefault();

  mutateProduct();
};
</script>

<template>
  <Text v-if="isLoading">Loading...</Text>
  <form v-else id="product-form" @submit="handleSubmit">
    <Container>
      <Row>
        <Column>
          <Textfield label="Name" v-model="formData.name" />
        </Column>
      </Row>
      <Row>
        <Column>
          <Textarea label="Description" v-model="formData.description" />
        </Column>
      </Row>
      <!-- Image
        <Row>
          <Column>
            <Textarea label="Description" v-model="formData.description" />
          </Column>
        </Row>
      -->
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
    </Container>
  </form>
  <Button form="product-form" type="submit">Submit</Button>
</template>

<style lang="scss"></style>
