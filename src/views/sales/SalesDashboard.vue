<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';

import Button from '@components/Button';
import Text from '@components/Text';
import Textfield from '@components/Textfield';
import Textarea from '@components/Textarea';
import Link from '@components/Link';
import QuantityEditor from '@components/QuantityEditor';
import { Container, Row, Column } from '@components/Layout';
import { Check, Eye, EyeFilled, ArrowDown } from '@icons';

import { setSampleData } from '@database/query/product';
import { useProducts } from '../products/hooks';

const formData = reactive({
  id: '',
  name: '',
  description: '',
  image: '',
  by: '',
  price: 0,
  stock: 0,
  sku: '',
});

const { data, isLoading } = useProducts();
const products = ref<any>(null);

onMounted(() => {
  // Populate sample data
  setSampleData();
});

// onMounted(async () => {
//   console.log(data);

//   const query = await getProducts();
//   const populate = await devPopulateProduct();

//   query.subscribe((product: any) => {
//     products.value = product;
//   });
// });
</script>

<template>
  <!-- {{ data.isLoading ? 'Loading' : data.reference }} -->
  {{ data }}
  {{ isLoading ? 'Loading' : 'Not Loading' }}
  <!-- {{ data.data }} -->
  <Container>
    <Row>
      <Column>
        <Textfield label="ID" v-model="formData.id" />
        <Textfield label="Name" v-model="formData.name" />
        <Textarea label="Description" v-model="formData.description" />
        <Textfield label="Image" v-model="formData.image" />
        <Textfield label="Price" v-model="formData.price" />
        <QuantityEditor v-model="formData.stock" />
        <Textfield label="SKU" v-model="formData.sku" />
      </Column>
    </Row>
    <hr />
    <Row>
      <Column>
        <Button @click="() => addProduct(formData)">Test Add</Button>
      </Column>
    </Row>
    <hr />
    <Row>
      <Column>
        <div v-for="product in products">
          <Link :to="`/product/${product._data.id}`">{{ product._data.name }}</Link>
        </div>
        <!-- <Button @click="() => removeProduct(product._data.id)">Remove</Button>
        <Button @click="() => updateProduct(product._data.id, formData)">Update</Button> -->
      </Column>
    </Row>
  </Container>
</template>

<style lang="scss" scoped></style>
