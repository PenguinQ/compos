<script setup lang="ts">
import { useRouter } from 'vue-router';

// Common Components
import Button from '@components/Button';
import Text from '@components/Text';
import Card, { CardHeader, CardTitle, CardBody } from '@components/Card';
import EmptyState from '@components/EmptyState';
import Textfield from '@components/Textfield';
import Textarea from '@components/Textarea';
import QuantityEditor from '@components/QuantityEditor';
import Ticker from '@components/Ticker';
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import { Container, Row, Column } from '@components/Layout';
import { Bar } from '@components/Loader';
import { IconArrowLeftShort, IconXLarge } from '@icons';

// View Components
import ProductImage from '@/views/components/ProductImage.vue';

// Hooks
import { useProductForm } from './hooks/ProductForm.hook';

// Constants
import GLOBAL from '@/views/constants';
import { PRODUCT_DETAIL } from './constants';

// Assets
import no_image from '@assets/illustration/no_image.svg';

const router = useRouter();
const {
  product_id,
  form_data,
  form_error,
  productDetailError,
  productDetailLoading,
  productDetailRefetch,
  handleAddImage,
  handleAddVariant,
  handleAddVariantImage,
  handleRemoveVariant,
  handleRemoveVariantImage,
  handleRemoveImage,
  handleSubmit,
  mutateAddLoading,
  mutateEditLoading,
} = useProductForm();
</script>

<template>
  <Toolbar sticky>
    <ToolbarAction icon @click="router.back">
      <IconArrowLeftShort size="40" />
    </ToolbarAction>
    <ToolbarTitle>{{ product_id ? 'Edit Product' : 'Add Product' }}</ToolbarTitle>
    <ToolbarSpacer />
    <ToolbarAction @click="handleSubmit">{{ mutateAddLoading || mutateEditLoading ? 'Loading' : 'Save' }}</ToolbarAction>
  </Toolbar>
  <!--  -->
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
      <form v-else id="product-form">
        <Row>
          <Column :col="{ default: 12, md: 'auto' }">
            <div class="product-form-image" :data-error="true">
              <label>
                <ProductImage borderless>
                  <template v-if="form_data.image.length || form_data.new_image.length">
                    <img
                      v-if="form_data.new_image.length"
                      :src="(form_data.new_image[0].url as string)"
                      :alt="`${form_data.name} Image`"
                    />
                    <img
                      v-else
                      :src="(form_data.image[0].url as string)"
                      :alt="`${form_data.name} Image`"
                    />
                  </template>
                  <template v-else>
                    <img :src="no_image" alt="" />
                  </template>
                </ProductImage>
                <input type="file" accept=".jpg, .jpeg, .png, .webp" @change="handleAddImage" />
              </label>
              <div v-if="form_data.image.length || form_data.new_image.length" class="product-form-image__actions">
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
                  </CardHeader>
                  <CardBody>
                    <div class="product-form-fields">
                      <Textfield
                        id="product-name"
                        label="Name"
                        :labelProps="{ for: 'product-name' }"
                        :error="form_error.name ? true : false"
                        :message="form_error.name"
                        v-model="form_data.name"
                      />
                      <Textarea
                        id="product-description"
                        label="Description"
                        :labelProps="{ for: 'product-description' }"
                        v-model="form_data.description"
                      />
                      <Textfield
                        id="product-by"
                        label="By"
                        :labelProps="{ for: 'product-by' }"
                        v-model="form_data.by"
                      />
                      <Ticker
                        v-if="form_data.variants.length"
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
                          :labelProps="{ for: 'product-price' }"
                          :error="form_error.price ? true : false"
                          :message="form_error.price"
                          v-model.number="form_data.price"
                        />
                        <QuantityEditor
                          id="product-stock"
                          label="Stock"
                          :labelProps="{ for: 'product-stock' }"
                          :error="form_error.stock ? true : false"
                          :message="form_error.stock"
                          v-model.number="form_data.stock"
                        />
                        <Textfield
                          id="product-sku"
                          label="SKU"
                          :labelProps="{ for: 'product-sku' }"
                          v-model="form_data.sku"
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
                  </CardHeader>
                  <CardBody>
                    <EmptyState
                      v-if="!form_data.variants.length"
                      title="Hmm..."
                      description="This product doesn't have any variants."
                      margin="16px 0"
                    >
                      <template #action>
                        <Button @click="handleAddVariant">Add Variant</Button>
                      </template>
                    </EmptyState>
                    <template v-else>
                      <div class="product-form-variants">
                        <div class="product-form-variant" v-for="(variant, index) of form_data.variants" :key="`variant-${index}`">
                          <div class="product-form-variant__header">
                            <div class="product-form-variant__title">
                              Variant {{ index + 1 }}
                            </div>
                            <button
                              type="button"
                              class="product-form-variant__remove"
                              @click="handleRemoveVariant(index, variant.id)"
                              >
                              <IconXLarge size="24" />
                            </button>
                          </div>
                          <div class="product-form-variant__body">
                            <Row>
                              <Column :col="{ default: 12, md: 'auto' }">
                                <div class="product-form-image product-form-image--variant">
                                  <label>
                                    <ProductImage borderless>
                                      <template v-if="variant.image.length || variant.new_image.length">
                                        <img
                                          v-if="variant.new_image.length"
                                          :src="(variant.new_image[0].url as string)"
                                          :alt="`${variant.name} image`"
                                        />
                                        <img
                                          v-else
                                          :src="(variant.image[0].url as string)"
                                          :alt="`${variant.name} image`"
                                        />
                                      </template>
                                      <template v-else>
                                        <img :src="no_image" alt="" />
                                      </template>
                                    </ProductImage>
                                    <input
                                      type="file"
                                      accept=".jpg, .jpeg, .png, .webp"
                                      @change="handleAddVariantImage($event, index)"
                                    />
                                  </label>
                                  <div
                                    v-if="variant.image.length || variant.new_image.length"
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
                                    :error="form_error.variants[index].name ? true : false"
                                    :message="form_error.variants[index].name"
                                    v-model="variant.name"
                                  />
                                  <Textfield
                                    label="Price"
                                    :id="`variant-price-${index + 1}`"
                                    :labelProps="{ for: `variant-price-${index + 1}` }"
                                    :error="form_error.variants[index].price ? true : false"
                                    :message="form_error.variants[index].price"
                                    v-model.number="variant.price"
                                  />
                                  <QuantityEditor
                                    label="Stock"
                                    :id="`variant-stock-${index + 1}`"
                                    :labelProps="{ for: `variant-stock-${index + 1}` }"
                                    :error="form_error.variants[index].stock ? true : false"
                                    :message="form_error.variants[index].stock"
                                    v-model.number="variant.stock"
                                  />
                                  <Textfield
                                    label="SKU"
                                    :id="`variant-sku-${index + 1}`"
                                    :labelProps="{ for: `variant-sku-${index + 1}` }"
                                    :error="form_error.variants[index].sku ? true : false"
                                    :message="form_error.variants[index].sku"
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
</template>

<style lang="scss" src="@assets/_page-form.scss" />
