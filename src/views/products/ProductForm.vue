<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import { getProduct } from '@database/query/product';

import Button from '@components/Button';
import Text from '@components/Text';
import Textfield from '@components/Textfield';
import Textarea from '@components/Textarea';
import QuantityEditor from '@components/QuantityEditor';
import { Container, Row, Column } from '@components/Layout';

const route = useRoute();
const formData = reactive({
  name: '',
  description: '',
  image: '',
  by: '',
  price: '',
  stock: undefined,
  sku: '',
});

onMounted(() => {
  console.log(route);
});

const handleSubmit = () => {

};
</script>

<template>
  <form id="product-form" @submit="handleSubmit">
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
</template>

<style lang="scss"></style>
