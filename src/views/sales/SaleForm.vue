<script setup lang=ts>
import { ref, watch } from 'vue';

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
  Text,
  Textfield,
  Toolbar,
  ToolbarAction,
  ToolbarSpacer,
  ToolbarTitle,
  Row,
  Column,
} from '@/components';
import ComposIcon, { ArrowLeftShort, X, Save } from '@/components/Icons';

// View Components
import {
  ButtonRemove,
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
  //
  handleAddNote,
  handleRemoveNote,
} = useSaleForm();

const productListContainer = ref<HTMLDivElement | null>(null);
const bundleListContainer  = ref<HTMLDivElement | null>(null);

watch(
  saleDetail,
  (newData) => {
    if (newData) {
      const { name } = newData;

      document.title = `Edit ${name} - ComPOS`;
    }
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
                <Row col="1" :gutter="16">
                  <Column>
                    <Textfield
                      id="sale-name"
                      label="Name"
                      placeholder="Sale name"
                      :labelProps="{ for: 'sale-name' }"
                      :error="formError.name ? true : false"
                      :message="formError.name"
                      v-model="formData.name"
                    />
                  </Column>
                  <Column>
                    <Textfield
                      id="sale-balance"
                      label="Balance"
                      placeholder="Sale balance"
                      prepend="Rp"
                      v-model="formData.balance"
                      :labelProps="{ for: 'sale-balance' }"
                      :error="formError.balance ? true : false"
                      :message="formError.balance ? formError.balance : SALE_FORM.FORM_MESSAGE_BALANCE"
                    />
                  </Column>
                  <Column>
                    <Text fontWeight="500" margin="0 0 4px">Order Notes (Optional)</Text>
                    <div class="order-notes">
                      <div
                        class="order-notes-item"
                        v-for="(_, index) in formData.orderNotes"
                        :key="`order-note-${formData.id}-${index}`"
                      >
                        <Textfield
                          v-model="formData.orderNotes[index]"
                          placeholder="Paid with ..."
                        />
                        <ButtonRemove
                          v-if="formData.orderNotes.length > 1"
                          :size="22"
                          @click="handleRemoveNote(index)"
                        />
                      </div>
                    </div>
                    <Text class="order-notes-message" margin="0 0 12px">
                      {{ SALE_FORM.FORM_MESSAGE_ORDER_NOTES }}
                    </Text>
                    <Button variant="outline" full @click="handleAddNote">Add Note</Button>
                  </Column>
                </Row>
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
                      :images="product.images"
                      :details="[
                        {
                          name: 'Quantity per Order',
                          value: String(product.quantity),
                        },
                      ]"
                    >
                      <template #extensions>
                        <QuantityEditor v-model="product.quantity" :min="1" readonly />
                        <ButtonRemove
                          :size="22"
                          :aria-label="`Remove ${product.name}`"
                          @click="handleRemoveProduct(index)"
                        />
                      </template>
                    </ProductListItem>
                  </div>
                  <div class="selected-product-list-action">
                    <Button full variant="outline" @click="showDialog = true">Add Product</Button>
                  </div>
                </template>
              </CardBody>
            </Card>
          </form>
        </template>
      </template>
    </Container>
  </Content>

  <!-- Dialog Product Selection -->
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
        <template #extensions>
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
            <EmptyState
              v-if="isProductListError"
              :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
              :title="GLOBAL.ERROR_EMPTY_TITLE"
              :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
              margin="48px 16px 16px"
            >
              <template #action>
                <Button @click="productListRefetch">Try Again</Button>
              </template>
            </EmptyState>
            <template v-else>
              <Bar v-if="isProductListLoading" margin="48px 16px 16px" />
              <template v-else>
                <EmptyState
                  v-if="!productList?.products.length && searchProductQuery === ''"
                  :emoji="SALE_FORM.PRODUCT_EMPTY_EMOJI"
                  :title="SALE_FORM.PRODUCT_EMPTY_TITLE"
                  :description="SALE_FORM.PRODUCT_EMPTY_DESCRIPTION"
                  margin="48px 16px 16px"
                />
                <EmptyState
                  v-else-if="!productList?.products.length && searchProductQuery !== ''"
                  :emoji="SALE_FORM.PRODUCT_EMPTY_SEARCH_EMOJI"
                  :title="SALE_FORM.PRODUCT_EMPTY_SEARCH_TITLE"
                  :description="SALE_FORM.PRODUCT_EMPTY_SEARCH_DESCRIPTION"
                  margin="48px 16px 16px"
                />
                <div v-else ref="productListContainer" class="product-selection-list">
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
                  <FloatingActions v-if="productList?.products.length" sticky=".cp-content" :spacedElement="productListContainer">
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
            <EmptyState
              v-if="isBundleListError"
              :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
              :title="GLOBAL.ERROR_EMPTY_TITLE"
              :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
              margin="48px 16px 16px"
            >
              <template #action>
                <Button @click="bundleListRefetch">Try Again</Button>
              </template>
            </EmptyState>
            <template v-else>
              <Bar v-if="isBundleListLoading" margin="48px 16px 16px" />
              <template v-else>
                <EmptyState
                  v-if="!bundleList?.bundles.length && searchProductQuery === ''"
                  :emoji="SALE_FORM.BUNDLE_EMPTY_EMOJI"
                  :title="SALE_FORM.BUNDLE_EMPTY_TITLE"
                  :description="SALE_FORM.BUNDLE_EMPTY_DESCRIPTION"
                  margin="48px 16px 16px"
                />
                <EmptyState
                  v-else-if="!bundleList?.bundles.length && searchProductQuery !== ''"
                  :emoji="SALE_FORM.BUNDLE_EMPTY_SEARCH_EMOJI"
                  :title="SALE_FORM.BUNDLE_EMPTY_SEARCH_TITLE"
                  :description="SALE_FORM.BUNDLE_EMPTY_SEARCH_DESCRIPTION"
                  margin="48px 16px 16px"
                />
                <div v-else ref="bundleListContainer" class="product-selection-list">
                  <ProductSelectionItem
                    v-for="bundle of bundleList?.bundles"
                    :key="bundle.id"
                    :images="bundle.images"
                    :name="bundle.name"
                    :selected="isBundleSelected(bundle) ? true : undefined"
                    :aria-label="`Add ${bundle.name}`"
                    @click="handleSelectBundle(bundle)"
                  />
                </div>
                <template v-if="!isBundleListLoading && !isBundleListError">
                  <FloatingActions v-if="bundleList?.bundles.length" sticky=".cp-content" :spacedElement="productListContainer">
                    <Pagination
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

<style lang="scss" src="@/assets/common.page-form.scss" />
<style lang="scss" scoped>
.order-notes {
  margin-bottom: 8px;

  &-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 8px;

    &:last-of-type {
      margin-bottom: 0;
    }

    .vc-button-remove {
      flex-shrink: 0;
    }
  }

  &-message {
    @include text-body-sm;
  }
}
</style>
