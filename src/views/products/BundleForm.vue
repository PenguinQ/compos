<script setup lang="ts">
import { reactive, ref, onMounted, StyleValue } from 'vue';
import { useRouter } from 'vue-router';

// Common Components
import Button from '@components/Button';
import Card, { CardHeader, CardTitle, CardBody, CardSubtitle } from '@components/Card';
import Dialog from '@components/Dialog';
import EmptyState from '@components/EmptyState';
import Text from '@components/Text';
import Checkbox from '@components/Checkbox';
import Textfield from '@components/Textfield';
import Textarea from '@components/Textarea';
import QuantityEditor from '@components/QuantityEditor';
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import { Container, Row, Column } from '@components/Layout';
import { Bar } from '@components/Loader';
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
} from '@icons';

// View Components
import ButtonBlock from '@/views/components/ButtonBlock.vue';
import ListFooter from '@/views/components/ListFooter.vue';
import Pagination from '@/views/components/Pagination.vue';
import ProductImage from '@/views/components/ProductImage.vue';
import ProductSelection from '@/views/components/ProductSelection.vue';

// Hooks
import { useBundleForm } from './hooks/BundleForm.hook';

// Constants
import GLOBAL from '@/views/constants';
import { BUNDLE_FORM } from './constants';

// Assets
import no_image from '@assets/illustration/no_image.svg';

const router = useRouter();
const {
  bundle_id,
  form_data,
  form_error,
  product_list,
  page,
  search_query,
  // selected_products,
  load_products,
  show_products_dialog,
  productListError,
  productListLoading,
  productListRefetch,
  bundleDetailError,
  bundleDetailLoading,
  bundleDetailRefetch,
  // mutateAdd,
  // mutateAddLoading,
  // mutateEdit,
  // mutateEditLoading,
  handleOpenDialog,
  handleCloseDialog,
  handleSearch,
  handleChangeQuantity,
  handleUpdateQuantity,
  toPrevPage,
  toNextPage,
  isProductSelected,
  isVariantSelected,
  handleSelectProduct,
  handleSelectVariant,
  handleRemoveProduct,
} = useBundleForm();
</script>

<template>
  <Toolbar sticky>
    <ToolbarAction icon @click="router.back">
      <IconArrowLeftShort size="40" />
    </ToolbarAction>
    <ToolbarTitle>{{ bundle_id ? 'Edit Bundle' : 'Add Bundle' }}</ToolbarTitle>
    <ToolbarSpacer />
    <!-- <ToolbarAction @click="() => {}">{{ mutateAddLoading || mutateEditLoading ? 'Loading' : 'Save' }}</ToolbarAction> -->
  </Toolbar>
  <!--  -->
  <Container class="page-container">
    <EmptyState
      v-if="bundleDetailError"
      :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
      :title="GLOBAL.ERROR_EMPTY_TITLE"
      :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
      margin="56px 0"
    >
      <template #action>
        <Button @click="bundleDetailRefetch">Try Again</Button>
      </template>
    </EmptyState>
    <template v-else>
      <Bar v-if="bundleDetailLoading" margin="56px 0" />
      <template v-else>
        <form id="bundle-form">
          <Card class="section-card" variant="outline" margin="0 0 16px">
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardSubtitle>General information about the bundle.</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div class="product-form-fields">
                <Textfield
                  id="bundle-name"
                  label="Name"
                  :labelProps="{ for: 'bundle-name' }"
                  :error="form_error.name ? true : false"
                  :message="form_error.name"
                  v-model="form_data.name"
                />
                <Textarea
                  id="bundle-description"
                  label="Description"
                  :labelProps="{ for: 'bundle-description' }"
                  v-model="form_data.description"
                />
                <Textfield
                  id="bundle-price"
                  label="Price"
                  v-model.number="form_data.price"
                  :readonly="form_data.auto_price"
                  :labelProps="{ for: 'bundle-price' }"
                  :error="form_error.price ? true : false"
                  :message="form_error.price ? form_error.price : form_data.auto_price ? BUNDLE_FORM.PRICE_MESSAGE : ''"
                />
                <Checkbox
                  v-model="form_data.auto_price"
                  label="Auto Price"
                  :message="BUNDLE_FORM.AUTO_PRICE_MESSAGE"
                />
              </div>
            </CardBody>
          </Card>
          <Card class="section-card" variant="outline">
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardSubtitle>List of products included in the bundle.</CardSubtitle>
            </CardHeader>
            <CardBody>
              <EmptyState
                v-if="!form_data.products.length"
                emoji="📦"
                :title="BUNDLE_FORM.PRODUCT_EMPTY_TITLE"
                :description="BUNDLE_FORM.PRODUCT_EMPTY_DESCRIPTION"
                margin="56px 0"
              >
                <template #action>
                  <Button @click="show_products_dialog = true">Add Product</Button>
                </template>
              </EmptyState>
              <template v-else>
                <div class="selected-products">
                  <ProductSelection
                    :key="product.id"
                    v-for="(product, index) in form_data.products"
                    :image="product.image"
                    :name="product.name"
                    :price="product.total_price"
                    :quantity="product.quantity"
                    display
                    @clickRemove="handleRemoveProduct(index)"
                    @changeQuantity="handleChangeQuantity($event, product)"
                    @inputQuantity="handleUpdateQuantity($event, product)"
                    @clickQuantityDecrement="handleUpdateQuantity($event, product)"
                    @clickQuantityIncrement="handleUpdateQuantity($event, product)"
                  />
                </div>
                <Button full @click="show_products_dialog = true">Add Product</Button>
              </template>
            </CardBody>
          </Card>
          <Card class="section-card" variant="outline" margin="16px 0 0">
            <CardHeader>
              <CardTitle>Form Data</CardTitle>
            </CardHeader>
            <CardBody>
              <pre>
                {{ form_data }}
              </pre>
            </CardBody>
          </Card>
        </form>
      </template>
      <!--  -->
      <Dialog
        class="product-selection"
        v-model="show_products_dialog"
        fullscreen
        hideHeader
        @enter="handleOpenDialog"
        @leave="load_products = false"
      >
        <Toolbar sticky>
          <ToolbarAction icon @click="handleCloseDialog">
            <IconX size="40" />
          </ToolbarAction>
          <input class="product-selection-search" placeholder="Search Product" @input="handleSearch" />
          <ToolbarAction @click="handleCloseDialog($event, true)">
            Done
          </ToolbarAction>
        </Toolbar>
        <Bar v-if="productListLoading" margin="56px 0" />
        <template v-else>
          <EmptyState
            v-if="!product_list?.products.length && search_query === ''"
            emoji="🍃"
            :title="BUNDLE_FORM.PRODUCT_LIST_EMPTY_TITLE"
            :description="BUNDLE_FORM.PRODUCT_LIST_EMPTY_DESCRIPTION"
            margin="56px 0"
          />
          <EmptyState
            v-else-if="!product_list?.products.length && search_query !== ''"
            emoji="😵‍💫"
            :title="BUNDLE_FORM.PRODUCT_SEARCH_EMPTY_TITLE"
            :description="BUNDLE_FORM.PRODUCT_SEARCH_EMPTY_DESCRIPTION"
            margin="56px 0"
          />
          <template v-else>
            <div class="product-list">
              <template :key="product.id" v-for="product of product_list?.products">
                <ProductSelection
                  small
                  :aria-label="`Add ${product.name}`"
                  :image="product.image"
                  :name="product.name"
                  :selected="isProductSelected(product) ? true : undefined"
                  @click="handleSelectProduct(product)"
                />
                <ProductSelection
                  :key="variant.id"
                  v-for="variant of product.variants"
                  small
                  variant
                  :aria-label="`Add ${product.name} - ${variant.name}`"
                  :image="variant.image"
                  :name="variant.name"
                  :selected="isVariantSelected(variant.id) ? true : undefined"
                  @click="handleSelectVariant(variant, product.name)"
                />
              </template>
            </div>
          </template>
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
  </Container>
</template>

<style lang="scss" src="@assets/_page-form.scss" />
<style lang="scss" scoped>
.selected-products {
  margin-bottom: 16px;
}
</style>
