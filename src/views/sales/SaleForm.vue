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
import ComposIcon, { ArrowLeftShort, X, Save } from '@/components/Icons';

// View Components
import { FloatingActions, Pagination } from '@/views/components';
import SaleProduct from './components/SaleProduct.vue';

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
      <ToolbarTitle>{{ saleId ? `Edit ${saleDetail?.name}` : 'Add Sale' }}</ToolbarTitle>
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
                  <div class="products-list">
                    <template :key="product.id" v-for="(product, index) in formData.products">
                      <SaleProduct
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
                  <div class="products-list-actions">
                    <Button full @click="showDialog = true">Add Product</Button>
                  </div>
                </template>
              </CardBody>
            </Card>
          </form>
        </template>
      </template>
    </Container>
  </Content>

  <!-- Dialogs -->
  <Dialog
    class="products-dialog"
    v-model="showDialog"
    fullscreen
    hideHeader
    @enter="handleDialogOpen"
    @leave="handleDialogLeave"
  >
    <Toolbar>
      <ToolbarAction icon @click="handleDialogClose">
        <ComposIcon :icon="X" :size="40" />
      </ToolbarAction>
      <input
        v-if="productListTab === 0"
        class="products-dialog__search"
        placeholder="Search Product"
        :value="searchProductQuery"
        @input="handleSearch($event, 'product')"
      />
      <input
        v-else
        class="products-dialog__search"
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
    <Content>
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
              <div v-else class="products-dialog-list">
                <template :key="product.id" v-for="product of productList?.products">
                  <SaleProduct
                    small
                    role="button"
                    :aria-label="`Add ${product.name}`"
                    :images="product.images"
                    :name="product.name"
                    :selected="isProductSelected(product) ? true : undefined"
                    @click="handleSelectProduct(product)"
                  />
                  <SaleProduct
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
              <div v-else class="products-dialog-list">
                <template :key="bundle.id" v-for="bundle of bundleList.bundles">
                  <SaleProduct
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
  </Dialog>
</template>

<style lang="scss" src="@assets/_page-form.scss" />
<style lang="scss" scoped>
.products-list {
  .vc-sales-form-product {
    &:first-of-type {
      border-top-color: transparent;
    }

    &:last-of-type  {
      border-bottom-color: transparent;
    }
  }

  &-actions {
    border-top: 1px solid var(--color-border);
    padding: 16px;
  }
}

.products-dialog {
  .cp-dialog-body {
    padding: 0;
  }

  &__search {
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

  &-list {
    .vc-sales-form-product {
      &:first-of-type {
        border-top-color: transparent;
      }
    }
  }
}
</style>
