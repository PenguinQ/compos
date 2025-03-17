<script setup lang=ts>
import { watch } from 'vue';

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
  Dialog,
  EmptyState,
  Page,
  PullToRefresh,
  QuantityEditor,
  TabControl,
  TabControls,
  TabPanel,
  TabPanels,
  Textfield,
  Toolbar,
  ToolbarAction,
  ToolbarSpacer,
  ToolbarTitle,
} from '@/components';
import ComposIcon, { ArrowLeftShort, X, XLarge, Save } from '@/components/Icons';

// View Components
import {
  FloatingActions,
  Pagination,
  ProductListItem,
  ProductSelectionItem,
} from '@/views/components';

// Hooks
import { useSaleForm } from './hooks/SaleForm.hook';

// Constants
import GLOBAL from '@/views/constants';
import { SALE_FORM } from './constants';

const {
  saleId,
  saleDetail,
  productListTab,
  showDialog,
  loadBundles,
  searchProductQuery,
  searchBundleQuery,
  formData,
  formError,
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
  handleRefresh,
  handleRefreshList,
  bundleListRefetch,
  productListRefetch,
} = useSaleForm();

watch(
  saleDetail,
  (newData) => {
    const { name } = newData;

    document.title = `Edit ${name} - ComPOS`;
  },
);
</script>

<template>
  <Header>
    <Toolbar sticky>
      <ToolbarAction icon @click="$router.back">
        <ComposIcon :icon="ArrowLeftShort" :size="40" />
      </ToolbarAction>
      <ToolbarTitle>{{ saleId ? `Edit ${saleDetail ? saleDetail.name : 'Sale'}` : 'Add Sale' }}</ToolbarTitle>
      <ToolbarSpacer />
      <template v-if="!isDetailError && !isDetailLoading">
        <ToolbarAction v-if="isMutateAddLoading || isMutateEditLoading" backgroundColor="var(--color-blue-4)" icon>
          <Bar size="24px" color="var(--color-white)" />
        </ToolbarAction>
        <ToolbarAction v-else backgroundColor="var(--color-blue-4)" icon @click="handleSubmit">
          <ComposIcon :icon="Save" color="var(--color-white)" />
        </ToolbarAction>
      </template>
    </Toolbar>
  </Header>
  <Content>
    <template v-if="saleId" #fixed>
      <PullToRefresh @refresh="handleRefresh" />
    </template>
    <Container class="page-container">
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
            <Card class="section-card" variant="outline" margin="0 0 16px">
              <CardHeader>
                <CardTitle>General</CardTitle>
                <CardSubtitle>General information about the sale.</CardSubtitle>
              </CardHeader>
              <CardBody>
                <div class="sales-form-fields">
                  <Textfield
                    id="sale-name"
                    label="Name"
                    placeholder="Sale name"
                    :labelProps="{ for: 'sale-name' }"
                    :error="formError.name ? true : false"
                    :message="formError.name"
                    v-model="formData.name"
                  />
                  <Textfield
                    id="sale-balance"
                    label="Balance"
                    placeholder="Sale balance"
                    prepend="Rp"
                    v-model="formData.balance"
                    :labelProps="{ for: 'sale-balance' }"
                    :error="formError.balance ? true : false"
                    :message="formError.balance"
                  />
                </div>
              </CardBody>
            </Card>
            <Card class="section-card" variant="outline">
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardSubtitle>List of products that available for the sale.</CardSubtitle>
              </CardHeader>
              <CardBody padding="0">
                <EmptyState
                  v-if="!formData.products.length"
                  :emoji="SALE_FORM.LIST_EMPTY_EMOJI"
                  :title="SALE_FORM.LIST_EMPTY_TITLE"
                  :description="SALE_FORM.LIST_EMPTY_DESCRIPTION"
                  margin="56px 0"
                >
                  <template #action>
                    <Button @click="showDialog = true">Add Product</Button>
                  </template>
                </EmptyState>
                <template v-else>
                  <div class="selected-product-list">
                    <ProductListItem
                      :key="`form-sale-product-${product.id}`"
                      v-for="(product, index) of formData.products"
                      :name="product.name"
                      :details="[
                        {
                          name: 'Quantity per Order',
                          value: String(product.quantity),
                        },
                      ]"
                    >
                      <template #extension>
                        <QuantityEditor v-model="product.quantity" :min="1" readonly />
                        <button
                          class="selected-product-list__remove button button--icon"
                          :aria-label="`Remove ${product.name}`"
                          @click="handleRemoveProduct(index)"
                        >
                          <ComposIcon :icon="XLarge" size="14" />
                        </button>
                      </template>
                    </ProductListItem>
                    <div class="selected-product-list__action">
                      <Button full variant="outline" @click="showDialog = true">Add Product</Button>
                    </div>
                  </div>
                </template>
              </CardBody>
            </Card>
          </form>
        </template>
      </template>
    </Container>
  </Content>
  <Dialog
    class="product-selection-dialog"
    v-model="showDialog"
    fullscreen
    hideHeader
    @enter="handleDialogOpen"
    @leave="handleDialogLeave"
  >
    <Page>
      <Toolbar>
        <ToolbarAction icon @click="handleDialogClose">
          <ComposIcon :icon="X" :size="40" />
        </ToolbarAction>
        <input
          v-if="productListTab === 0"
          class="product-selection-dialog__search"
          placeholder="Search Product"
          :value="searchProductQuery"
          @input="handleSearch($event, 'product')"
        />
        <input
          v-else
          class="product-selection-dialog__search"
          placeholder="Search Bundle"
          :value="searchBundleQuery"
          @input="handleSearch($event, 'bundle')"
        />
        <ToolbarAction @click="handleDialogClose($event, true)">Done</ToolbarAction>
        <template #extension>
          <TabControls v-model="productListTab" grow>
            <TabControl title="Product" @click="productListTab = 0" />
            <TabControl title="Bundle" @click="productListTab = 1; loadBundles = true;" />
          </TabControls>
        </template>
      </Toolbar>
      <Content>
        <template #fixed>
          <PullToRefresh @refresh="handleRefreshList" />
        </template>
        <TabPanels v-model="productListTab">
          <TabPanel>
            <Bar v-if="isProductListLoading" margin="116px 0" />
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
                  :emoji="SALE_FORM.PRODUCT_EMPTY_EMOJI"
                  :title="SALE_FORM.PRODUCT_EMPTY_TITLE"
                  :description="SALE_FORM.PRODUCT_EMPTY_DESCRIPTION"
                  margin="56px 0"
                />
                <EmptyState
                  v-else-if="!productList?.products.length && searchProductQuery !== ''"
                  :emoji="SALE_FORM.PRODUCT_EMPTY_SEARCH_EMOJI"
                  :title="SALE_FORM.PRODUCT_EMPTY_SEARCH_TITLE"
                  :description="SALE_FORM.PRODUCT_EMPTY_SEARCH_DESCRIPTION"
                  margin="56px 0"
                />
                <div v-else class="product-selection-list">
                  <template :key="product.id" v-for="product of productList?.products">
                    <ProductSelectionItem
                      :images="product.images"
                      :name="product.name"
                      :selected="isProductSelected(product) ? true : undefined"
                      :aria-label="`Add ${product.name}`"
                      @click="handleSelectProduct(product)"
                    />
                    <ProductSelectionItem
                      v-for="variant of product.variants"
                      :key="variant.id"
                      :indent="1"
                      :images="variant.images"
                      :name="variant.name"
                      :selected="isVariantSelected(variant.id) ? true : undefined"
                      :aria-label="`Add ${product.name} - ${variant.name}`"
                      @click="handleSelectVariant(product.name, variant)"
                    />
                  </template>
                </div>
                <template v-if="!isProductListLoading && !isProductListError">
                  <FloatingActions v-if="productList?.products.length" sticky=".cp-content">
                    <Pagination
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
                  </FloatingActions>
                </template>
              </template>
            </template>
          </TabPanel>
          <TabPanel lazy>
            <Bar v-if="isBundleListLoading" margin="116px 0" />
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
                  :emoji="SALE_FORM.BUNDLE_EMPTY_EMOJI"
                  :title="SALE_FORM.BUNDLE_EMPTY_TITLE"
                  :description="SALE_FORM.BUNDLE_EMPTY_DESCRIPTION"
                  margin="56px 0"
                />
                <EmptyState
                  v-else-if="!bundleList?.bundles.length && searchProductQuery !== ''"
                  :emoji="SALE_FORM.BUNDLE_EMPTY_SEARCH_EMOJI"
                  :title="SALE_FORM.BUNDLE_EMPTY_SEARCH_TITLE"
                  :description="SALE_FORM.BUNDLE_EMPTY_SEARCH_DESCRIPTION"
                  margin="56px 0"
                />
                <div v-else class="product-selection-list">
                  <ProductSelectionItem
                    :key="bundle.id"
                    v-for="bundle of bundleList.bundles"
                    :images="bundle.images"
                    :name="bundle.name"
                    :selected="isBundleSelected(bundle) ? true : undefined"
                    :aria-label="`Add ${bundle.name}`"
                    @click="handleSelectBundle(bundle)"
                  />
                </div>
                <template v-if="!isBundleListLoading && !isBundleListError">
                  <FloatingActions sticky=".cp-content">
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
                  </FloatingActions>
                </template>
              </template>
            </template>
          </TabPanel>
        </TabPanels>
      </Content>
    </Page>
  </Dialog>
</template>

<style lang="scss" src="@/assets/page-form.scss" />