<script setup lang=ts>
import Button from '@components/Button';
import Text from '@components/Text';
import Card, { CardHeader, CardTitle, CardBody, CardSubtitle } from '@components/Card';
import Dialog from '@components/Dialog';
import EmptyState from '@components/EmptyState';
import Textfield from '@components/Textfield';
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import { Container, Row, Column } from '@components/Layout';
import {
  IconArrowLeftShort,
  IconX,
  IconChevronDoubleLeft,
  IconChevronDoubleRight,
  IconChevronLeft,
  IconChevronRight,
  IconCheckLarge,
  IconSaveFilled,
  IconSave,
} from '@components/icons';

import ProductImage from '@/views/components/ProductImage.vue';
import ButtonBlock from '@/views/components/ButtonBlock.vue';

import { useSalesForm } from './hooks/SalesForm.hook';

// Assets
import no_image from '@assets/illustration/no_image.svg';

const {
  sales_id,
  product_list,
  page,
  form_data,
  form_error,
  load_products,
  selected_products,
  show_products_dialog,
  isProductSelected,
  isVariantSelected,
  productListError,
  productListLoading,
  productListRefetch,
  mutateAdd,
  mutateAddLoading,
  handleDialogClose,
  handleRemoveProduct,
  handleSearch,
  handleSelectProduct,
  handleSelectVariant,
  handleSubmit,
  toNextPage,
  toPrevPage,
} = useSalesForm();
</script>

<template>
  <Toolbar sticky>
    <ToolbarAction icon @click="$router.back">
      <IconArrowLeftShort size="40" />
    </ToolbarAction>
    <ToolbarTitle>{{ sales_id ? 'Edit Sales' : 'Add Sales' }}</ToolbarTitle>
    <ToolbarSpacer />
    <ToolbarAction @click="handleSubmit">Save</ToolbarAction>
  </Toolbar>
  <!--  -->
  <Container class="pf-container">
    <form id="sales-add-form">
      <Card class="pf-card" variant="outline" margin="0 0 16px">
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardSubtitle>General information about the sales.</CardSubtitle>
        </CardHeader>
        <CardBody>
          <div>
            <Textfield
              id="sales-name"
              label="Name"
              :labelProps="{ for: 'sales-name' }"
              :error="form_error.name ? true : false"
              :message="form_error.name"
              v-model="form_data.name"
            />
          </div>
        </CardBody>
      </Card>
      <Card class="pf-card" variant="outline">
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardSubtitle>List of products that available for the sales.</CardSubtitle>
        </CardHeader>
        <CardBody>
          <EmptyState
            v-if="!form_data.products.length"
            title="Title"
            description="Description"
            margin="40px 0"
          >
            <template #action>
              <Button @click="show_products_dialog = true">Add Product</Button>
            </template>
          </EmptyState>
          <template v-else>
            <div class="product-lists-container">
              <div
                class="product-lists"
                :key="`product-lists-${index}`"
                v-for="(product, index) in form_data.products"
              >
                <div class="product-lists-item">
                  <ProductImage>
                    <img :src="product.image ? product.image : no_image" :alt="`${product.name} image`" />
                  </ProductImage>
                  <div class="product-lists-item__detail">
                    <Text body="large" truncate margin="0">{{ product.name }}</Text>
                  </div>
                  <ButtonBlock icon @click="handleRemoveProduct(index)">
                    <IconX size="32" />
                  </ButtonBlock>
                  <button
                    class="product-lists-item__delete button-icon"
                    type="button"
                    @click="handleRemoveProduct(index)"
                  >
                    <IconX size="32" />
                  </button>
                </div>
              </div>
            </div>
            <Button full @click="show_products_dialog = true">Add Product</Button>
          </template>
        </CardBody>
      </Card>
    </form>
  </Container>
  <!--  -->
  <Dialog
    class="temp-dialog"
    v-model="show_products_dialog"
    fullscreen
    @enter="load_products = true"
    @leave="load_products = false"
  >
    <template #header>
      <Toolbar>
        <ToolbarAction icon @click="handleDialogClose">
          <IconX size="40" />
        </ToolbarAction>
        <input class="temp-search" placeholder="Search Product" @input="handleSearch" />
        <ToolbarAction @click="handleDialogClose($event, true)">
          Done
        </ToolbarAction>
        <template #extension>
          <div class="temp-navigation">
            <ButtonBlock icon :disabled="page.current <= 1" @click="toPrevPage($event, true)">
              <IconChevronDoubleLeft />
            </ButtonBlock>
            <ButtonBlock icon :disabled="page.current <= 1" @click="toPrevPage">
              <IconChevronLeft />
            </ButtonBlock>
            <div class="temp-navigation__page">
              Page {{ page.current }} of {{ page.total }}
            </div>
            <ButtonBlock icon :disabled="page.current >= page.total" @click="toNextPage">
              <IconChevronRight />
            </ButtonBlock>
            <ButtonBlock icon :disabled="page.current >= page.total" @click="toNextPage($event, true)">
              <IconChevronDoubleRight />
            </ButtonBlock>
          </div>
        </template>
      </Toolbar>
    </template>
    <div v-if="productListLoading">Loading...</div>
    <template v-else>
      <div class="product-lists-container product-lists-container--selection">
        <div
          :key="`product-${product_index}`"
          v-for="(product, product_index) of product_list?.products"
          class="product-lists"
        >
          <div
            class="product-lists-item product-lists-item--selection"
            role="button"
            :aria-label="`Add ${product.name}`"
            :data-selected="isProductSelected(product) ? true : undefined"
            @click="handleSelectProduct(product)"
          >
            <ProductImage class="product-lists-item__image">
              <img :src="product.image ? product.image : no_image" :alt="`${product.name} image`" />
            </ProductImage>
            <div class="product-lists-item__detail">
              <Text body="large" truncate margin="0">{{ product.name }}</Text>
            </div>
            <IconCheckLarge
              class="product-lists-item__selected"
              v-if="isProductSelected(product)"
            />
          </div>
          <div
            :key="`variant-${product_index}-${variant_index}`"
            v-for="(variant, variant_index) of product.variant"
            class="product-lists-item product-lists-item--variant"
            role="button"
            :aria-label="`Add ${product.name} - ${variant.name}`"
            :data-selected="isVariantSelected(variant.id) ? true : undefined"
            @click="handleSelectVariant(product.name, variant)"
          >
            <ProductImage class="product-lists-item__image">
              <img :src="variant.image ? variant.image : no_image" :alt="`${variant.name} image`" />
            </ProductImage>
            <div class="product-lists-item__detail">
              <Text body="large" truncate margin="0">{{ variant.name }}</Text>
            </div>
            <IconCheckLarge
              class="product-lists-item__selected"
              v-if="isVariantSelected(variant.id)"
            />
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss" src="@assets/_page-form.scss" />
<style lang="scss" scoped>
.product-lists-container {
  border: 1px solid var(--color-neutral-2);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;

  &--selection {
    border-right: none;
    border-left: none;
    border-radius: 0;
    margin-bottom: 0;
  }
}

.product-lists {
  margin-top: -1px;

  &-item {
    background-color: var(--color-white);
    border-top: 1px solid var(--color-neutral-2);
    border-bottom: 1px solid var(--color-neutral-2);
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    margin-top: -1px;

    &:first-of-type {
      margin-top: 0;
    }

    &--variant {
      padding-left: 48px;
      background-color: var(--color-neutral-1);
    }

    &[data-selected] {
      background-color: var(--color-blue-1);
    }

    picture {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
    }

    &__detail {
      min-width: 0;
      flex-grow: 1;
    }

    &__delete {
      flex-shrink: 0;
      padding: 8px;
    }

    &__selected {
      flex-shrink: 0;
    }
  }

  &:first-of-type {
    margin-top: 0;

    .product-lists-item:first-of-type {
      border-top-color: transparent;
    }
  }

  &:last-of-type {
    .product-lists-item:last-of-type {
      border-bottom-color: transparent;
    }
  }

  &--selection {
    .product-lists-item {
      cursor: pointer;

      picture {
        width: 60px;
        height: 60px;
      }
    }
  }
}

.temp-dialog {
  .cp-dialog-body {
    padding: 0;
  }
}

.temp-search {
  min-width: 100px;
  font-size: var(--text-body-medium-size);
  line-height: var(--text-body-medium-height);
  flex-grow: 1;
  height: 40px;
  border: none;
  padding: 0;
  margin: 0;
  border-radius: 4px;
  outline: none;
  padding: 0 16px;
  margin: 0 16px;
}

.temp-navigation {
  background-color: var(--color-white);
  box-shadow: rgba(0, 0, 0, 0.16) 0 3px 6px, rgba(0, 0, 0, 0.23) 0 3px 6px;
  display: flex;

  &__page {
    white-space: nowrap;
    text-align: center;
    border: 1px solid var(--color-black);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
    padding: 0 8px;
  }
}

@include screen-md {

}
</style>
