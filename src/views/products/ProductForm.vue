<script setup lang="ts">
import { useRouter } from 'vue-router';

import Button from '@components/Button';
import Text from '@components/Text';
import Card, { CardHeader, CardTitle, CardBody } from '@components/Card';
import EmptyState from '@components/EmptyState';
import Textfield from '@components/Textfield';
import Textarea from '@components/Textarea';
import QuantityEditor from '@components/QuantityEditor';
import { Container, Row, Column } from '@components/Layout';
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import { IconArrowLeftShort } from '@icons';

import { useProductForm } from './hooks/ProductForm.hook';

import NoImage from '@assets/illustration/no_image.svg';
import Error from '@assets/illustration/error.svg';

const router = useRouter();
const {
  productID,
  formData,
  isError,
  isLoading,
  refetch,
  handleAddImage,
  handleAddVariant,
  handleAddVariantImage,
  handleRemoveVariant,
  handleRemoveVariantImage,
  handleRemoveImage,
  mutateAdd,
  mutateAddLoading,
  mutateEdit,
  mutateEditLoading,
} = useProductForm();

const handleSubmit = (e: Event) => {
  e.preventDefault();

  productID ? mutateEdit() : mutateAdd();
};

const imageStyle: any = {
  display: 'block',
  width: '100px',
  height: '100px',
  objectFit: 'contain',
};
</script>

<template>
  <Toolbar>
    <ToolbarAction icon @click="router.back">
      <IconArrowLeftShort size="40" />
    </ToolbarAction>
    <ToolbarTitle>Edit Product</ToolbarTitle>
    <ToolbarSpacer />
    <ToolbarAction @click="handleSubmit">{{ mutateAddLoading ? 'Loading' : 'Save' }}</ToolbarAction>
  </Toolbar>

  <EmptyState
    v-if="isError"
    :image="Error"
    :title="'sss'"
    :description="'dsds'"
    margin="80px 0"
  >
    <template #action>
      <Button @click="refetch">Try Again</Button>
    </template>
  </EmptyState>
  <template v-else>
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
            <Card>
              <CardBody>
                <Textfield
                  id="product-name"
                  label="Name"
                  v-model="formData.name"
                  :labelProps="{ for: 'product-name' }"
                />
                <Textarea
                  id="product-description"
                  label="Description"
                  :labelProps="{ for: 'product-description' }"
                  v-model="formData.description"
                />
              </CardBody>
            </Card>
            <div>
              <div style="display: flex; gap: 8px;">
                <div :key="index" v-for="(image, index) in formData.image">
                  <img :src="image.path" :style="imageStyle" />
                  <button type="button" @click="handleRemoveImage(index, image.id, image.path)">Remove Image</button>
                </div>
                <div :key="index" v-for="(image, index) in formData.new_image.preview">
                  <img :src="image" :style="imageStyle" />
                  <button type="button" @click="handleRemoveImage(index)">Remove Image</button>
                </div>
              </div>
              <br />
              <input type="file" accept=".jpg, .jpeg, .png, .webp" @change="handleAddImage" />
            </div>

            <!--  -->
            <br />
            <hr />
            <br />
            <!--  -->

            <Button @click="handleAddVariant">Add Variant</Button>
            <Row>
              <Column col="6" :key="`variant-${index}`" v-for="(variant, index) in formData.variant">
                <div>
                  <div style="display: flex; gap: 8px;">
                    <div :key="imageIndex" v-for="(image, imageIndex) in variant.image">
                      <img :src="image.path" :style="imageStyle" />
                      <button type="button" @click="handleRemoveVariantImage(index, imageIndex, image.id)">
                        Remove Image
                      </button>
                    </div>
                    <div :key="imageIndex" v-for="(image, imageIndex) in variant.new_image.preview">
                      <img :src="image" :style="imageStyle" />
                      <button type="button" @click="handleRemoveVariantImage(index, imageIndex)">
                        Remove Image
                      </button>
                    </div>
                  </div>
                  <br />
                  <input
                    type="file"
                    accept=".jpg, .jpeg, .png, .gif"
                    multiple
                    @change="handleAddVariantImage($event, index)"
                  />
                </div>
                <Textfield label="Variant Name" v-model="variant.name" />
                <Textfield label="Price" v-model="variant.price" />
                <QuantityEditor v-model="variant.stock" />
                <Button @click="handleRemoveVariant(index, variant.id)">Remove Variant</Button>
              </Column>
            </Row>

            <!--  -->
            <br />
            <hr />
            <br />
            <!--  -->

            <Row>
              <Column>
                <Textfield
                  id="product-by"
                  label="By"
                  :labelProps="{ for: 'product-by' }"
                  v-model="formData.by"
                />
              </Column>
            </Row>
            <Row>
              <Column>
                <Textfield
                  id="product-price"
                  label="Price"
                  :labelProps="{ for: 'product-price' }"
                  v-model="formData.price"
                />
              </Column>
              <Column>
                <QuantityEditor id="product-stock" v-model="formData.stock" />
              </Column>
            </Row>
          </Column>
        </Row>
      </Container>
    </form>
  </template>
</template>

<style lang="scss" scoped>

</style>
