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
  Text,
  Textarea,
  Textfield,
  Ticker,
  Toolbar,
  ToolbarAction,
  ToolbarSpacer,
  ToolbarTitle,
} from '@/components';
import ComposIcon, { ArrowLeftShort, Save } from '@/components/Icons';

// View Components
import { ButtonRemove, ProductImage } from '@/views/components';

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
              <div class="product-image" :data-error="true">
                <label>
                  <ProductImage>
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
                <Button
                  v-if="formData.images.length || formData.newImages.length" class="product-image__action"
                  @click="handleRemoveImage"
                  variant="outline"
                  color="red"
                  full
                >
                  Remove
                </Button>
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
                      <Row :col="1" :gutter="16">
                        <Column>
                          <Textfield
                            id="product-name"
                            label="Name"
                            :labelProps="{ for: 'product-name' }"
                            :error="formError.name ? true : false"
                            :message="formError.name"
                            v-model="formData.name"
                          />
                        </Column>
                        <Column>
                          <Textarea
                            id="product-description"
                            label="Description"
                            :labelProps="{ for: 'product-description' }"
                            v-model="formData.description"
                          />
                        </Column>
                        <Column>
                          <Textfield
                            id="product-by"
                            label="By"
                            :labelProps="{ for: 'product-by' }"
                            v-model="formData.by"
                          />
                        </Column>
                        <Column v-if="formData.variants.length">
                          <Ticker
                            :items="[
                              {
                                title: 'Default Price and Stock Disabled',
                                description: `Since this product has variants that has their own price and stock, the default price and stock of this product will not be used.`,
                                type: 'info',
                              },
                            ]"
                          />
                        </Column>
                        <template v-else>
                          <Column>
                            <Textfield
                              id="product-price"
                              label="Price"
                              prepend="Rp"
                              v-model="formData.price"
                              :labelProps="{ for: 'product-price' }"
                              :error="formError.price ? true : false"
                              :message="formError.price"
                            />
                          </Column>
                          <Column>
                            <QuantityEditor
                              id="product-stock"
                              label="Stock"
                              v-model.number="formData.stock"
                              :labelProps="{ for: 'product-stock' }"
                              :error="formError.stock ? true : false"
                              :message="formError.stock"
                            />
                          </Column>
                          <Column>
                            <Textfield
                              id="product-sku"
                              label="SKU"
                              v-model="formData.sku"
                              :labelProps="{ for: 'product-sku' }"
                            />
                          </Column>
                        </template>
                      </Row>
                    </CardBody>
                  </Card>
                </Column>
                <Column col="12">
                  <Card class="section-card" variant="outline">
                    <CardHeader>
                      <CardTitle>Variants</CardTitle>
                      <CardSubtitle>Variants available for this product.</CardSubtitle>
                    </CardHeader>
                    <CardBody padding="0">
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
                        <div class="variant-list">
                          <div class="variant-list-item" v-for="(variant, index) of formData.variants" :key="`variant-${index}`">
                            <div class="variant-list-item__header">
                              <Text
                                body="large"
                                fontWeight="600"
                                padding="16px 0"
                                margin="0"
                              >
                                Variant {{ index + 1 }}
                              </Text>
                              <ButtonRemove :size="32" @click="handleRemoveVariant(index, variant.id)" />
                            </div>
                            <div class="variant-list-item__body">
                              <Row>
                                <Column :col="{ default: 12, md: 'auto' }">
                                  <div class="product-image product-image--variant">
                                    <label>
                                      <ProductImage>
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
                                    <Button
                                      v-if="variant.images.length || variant.newImages.length"
                                      class="product-image__action"
                                      variant="outline"
                                      color="red"
                                      full
                                      @click="handleRemoveVariantImage($event, index)"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </Column>
                                <Column>
                                  <Row :col="{ default: 1, lg: 2 }" :gutter="16">
                                    <Column>
                                      <Textfield
                                        label="Name"
                                        :id="`variant-name-${index + 1}`"
                                        :labelProps="{ for: `variant-name-${index + 1}` }"
                                        :error="formError.variants[index].name ? true : false"
                                        :message="formError.variants[index].name"
                                        v-model="variant.name"
                                        size="small"
                                      />
                                    </Column>
                                    <Column>
                                      <Textfield
                                        label="Price"
                                        prepend="Rp"
                                        :id="`variant-price-${index + 1}`"
                                        :labelProps="{ for: `variant-price-${index + 1}` }"
                                        :error="formError.variants[index].price ? true : false"
                                        :message="formError.variants[index].price"
                                        v-model="variant.price"
                                        size="small"
                                      />
                                    </Column>
                                    <Column>
                                      <Textfield
                                        label="SKU"
                                        :id="`variant-sku-${index + 1}`"
                                        :labelProps="{ for: `variant-sku-${index + 1}` }"
                                        :error="formError.variants[index].sku ? true : false"
                                        :message="formError.variants[index].sku"
                                        v-model.number="variant.sku"
                                        size="small"
                                      />
                                    </Column>
                                    <Column>
                                      <QuantityEditor
                                        label="Stock"
                                        :id="`variant-stock-${index + 1}`"
                                        :labelProps="{ for: `variant-stock-${index + 1}` }"
                                        :error="formError.variants[index].stock ? true : false"
                                        :message="formError.variants[index].stock"
                                        v-model.number="variant.stock"
                                        size="small"
                                      />
                                    </Column>
                                  </Row>
                                </Column>
                              </Row>
                            </div>
                          </div>
                        </div>
                        <div class="variant-list-action">
                          <Button variant="outline" full @click="handleAddVariant">Add Variant</Button>
                        </div>
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

<style lang="scss" src="@/assets/page-form.scss" />
<style lang="scss" scoped>
.product-image {
  width: 180px;
  margin: 0 auto;

  label {
    height: 180px;
    cursor: pointer;
    display: block;
  }

  .vc-product-image {
    width: 100%;
    height: 100%;
  }

  input[type="file"] {
    display: none;
  }

  &__action {
    margin-top: 12px;
  }

  &--variant {
    width: 120px;

    label {
      height: 120px;
    }
  }
}

.variant-list {
  background-color: var(--color-neutral-1);
  padding: 16px 0;

  &-item {
    background-color: var(--color-white);
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 16px;

    &:last-of-type {
      margin-bottom: 0;
    }

    &__header {
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 0 16px;
    }

    &__title {
      @include text-body-lg;
      font-weight: 600;
      padding: 16px;
    }

    &__body {
      padding: 16px;
    }
  }

  &-action {
    background: var(--color-white);
    border-top: 1px solid var(--color-border);
    padding: 16px;
  }
}

@include screen-md {
  .product-image {
    width: 240px;

    label {
      height: 240px;
    }

    &--variant {
      width: 120px;

      label {
        height: 120px;
      }
    }
  }
}
</style>