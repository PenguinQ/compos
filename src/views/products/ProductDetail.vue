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
  DescriptionList,
  DescriptionListItem,
  PullToRefresh,
  Dialog,
  EmptyState,
  Label,
  Separator,
  Text,
  Ticker,
  Toolbar,
  ToolbarAction,
  ToolbarSpacer,
  ToolbarTitle,
} from '@/components';
import ComposIcon, { ArrowLeftShort, PencilSquare, Trash } from '@/components/Icons';

// View Components
import { ProductImage, ProductListItem } from '@/views/components';

// Constants
import GLOBAL from '@/views/constants';
import { PRODUCT_DETAIL } from './constants';

// Assets
import no_image from '@assets/illustration/no_image.svg';

// Hooks
import { useProductDetail } from './hooks/ProductDetail.hook';

const router = useRouter();
const {
  productId,
  data,
  dialogDelete,
  isError,
  isLoading,
  deleteProduct,
  deleteProductLoading,
  refetch,
  handleRefresh,
} = useProductDetail();

watch(
  data,
  (newData) => {
    if (newData) {
      const { name } = newData;

      document.title = `${name} - ComPOS`;
    }
  },
);
</script>

<template>
  <Header>
    <Toolbar>
      <ToolbarAction icon @click="router.back">
        <ComposIcon :icon="ArrowLeftShort" :size="40" />
      </ToolbarAction>
      <ToolbarTitle>{{ data ? data.name : 'Product Detail' }}</ToolbarTitle>
      <ToolbarSpacer />
      <ToolbarAction
        v-if="!isError && !isLoading"
        icon
        backgroundColor="var(--color-blue-4)"
        @click="router.push(`/product/edit/${productId}`)"
      >
        <ComposIcon :icon="PencilSquare" />
      </ToolbarAction>
      <ToolbarAction
        v-if="!isError && !isLoading"
        icon
        backgroundColor="var(--color-red-4)"
        @click="dialogDelete = true"
      >
        <ComposIcon :icon="Trash" />
      </ToolbarAction>
    </Toolbar>
  </Header>
  <Content>
    <template #fixed>
      <PullToRefresh @refresh="handleRefresh" />
    </template>
    <Bar v-if="isLoading" />
    <template v-else>
      <EmptyState
        v-if="isError"
        :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
        :title="GLOBAL.ERROR_EMPTY_TITLE"
        :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
        height="100%"
      >
        <template #action>
          <Button @click="refetch">Try Again</Button>
        </template>
      </EmptyState>
      <Container v-else-if="data" class="page-container">
        <Ticker
          v-if="!data.active"
          :items="[
            {
              title: 'Inactive Product',
              description: `This product currently inactive since the stock is 0, or any variants of it has 0 stock.`,
            },
          ]"
          margin="0 0 16px"
        />
        <Row>
          <Column :col="{ default: 12, md: 'auto' }">
            <ProductImage class="product-detail-image">
              <img v-if="!data.images.length" :src="no_image" :alt="`${data.name} image`">
              <img v-else v-for="image of data.images" :src="image ? image : no_image" :alt="`${data.name} image`">
            </ProductImage>
          </Column>
          <Column>
            <Card class="section-card" variant="outline">
              <CardBody>
                <Text heading="3" margin="0 0 4px">{{ data.name }}</Text>
                <Text v-if="data.by" body="small" style="opacity: 0.8; margin: 0 0 8px;">{{ data.by }}</Text>
                <Text v-if="data.description">{{ data.description }}</Text>
                <Separator />
                <Ticker
                  v-if="data.variants?.length"
                  :items="[
                    {
                      title: 'Price, Stock, and SKU',
                      description: 'Since this product has variants; the price, stock, and SKU are set on each variants.',
                      type: 'info',
                    },
                  ]"
                  margin="0 0 20px"
                />
                <DescriptionList class="product-detail-list" alignment="horizontal">
                  <template v-if="data.variants?.length">
                    <DescriptionListItem alignItems="center">
                      <dt>Status</dt>
                      <dd>
                        <Label :color="data.active ? 'green' : 'red'">
                          {{ data.active ? 'Active' : 'Inactive' }}
                        </Label>
                      </dd>
                    </DescriptionListItem>
                  </template>
                  <template v-else>
                    <DescriptionListItem alignItems="center">
                      <dt>Status</dt>
                      <dd>
                        <Label :color="data.active ? 'green' : 'red'">
                          {{ data.active ? 'Active' : 'Inactive' }}
                        </Label>
                      </dd>
                    </DescriptionListItem>
                    <DescriptionListItem>
                      <dt>Price</dt>
                      <dd>{{ data.priceFormatted }}</dd>
                    </DescriptionListItem>
                    <DescriptionListItem>
                      <dt>Stock</dt>
                      <dd>{{ data.stock }}</dd>
                    </DescriptionListItem>
                    <DescriptionListItem>
                      <dt>SKU</dt>
                      <dd>{{ data.sku || '-' }}</dd>
                    </DescriptionListItem>
                  </template>
                  <DescriptionListItem>
                    <dt>Updated At</dt>
                    <dd>{{ data.updatedAt }}</dd>
                  </DescriptionListItem>
                </DescriptionList>
              </CardBody>
            </Card>
            <Card class="section-card" variant="outline">
              <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardSubtitle>Variants available in this product.</CardSubtitle>
              </CardHeader>
              <CardBody padding="0">
                <EmptyState
                  v-if="!data.variants?.length"
                  emoji="🍃"
                  :title="PRODUCT_DETAIL.EMPTY_VARIANT_TITLE"
                  :description="PRODUCT_DETAIL.EMPTY_VARIANT_DESCRIPTION"
                  padding="48px 16px"
                />
                <template v-else>
                  <ProductListItem
                    :key="`variant-${variant.id}`"
                    v-for="variant of data.variants"
                    :active="variant.active"
                    :name="variant.name"
                    :images="variant.images"
                    :details="[
                      {
                        name: 'Price',
                        value: variant.priceFormatted,
                      },
                      {
                        name: 'Stock',
                        value: String(variant.stock),
                      },
                      {
                        name: 'SKU',
                        value: variant.sku ||  '-',
                      },
                    ]"
                  />
                </template>
              </CardBody>
            </Card>
          </Column>
        </Row>
      </Container>
    </template>
  </Content>
  <Dialog v-model="dialogDelete" :title="`Delete ${data?.name}?`">
    <Text body="large" textAlign="center" margin="0">
      Deleting this product will automatically remove this product and it's variants from any sale and bundle.
    </Text>
    <template #footer>
      <div class="dialog-actions">
        <Button color="red" full @click="deleteProduct">
          {{ deleteProductLoading ? 'Loading' : 'Delete' }}
        </Button>
        <Button variant="outline" full @click="dialogDelete = false">Cancel</Button>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss" src="@/assets/common.page-detail.scss" />
