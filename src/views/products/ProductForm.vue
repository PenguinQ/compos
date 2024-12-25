<script setup lang="ts">
import { watch } from 'vue';
import { useRouter } from 'vue-router';

// Common Components
import {
  Header,
  Content,
  Container,
  Row,
  Column,
  Bar,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardSubtitle,
  CardTitle,
  EmptyState,
  PullToRefresh,
  QuantityEditor,
  Textarea,
  Textfield,
  Ticker,
  Toolbar,
  ToolbarAction,
  ToolbarSpacer,
  ToolbarTitle,
} from '@/components';
import ComposIcon, { ArrowLeftShort, Save, XLarge } from '@/components/Icons';

// View Components
import { ProductImage } from '@/views/components';

// Hooks
import { useProductForm } from './hooks/ProductForm.hook';

// Constants
import GLOBAL from '@/views/constants';
import { PRODUCT_FORM } from './constants';

// Assets
import no_image from '@assets/illustration/no_image.svg';

const router = useRouter();
const {
  productId,
  productDetail,
  formData,
  formError,
  productDetailError,
  productDetailLoading,
  mutateAddLoading,
  mutateEditLoading,
  productDetailRefetch,
  handleAddImage,
  handleAddVariant,
  handleAddVariantImage,
  handleRemoveVariant,
  handleRemoveVariantImage,
  handleRemoveImage,
  handleSubmit,
  handleRefresh,
} = useProductForm();

watch(
  productDetail,
  (newData) => {
    const { name } = newData;

    document.title = `Edit ${name} - ComPOS`;
  },
);
</script>

<template>
  <Header>
    <Toolbar>
      <ToolbarAction icon @click="router.push('/product')">
        <ComposIcon :icon="ArrowLeftShort" :size="40" />
      </ToolbarAction>
      <ToolbarTitle>{{ productId ? `Edit ${productDetail ? productDetail.name : 'Product'}` : 'Add Product' }}</ToolbarTitle>
      <ToolbarSpacer />
      <ToolbarAction v-if="mutateAddLoading || mutateEditLoading" backgroundColor="var(--color-blue-4)" icon>
        <Bar size="24px" color="var(--color-white)" />
      </ToolbarAction>
      <ToolbarAction v-else backgroundColor="var(--color-blue-4)" icon @click="handleSubmit">
        <ComposIcon :icon="Save" color="var(--color-white)" />
      </ToolbarAction>
    </Toolbar>
  </Header>
  <Content>
    <template v-if="productId" #fixed>
      <PullToRefresh @refresh="handleRefresh" />
    </template>
    <Container class="page-container">
      <EmptyState
        v-if="productDetailError"
        :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
        :title="GLOBAL.ERROR_EMPTY_TITLE"
        :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
        margin="56px 0"
      >
        <template #action>
          <Button @click="productDetailRefetch">Try Again</Button>
        </template>
      </EmptyState>
      <template v-else>
        <Bar v-if="productDetailLoading" margin="56px 0" />
        <form v-else id="product-form" @submit.prevent>
          <Row>
            <Column :col="{ default: 12, md: 'auto' }">
              <div class="product-form-image" :data-error="true">
                <label>
                  <ProductImage borderless>
                    <template v-if="formData.images.length || formData.newImages.length">
                      <img
                        v-if="formData.newImages.length"
                        v-for="image of formData.newImages"
                        :src="(image.url as string)"
                        :alt="`${formData.name} Image`"
                      />
                      <img
                        v-else
                        v-for="image of formData.images"
                        :src="(image.url as string)"
                        :alt="`${formData.name} Image`"
                      />
                    </template>
                    <img v-else :src="no_image" :alt="`${formData.name} image`">
                  </ProductImage>
                  <input type="file" accept=".jpg, .jpeg, .png, .webp" @change="handleAddImage" />
                </label>
                <div v-if="formData.images.length || formData.newImages.length" class="product-form-image__actions">
                  <Button @click="handleRemoveImage" variant="outline" color="red" full>Remove</Button>
                </div>
              </div>
            </Column>
            <Column>
              <Row>
                <Column col="12">
                  <Card class="section-card" variant="outline">
                    <CardHeader>
                      <CardTitle>General</CardTitle>
                      <CardSubtitle>General information about this product.</CardSubtitle>
                    </CardHeader>
                    <CardBody>
                      <div class="product-form-fields">
                        <Textfield
                          id="product-name"
                          label="Name"
                          :labelProps="{ for: 'product-name' }"
                          :error="formError.name ? true : false"
                          :message="formError.name"
                          v-model="formData.name"
                        />
                        <Textarea
                          id="product-description"
                          label="Description"
                          :labelProps="{ for: 'product-description' }"
                          v-model="formData.description"
                        />
                        <Textfield
                          id="product-by"
                          label="By"
                          :labelProps="{ for: 'product-by' }"
                          v-model="formData.by"
                        />
                        <Ticker
                          v-if="formData.variants.length"
                          :items="[
                            {
                              title: 'Default Price and Stock Disabled',
                              description: `Since this product has variants that has their own price and stock, the default price and stock of this product will not be used.`,
                              type: 'info',
                            },
                          ]"
                        />
                        <template v-else>
                          <Textfield
                            id="product-price"
                            label="Price"
                            prepend="Rp"
                            v-model="formData.price"
                            :labelProps="{ for: 'product-price' }"
                            :error="formError.price ? true : false"
                            :message="formError.price"
                          />
                          <QuantityEditor
                            id="product-stock"
                            label="Stock"
                            v-model.number="formData.stock"
                            :labelProps="{ for: 'product-stock' }"
                            :error="formError.stock ? true : false"
                            :message="formError.stock"
                          />
                          <Textfield
                            id="product-sku"
                            label="SKU"
                            v-model="formData.sku"
                            :labelProps="{ for: 'product-sku' }"
                          />
                        </template>
                      </div>
                    </CardBody>
                  </Card>
                </Column>
                <Column col="12">
                  <Card class="section-card" variant="outline">
                    <CardHeader>
                      <CardTitle>Variants</CardTitle>
                      <CardSubtitle>Variants available for this product.</CardSubtitle>
                    </CardHeader>
                    <CardBody>
                      <EmptyState
                        v-if="!formData.variants.length"
                        emoji="🍃"
                        :title="PRODUCT_FORM.EMPTY_VARIANT_TITLE"
                        :description="PRODUCT_FORM.EMPTY_VARIANT_DESCRIPTION"
                        margin="56px 0"
                      >
                        <template #action>
                          <Button @click="handleAddVariant">Add Variant</Button>
                        </template>
                      </EmptyState>
                      <template v-else>
                        <div class="product-form-variants">
                          <div class="product-form-variant" v-for="(variant, index) of formData.variants" :key="`variant-${index}`">
                            <div class="product-form-variant__header">
                              <div class="product-form-variant__title">
                                Variant {{ index + 1 }}
                              </div>
                              <button
                                type="button"
                                class="product-form-variant__remove"
                                @click="handleRemoveVariant(index, variant.id)"
                                >
                                <ComposIcon :icon="XLarge" />
                              </button>
                            </div>
                            <div class="product-form-variant__body">
                              <Row>
                                <Column :col="{ default: 12, md: 'auto' }">
                                  <div class="product-form-image product-form-image--variant">
                                    <label>
                                      <ProductImage borderless>
                                        <template v-if="variant.images.length || variant.newImages.length">
                                          <img
                                            v-if="variant.newImages.length"
                                            v-for="image of variant.newImages"
                                            :src="(image.url as string)"
                                            :alt="`${variant.name} Image`"
                                          />
                                          <img
                                            v-else
                                            v-for="image of variant.images"
                                            :src="(image.url as string)"
                                            :alt="`${variant.name} Image`"
                                          />
                                        </template>
                                        <img v-else :src="no_image" :alt="`${variant.name} image`">
                                      </ProductImage>
                                      <input
                                        type="file"
                                        accept=".jpg, .jpeg, .png, .webp"
                                        @change="handleAddVariantImage($event, index)"
                                      />
                                    </label>
                                    <div
                                      v-if="variant.images.length || variant.newImages.length"
                                      class="product-form-image__actions"
                                      >
                                      <Button
                                        full
                                        variant="outline"
                                        color="red"
                                        @click="handleRemoveVariantImage($event, index)"
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                </Column>
                                <Column>
                                  <div class="product-form-fields">
                                    <Textfield
                                      label="Name"
                                      :id="`variant-name-${index + 1}`"
                                      :labelProps="{ for: `variant-name-${index + 1}` }"
                                      :error="formError.variants[index].name ? true : false"
                                      :message="formError.variants[index].name"
                                      v-model="variant.name"
                                    />
                                    <Textfield
                                      label="Price"
                                      :id="`variant-price-${index + 1}`"
                                      :labelProps="{ for: `variant-price-${index + 1}` }"
                                      :error="formError.variants[index].price ? true : false"
                                      :message="formError.variants[index].price"
                                      v-model="variant.price"
                                    />
                                    <QuantityEditor
                                      label="Stock"
                                      :id="`variant-stock-${index + 1}`"
                                      :labelProps="{ for: `variant-stock-${index + 1}` }"
                                      :error="formError.variants[index].stock ? true : false"
                                      :message="formError.variants[index].stock"
                                      v-model.number="variant.stock"
                                    />
                                    <Textfield
                                      label="SKU"
                                      :id="`variant-sku-${index + 1}`"
                                      :labelProps="{ for: `variant-sku-${index + 1}` }"
                                      :error="formError.variants[index].sku ? true : false"
                                      :message="formError.variants[index].sku"
                                      v-model.number="variant.sku"
                                    />
                                  </div>
                                </Column>
                              </Row>
                            </div>
                          </div>
                        </div>
                        <br />
                        <Button variant="outline" full @click="handleAddVariant">Add Variant</Button>
                      </template>
                    </CardBody>
                  </Card>
                </Column>
              </Row>
            </Column>
          </Row>
        </form>
      </template>
    </Container>
  </Content>
</template>

<style lang="scss" src="@assets/page-form.scss" />
