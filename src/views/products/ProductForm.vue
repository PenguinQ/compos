<script setup lang="ts">
import { useRouter } from 'vue-router';

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
import { Bar, Shimmer } from '@components/Loader';
import { IconArrowLeftShort, IconXLarge } from '@icons';

import { useProductForm } from './hooks/ProductForm.hook';
import { PRODUCT_DETAIL } from './constants';

import no_image from '@assets/illustration/no_image.svg';
import Error from '@assets/illustration/error.svg';

const router = useRouter();
const {
  productID,
  form_data,
  form_error,
  isError,
  isLoading,
  refetch,
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
    <ToolbarTitle>{{ productID ? 'Edit Product' : 'Add Product' }}</ToolbarTitle>
    <ToolbarSpacer />
    <ToolbarAction @click="handleSubmit">{{ mutateAddLoading || mutateEditLoading ? 'Loading' : 'Save' }}</ToolbarAction>
  </Toolbar>
  <EmptyState
    v-if="isError"
    :image="Error"
    :title="PRODUCT_DETAIL.ERROR_TITLE"
    :description="PRODUCT_DETAIL.ERROR_DESCRIPTION"
  >
    <template #action>
      <Button @click="refetch">Try Again</Button>
    </template>
  </EmptyState>
  <template v-else>
    <Container class="pf-container">
      <Bar v-if="isLoading" margin="80px 0" />
      <form v-else id="product-form">
        <Row>
          <Column :col="{ default: 12, md: 'auto' }">
            <div class="pf-image" :data-error="true">
              <label>
                <picture v-if="form_data.image.length || form_data.new_image.length">
                  <img
                    v-if="!form_data.new_image.length"
                    v-for="(image, index) of form_data.image"
                    :key="`${form_data.name}-img-${index}`"
                    :alt="`${form_data.name} Image - ${index + 1}`"
                    :src="(image.path as string)"
                  />
                  <img
                    v-for="(image, index) of form_data.new_image"
                    :key="`new-${form_data.name}-img-${index}`"
                    :alt="`New ${form_data.name} Image - ${index + 1}`"
                    :src="(image.path as string)"
                  />
                </picture>
                <picture v-else>
                  <img :src="no_image" alt="" />
                </picture>
                <input type="file" accept=".jpg, .jpeg, .png, .webp" @change="handleAddImage" />
              </label>
              <div v-if="form_data.image.length || form_data.new_image.length" class="pf-image__actions">
                <Button @click="handleRemoveImage" variant="outline" color="red" full>Remove</Button>
              </div>
            </div>
          </Column>
          <Column>
            <Row>
              <Column col="12">
                <Card class="pf-card" variant="outline">
                  <CardHeader>
                    <CardTitle>General</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div class="pf-fields">
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
                        v-if="form_data.variant.length"
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
                      </template>
                    </div>
                  </CardBody>
                </Card>
              </Column>
              <Column col="12">
                <Card class="pf-card" variant="outline">
                  <CardHeader>
                    <CardTitle>Variants</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <EmptyState
                      v-if="!form_data.variant.length"
                      title="Hmm..."
                      description="This product doesn't have any variants."
                      margin="16px 0"
                    >
                      <template #action>
                        <Button @click="handleAddVariant">Add Variant</Button>
                      </template>
                    </EmptyState>
                    <template v-else>
                      <div class="pf-variants">
                        <div class="pf-variant" v-for="(variant, index) of form_data.variant" :key="`variant-${index}`">
                          <div class="pf-variant__header">
                            <div class="pf-variant__title">
                              Variant {{ index + 1 }}
                            </div>
                            <button
                              type="button"
                              class="pf-variant__remove"
                              @click="handleRemoveVariant(index, variant.id)"
                              >
                              <IconXLarge size="24" />
                            </button>
                          </div>
                          <div class="pf-variant__body">
                            <Row>
                              <Column :col="{ default: 12, md: 'auto' }">
                                <div class="pf-image pf-image--variant">
                                  <label>
                                    <picture v-if="variant.image.length || variant.new_image.length">
                                      <img
                                        v-if="!variant.new_image.length"
                                        v-for="(image, index) of variant.image"
                                        :key="`${form_data.name}-img-${index}`"
                                        :alt="`${form_data.name} Image - ${index + 1}`"
                                        :src="(image.path as string)"
                                      />
                                      <img
                                        v-for="(image, index) of variant.new_image"
                                        :key="`new-${form_data.name}-img-${index}`"
                                        :alt="`New ${form_data.name} Image - ${index + 1}`"
                                        :src="(image.path as string)"
                                      />
                                    </picture>
                                    <picture v-else>
                                      <img :src="no_image" alt="" />
                                    </picture>
                                    <input
                                      type="file"
                                      accept=".jpg, .jpeg, .png, .webp"
                                      @change="handleAddVariantImage($event, index)"
                                    />
                                  </label>
                                  <div
                                    v-if="variant.image.length || variant.new_image.length"
                                    class="pf-image__actions"
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
                                <div class="pf-fields">
                                  <Textfield
                                    label="Name"
                                    :id="`variant-name-${index + 1}`"
                                    :labelProps="{ for: `variant-name-${index + 1}` }"
                                    :error="form_error.variant[index].name ? true : false"
                                    :message="form_error.variant[index].name"
                                    v-model="variant.name"
                                  />
                                  <Textfield
                                    label="Price"
                                    :id="`variant-price-${index + 1}`"
                                    :labelProps="{ for: `variant-price-${index + 1}` }"
                                    :error="form_error.variant[index].price ? true : false"
                                    :message="form_error.variant[index].price"
                                    v-model.number="variant.price"
                                  />
                                  <QuantityEditor
                                    label="Stock"
                                    :id="`variant-stock-${index + 1}`"
                                    :labelProps="{ for: `variant-stock-${index + 1}` }"
                                    :error="form_error.variant[index].stock ? true : false"
                                    :message="form_error.variant[index].stock"
                                    v-model.number="variant.stock"
                                  />
                                  <Row>
                                    <Column>
                                    </Column>
                                    <Column col="auto">
                                    </Column>
                                  </Row>
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
    </Container>
  </template>
</template>

<style lang="scss" src="@assets/_page-form.scss" />
<style lang="scss" scoped>
.pf {
  &-loading {
    &-image {
      width: 180px;
      height: 180px;
      margin: 0 auto;
    }
  }

  &-image {
    max-width: 180px;
    width: 180px;
    margin: 0 auto;

    label {
      max-height: 180px;
      height: 180px;
      background-color: var(--color-white);
      border: 1px solid var(--color-neutral-2);
      border-radius: 8px;
      display: block;
    }

    picture {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      overflow: hidden;
      cursor: pointer;
    }

    img {
      min-height: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;

      &:only-child {
        grid-column: span 2;
      }
    }

    input[type="file"] {
      display: none;
    }

    &__actions {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: 8px;
    }

    &--variant {
      max-width: 120px;
      width: 120px;

      label {
        max-height: 120px;
        height: 120px;
      }
    }
  }

  &-fields {
    .cp-form {
      margin-bottom: 20px;

      &:last-of-type {
        margin-bottom: 0;
      }
    }
  }

  &-variant {
    position: relative;
    margin-bottom: 16px;

    &:last-of-type {
      margin-bottom: 0;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background-color: var(--color-black);
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      overflow: hidden;
    }

    &__title {
      color: var(--color-white);
      font-size: 16px;
      line-height: 28px;
      font-weight: 600;
      padding: 0 16px;
    }

    &__remove {
      background-color: var(--color-red-4);
      border: none;
      cursor: pointer;
      transition: box-shadow var(--transition-duration-normal) var(--transition-timing-function);
      padding: 16px;
      margin: 0;

      .cp-icon {
        fill: var(--color-white);
        transition: transform var(--transition-duration-normal) var(--transition-timing-function);
      }

      &:active {
        box-shadow: inset 0 0 56px rgba(37, 52, 70, 0.28);

        .cp-icon {
          transform: scale(0.86);
        }
      }
    }

    &__body {
      border-width: 0 1px 1px 1px;
      border-style: solid;
      border-color: var(--color-black);
      border-bottom-right-radius: 4px;
      border-bottom-left-radius: 4px;
      padding: 16px;
    }
  }
}

@include screen-md {
  .pf {
    &-loading {
      &-image {
        width: 240px;
        height: 240px;
      }
    }

    &-image {
      max-width: 240px;
      width: 240px;

      label {
        max-height: 240px;
        height: 240px;
      }

      &--variant {
        max-width: 120px;
        width: 120px;

        label {
          max-height: 120px;
          height: 120px;
        }
      }
    }
  }
}
</style>
