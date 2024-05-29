<script setup lang=ts>
// Common Components
import { Bar } from '@components/Loader';
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

// View Components
import ButtonBlock from '@/views/components/ButtonBlock.vue';
import ListFooter from '@/views/components/ListFooter.vue';
import Pagination from '@/views/components/Pagination.vue';
import ProductImage from '@/views/components/ProductImage.vue';

import SalesProduct from './components/SalesProduct.vue';

// Hooks
import { useSalesForm } from './hooks/SalesForm.hook';

// Constants
import GLOBAL from '@/views/constants';

const {
  sales_id,
  product_list,
  page,
  form_data,
  form_error,
  load_products,
  search_query,
  selected_products,
  show_products_dialog,
  isProductSelected,
  isVariantSelected,
  productListError,
  productListLoading,
  productListRefetch,
  salesDetailError,
  salesDetailLoading,
  salesDetailRefetch,
  mutateAdd,
  mutateAddLoading,
  handleDialogClose,
  handleDialogOpen,
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
    <EmptyState
      v-if="salesDetailError"
      :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
      :title="GLOBAL.ERROR_EMPTY_TITLE"
      :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
      margin="56px 0"
    >
      <template #action>
        <Button @click="salesDetailRefetch">Try Again</Button>
      </template>
    </EmptyState>
    <template v-else>
      <Bar v-if="salesDetailLoading" margin="56px 0" />
      <template v-else>
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
                <div class="sales-products-list">
                  <template :key="product.id" v-for="(product, index) in form_data.products">
                    <SalesProduct
                      :image="product.image"
                      :name="product.name"
                      @clickRemove="handleRemoveProduct(index)"
                    />
                  </template>
                </div>
                <Button full @click="show_products_dialog = true">Add Product</Button>
              </template>
            </CardBody>
          </Card>
        </form>
      </template>
    </template>
  </Container>
  <!--  -->
  <Dialog
    class="temp-dialog"
    v-model="show_products_dialog"
    fullscreen
    hideHeader
    @enter="load_products = true"
    @leave="load_products = false"
  >
    <Toolbar sticky>
      <ToolbarAction icon @click="handleDialogClose">
        <IconX size="40" />
      </ToolbarAction>
      <input class="temp-search" placeholder="Search Product" @input="handleSearch" />
      <ToolbarAction @click="handleDialogClose($event, true)">
        Done
      </ToolbarAction>
      <!-- <template #extension>
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
      </template> -->
    </Toolbar>
    <Bar v-if="productListLoading" margin="56px 0" />
    <template v-else>
      <EmptyState
        v-if="!product_list?.products.length && search_query === ''"
        emoji="🍃"
        :title="''"
        :description="''"
        margin="56px 0"
      />
      <EmptyState
        v-else-if="!product_list?.products.length && search_query !== ''"
        emoji="😵‍💫"
        :title="''"
        :description="''"
        margin="56px 0"
      />
      <div v-else class="sales-products-selection">
        <template :key="product.id" v-for="product of product_list?.products">
          <SalesProduct
            small
            role="button"
            :aria-label="`Add ${product.name}`"
            :image="product.image"
            :name="product.name"
            :selected="isProductSelected(product) ? true : undefined"
            @click="handleSelectProduct(product)"
          />
          <SalesProduct
            :key="variant.id"
            v-for="variant of product.variant"
            small
            variant
            role="button"
            :aria-label="`Add ${product.name} - ${variant.name}`"
            :image="variant.image"
            :name="variant.name"
            :selected="isVariantSelected(variant.id) ? true : undefined"
            @click="handleSelectVariant(product.name, variant)"
          />
        </template>
      </div>
    </template>
    <ListFooter sticky height="86px">
      <Pagination
        v-if="!productListLoading && product_list?.products.length"
        frame
        :page="page.current"
        :total_page="page.total"
        :first_page="page.current <= 1"
        :last_page="page.current >= page.total"
        @clickFirst="toPrevPage($event, true)"
        @clickPrev="toPrevPage"
        @clickNext="toNextPage"
        @clickLast="toNextPage($event, true)"
      />
    </ListFooter>
  </Dialog>
</template>

<style lang="scss" src="@assets/_page-form.scss" />
<style lang="scss" scoped>
.sales-products-list {
  margin-bottom: 16px;

  .sales-product {
    &:first-of-type {
      border-top-right-radius: 8px;
      border-top-left-radius: 8px;
    }

    &:last-of-type {
      border-bottom-right-radius: 8px;
      border-bottom-left-radius: 8px;
    }
  }
}

.sales-products-selection {
  .sales-product {
    border-right-color: transparent;
    border-left-color: transparent;
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
