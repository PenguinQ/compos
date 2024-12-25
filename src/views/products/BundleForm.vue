<script setup lang="ts">
import { watch } from 'vue';
import { useRouter } from 'vue-router';

// Common Components
import {
  Header,
  Content,
  Container,
  Bar,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardSubtitle,
  CardTitle,
  Checkbox,
  Dialog,
  EmptyState,
  PullToRefresh,
  Textarea,
  Textfield,
  Toolbar,
  ToolbarAction,
  ToolbarSpacer,
  ToolbarTitle,
} from '@/components';
import ComposIcon, { ArrowLeftShort, Save, X } from '@/components/Icons';

// View Components
import {
  FloatingActions,
  Pagination,
  ProductSelection,
} from '@/views/components';

// Hooks
import { useBundleForm } from './hooks/BundleForm.hook';

// Constants
import GLOBAL from '@/views/constants';
import { BUNDLE_FORM } from './constants';

const router = useRouter();
const {
  bundleId,
  bundleDetail,
  formData,
  formError,
  product_list,
  page,
  searchQuery,
  loadProducts,
  showProductsDialog,
  productListError,
  productListLoading,
  productListRefetch,
  bundleDetailError,
  bundleDetailLoading,
  bundleDetailRefetch,
  mutateAddLoading,
  mutateEditLoading,
  handleOpenDialog,
  handleCloseDialog,
  handleSearch,
  handleSubmit,
  handleChangeQuantity,
  handleUpdateQuantity,
  toPrevPage,
  toNextPage,
  isProductSelected,
  isVariantSelected,
  handleSelectProduct,
  handleSelectVariant,
  handleRemoveProduct,
  handleRefresh,
  handleRefreshList,
} = useBundleForm();

watch(
  bundleDetail,
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
      <ToolbarTitle>{{ bundleId ? `Edit ${bundleDetail ? bundleDetail.name : 'Bundle'}` : 'Add Bundle' }}</ToolbarTitle>
      <ToolbarSpacer />
      <template v-if="!bundleDetailError && !bundleDetailLoading">
        <ToolbarAction v-if="mutateAddLoading || mutateEditLoading" backgroundColor="var(--color-blue-4)" icon>
          <Bar size="24px" color="var(--color-white)" />
        </ToolbarAction>
        <ToolbarAction v-else backgroundColor="var(--color-blue-4)" icon @click="handleSubmit">
          <ComposIcon :icon="Save" color="var(--color-white)" />
        </ToolbarAction>
      </template>
    </Toolbar>
  </Header>
  <Content>
    <template v-if="bundleId" #fixed>
      <PullToRefresh @refresh="handleRefresh" />
    </template>
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
                    :error="formError.name ? true : false"
                    :message="formError.name"
                    v-model="formData.name"
                  />
                  <Textarea
                    id="bundle-description"
                    label="Description"
                    :labelProps="{ for: 'bundle-description' }"
                    v-model="formData.description"
                  />
                  <Textfield
                    id="bundle-price"
                    label="Price"
                    prepend="Rp"
                    v-model="formData.price"
                    :readonly="formData.auto_price"
                    :labelProps="{ for: 'bundle-price' }"
                    :error="formError.price ? true : false"
                    :message="formError.price ? formError.price : formData.auto_price ? BUNDLE_FORM.PRICE_MESSAGE : ''"
                  />
                  <Checkbox
                    v-model="formData.auto_price"
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
                  v-if="!formData.products.length"
                  emoji="📦"
                  :title="BUNDLE_FORM.PRODUCT_EMPTY_TITLE"
                  :description="BUNDLE_FORM.PRODUCT_EMPTY_DESCRIPTION"
                  margin="56px 0"
                >
                  <template #action>
                    <Button @click="showProductsDialog = true">Add Product</Button>
                  </template>
                </EmptyState>
                <template v-else>
                  <div class="selected-products">
                    <ProductSelection
                      :key="product.id"
                      v-for="(product, index) in formData.products"
                      :images="product.images"
                      :name="product.name"
                      :price="product.total_price"
                      :stock="product.stock"
                      :sku="product.sku || '-'"
                      :quantity="product.quantity"
                      :quantityMax="product.stock"
                      display
                      @clickRemove="handleRemoveProduct(index)"
                      @changeQuantity="handleChangeQuantity($event, product)"
                      @inputQuantity="handleUpdateQuantity($event, product)"
                      @clickQuantityDecrement="handleUpdateQuantity($event, product)"
                      @clickQuantityIncrement="handleUpdateQuantity($event, product)"
                    />
                  </div>
                  <Button full @click="showProductsDialog = true">Add Product</Button>
                </template>
              </CardBody>
            </Card>
          </form>
        </template>
        <Dialog
          class="product-selection"
          v-model="showProductsDialog"
          fullscreen
          hideHeader
          @enter="handleOpenDialog"
          @leave="loadProducts = false"
        >
          <Header>
            <Toolbar>
              <ToolbarAction icon @click="handleCloseDialog">
                <ComposIcon :icon="X" :size="40" />
              </ToolbarAction>
              <input class="product-selection-search" placeholder="Search Product" @input="handleSearch" />
              <ToolbarAction @click="handleCloseDialog($event, true)">
                Done
              </ToolbarAction>
            </Toolbar>
          </Header>
          <Content>
            <template #fixed>
              <PullToRefresh @refresh="handleRefreshList" />
            </template>
            <EmptyState
              v-if="productListError"
              :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
              :title="GLOBAL.ERROR_EMPTY_TITLE"
              :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
              margin="56px 0"
            >
              <template #action>
                <Button @click="productListRefetch">Try Again</Button>
              </template>
            </EmptyState>
            <template v-else>
              <Bar v-if="productListLoading" />
              <template v-else>
                <EmptyState
                  v-if="!product_list?.products.length && searchQuery === ''"
                  emoji="🍃"
                  :title="BUNDLE_FORM.PRODUCT_LIST_EMPTY_TITLE"
                  :description="BUNDLE_FORM.PRODUCT_LIST_EMPTY_DESCRIPTION"
                  height="100%"
                />
                <EmptyState
                  v-else-if="!product_list?.products.length && searchQuery !== ''"
                  emoji="😵‍💫"
                  :title="BUNDLE_FORM.PRODUCT_SEARCH_EMPTY_TITLE"
                  :description="BUNDLE_FORM.PRODUCT_SEARCH_EMPTY_DESCRIPTION"
                  height="100%"
                />
                <template v-else>
                  <div class="product-list">
                    <template :key="product.id" v-for="product of product_list?.products">
                      <ProductSelection
                        small
                        :aria-label="`Add ${product.name}`"
                        :images="product.images"
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
                        :images="variant.images"
                        :name="variant.name"
                        :selected="isVariantSelected(variant.id) ? true : undefined"
                        @click="handleSelectVariant(variant, product.name)"
                      />
                    </template>
                  </div>
                </template>
                <template v-if="!productListLoading && !productListError">
                  <FloatingActions v-if="product_list?.products.length" sticky=".cp-content">
                    <Pagination
                      frame
                      :loading="productListLoading"
                      :page="page.current"
                      :total_page="page.total"
                      :first_page="page.current <= 1"
                      :last_page="page.current >= page.total"
                      @clickFirst="toPrevPage($event, true)"
                      @clickPrev="toPrevPage"
                      @clickNext="toNextPage"
                      @clickLast="toNextPage($event, true)"
                    />
                  </FloatingActions>
                </template>
              </template>
            </template>
          </Content>
        </Dialog>
      </template>
    </Container>
  </Content>
</template>

<style lang="scss" src="@assets/page-form.scss" />
<style lang="scss" scoped>
.selected-products {
  margin-bottom: 16px;
}
</style>
