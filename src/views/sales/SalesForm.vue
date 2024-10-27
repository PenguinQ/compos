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
import ComposIcon, { ArrowLeftShort, X } from '@components/Icons';
import { TabControls, TabControl, TabPanels, TabPanel } from '@components/TabsV2';

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
import { SALES_FORM } from './constants';

const {
  salesId,
  productListTab,
  showDialog,
  loadProducts,
  loadBundles,
  searchProductQuery,
  searchBundleQuery,
  formData,
  formError,
  selectedProducts,
  productList,
  bundleList,
  isDetailError,
  isDetailLoading,
  isProductListError,
  isProductListLoading,
  isBundleListError,
  isBundleListLoading,
  isMutateAddLoading,
  isMutateEditLoading,
  pageProduct,
  pageBundle,
  handleSearch,
  toPrevPage,
  toNextPage,
  detailRefetch,
  isProductSelected,
  isVariantSelected,
  isBundleSelected,
  handleDialogOpen,
  handleDialogClose,
  handleDialogLeave,
  handleRemoveProduct,
  handleSelectProduct,
  handleSelectVariant,
  handleSelectBundle,
  handleSubmit,
  bundleListRefetch,
  productListRefetch,
  mutateAdd,
} = useSalesForm();
</script>

<template>
  <Toolbar sticky>
    <ToolbarAction icon @click="$router.back">
      <ComposIcon :icon="ArrowLeftShort" :size="40" />
    </ToolbarAction>
    <ToolbarTitle>{{ salesId ? 'Edit Sales' : 'Add Sales' }}</ToolbarTitle>
    <ToolbarSpacer />
    <ToolbarAction @click="handleSubmit">Save</ToolbarAction>
  </Toolbar>
  <!--  -->
  <Container class="pf-container">
    <EmptyState
      v-if="isDetailError"
      :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
      :title="GLOBAL.ERROR_EMPTY_TITLE"
      :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
      margin="56px 0"
    >
      <template #action>
        <Button @click="detailRefetch">Try Again</Button>
      </template>
    </EmptyState>
    <template v-else>
      <Bar v-if="isDetailLoading" margin="56px 0" />
      <template v-else>
        <form id="sales-add-form" @submit.prevent>
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
                  :error="formError.name ? true : false"
                  :message="formError.name"
                  v-model="formData.name"
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
                v-if="!formData.products.length"
                :emoji="SALES_FORM.LIST_EMPTY_EMOJI"
                :title="SALES_FORM.LIST_EMPTY_TITLE"
                :description="SALES_FORM.LIST_EMPTY_DESCRIPTION"
                margin="56px 0"
              >
                <template #action>
                  <Button @click="showDialog = true">Add Product</Button>
                </template>
              </EmptyState>
              <template v-else>
                <div class="sales-products-list">
                  <template :key="product.id" v-for="(product, index) in formData.products">
                    <SalesProduct
                      type="form"
                      :images="product.images"
                      :name="product.name"
                      :quantity="product.quantity"
                      @clickRemove="handleRemoveProduct(index)"
                      @clickDecrement="(value: string) => product.quantity = parseInt(value)"
                      @clickIncrement="(value: string) => product.quantity = parseInt(value)"
                    />
                  </template>
                </div>
                <Button full @click="showDialog = true">Add Product</Button>
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
    v-model="showDialog"
    fullscreen
    hideHeader
    @enter="handleDialogOpen"
    @leave="handleDialogLeave"
  >
    <Toolbar sticky>
      <ToolbarAction icon @click="handleDialogClose">
        <ComposIcon :icon="X" :size="40" />
      </ToolbarAction>
      <input
        v-if="productListTab === 0"
        class="temp-search"
        placeholder="Search Product"
        :value="searchProductQuery"
        @input="handleSearch($event, 'product')"
      />
      <input
        v-else
        class="temp-search"
        placeholder="Search Bundle"
        :value="searchBundleQuery"
        @input="handleSearch($event, 'bundle')"
      />
      <ToolbarAction @click="handleDialogClose($event, true)">
        Done
      </ToolbarAction>
      <template #extension>
        <TabControls v-model="productListTab" grow>
          <TabControl title="Product" @click="productListTab = 0" />
          <TabControl title="Bundle" @click="productListTab = 1; loadBundles = true;" />
        </TabControls>
      </template>
    </Toolbar>
    <TabPanels v-model="productListTab">
      <TabPanel>
        <Bar v-if="isProductListLoading" margin="56px 0" />
        <template v-else>
          <EmptyState
            v-if="isProductListError"
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
            <EmptyState
              v-if="!productList?.products.length && searchProductQuery === ''"
              :emoji="SALES_FORM.PRODUCT_EMPTY_EMOJI"
              :title="SALES_FORM.PRODUCT_EMPTY_TITLE"
              :description="SALES_FORM.PRODUCT_EMPTY_DESCRIPTION"
              margin="56px 0"
            />
            <EmptyState
              v-else-if="!productList?.products.length && searchProductQuery !== ''"
              :emoji="SALES_FORM.PRODUCT_EMPTY_SEARCH_EMOJI"
              :title="SALES_FORM.PRODUCT_EMPTY_SEARCH_TITLE"
              :description="SALES_FORM.PRODUCT_EMPTY_SEARCH_DESCRIPTION"
              margin="56px 0"
            />
            <div v-else class="sales-products-selection">
              <template :key="product.id" v-for="product of productList?.products">
                <SalesProduct
                  small
                  role="button"
                  :aria-label="`Add ${product.name}`"
                  :images="product.images"
                  :name="product.name"
                  :selected="isProductSelected(product) ? true : undefined"
                  @click="handleSelectProduct(product)"
                />
                <SalesProduct
                  :key="variant.id"
                  v-for="variant of product.variants"
                  small
                  variant
                  role="button"
                  :aria-label="`Add ${product.name} - ${variant.name}`"
                  :images="variant.images"
                  :name="variant.name"
                  :selected="isVariantSelected(variant.id) ? true : undefined"
                  @click="handleSelectVariant(product.name, variant)"
                />
              </template>
            </div>
            <ListFooter sticky height="86px">
              <template v-if="!isProductListLoading && !isProductListError">
                <Pagination
                  v-if="productList?.products.length"
                  frame
                  :page="pageProduct.current"
                  :total_page="pageProduct.total"
                  :first_page="pageProduct.current <= 1"
                  :last_page="pageProduct.current >= pageProduct.total"
                  @clickFirst="toPrevPage('product', true)"
                  @clickPrev="toPrevPage('product')"
                  @clickNext="toNextPage('product')"
                  @clickLast="toNextPage('product', true)"
                />
              </template>
            </ListFooter>
          </template>
        </template>
      </TabPanel>
      <TabPanel lazy>
        <Bar v-if="isBundleListLoading" margin="56px 0" />
        <template v-else>
          <EmptyState
            v-if="isBundleListError"
            :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
            :title="GLOBAL.ERROR_EMPTY_TITLE"
            :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
            margin="56px 0"
          >
            <template #action>
              <Button @click="bundleListRefetch">Try Again</Button>
            </template>
          </EmptyState>
          <template v-else>
            <EmptyState
              v-if="!bundleList?.bundles.length && searchProductQuery === ''"
              :emoji="SALES_FORM.BUNDLE_EMPTY_EMOJI"
              :title="SALES_FORM.BUNDLE_EMPTY_TITLE"
              :description="SALES_FORM.BUNDLE_EMPTY_DESCRIPTION"
              margin="56px 0"
            />
            <EmptyState
              v-else-if="!bundleList?.bundles.length && searchProductQuery !== ''"
              :emoji="SALES_FORM.BUNDLE_EMPTY_SEARCH_EMOJI"
              :title="SALES_FORM.BUNDLE_EMPTY_SEARCH_TITLE"
              :description="SALES_FORM.BUNDLE_EMPTY_SEARCH_DESCRIPTION"
              margin="56px 0"
            />
            <div v-else class="sales-products-selection">
              <template :key="bundle.id" v-for="bundle of bundleList.bundles">
                <SalesProduct
                  small
                  role="button"
                  :aria-label="`Add ${bundle.name}`"
                  :images="bundle.images"
                  :name="bundle.name"
                  :selected="isBundleSelected(bundle) ? true : undefined"
                  @click="handleSelectBundle(bundle)"
                />
              </template>
            </div>
            <ListFooter sticky height="86px">
              <template v-if="!isBundleListLoading && !isBundleListError">
                <Pagination
                  v-if="productList?.products.length"
                  frame
                  :page="pageBundle.current"
                  :total_page="pageBundle.total"
                  :first_page="pageBundle.current <= 1"
                  :last_page="pageBundle.current >= pageBundle.total"
                  @clickFirst="toPrevPage('bundle', true)"
                  @clickPrev="toPrevPage('bundle')"
                  @clickNext="toNextPage('bundle')"
                  @clickLast="toNextPage('bundle', true)"
                />
              </template>
            </ListFooter>
          </template>
        </template>
      </TabPanel>
    </TabPanels>
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
