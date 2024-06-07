<script setup lang="ts">
import { useRouter } from 'vue-router';

// Common Components
import Button from '@components/Button';
import Card, { CardBody } from '@components/Card';
import DescriptionList from '@components/DescriptionList';
import Dialog from '@components/Dialog';
import EmptyState from '@components/EmptyState';
import Label from '@components/Label';
import Text from '@components/Text';
import Ticker from '@components/Ticker';
import Separator from '@components/Separator'
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import { Bar } from '@components/Loader';
import { Column, Row, Container } from '@components/Layout';
import { IconArrowLeftShort, IconPencilSquare, IconTrash } from '@icons';

// View Components
import ProductImage from '@/views/components/ProductImage.vue';

// Constants
import GLOBAL from '@/views/constants';

// Assets
import no_image from '@assets/illustration/no_image.svg';

// Hooks
import { useProductDetail } from './hooks/ProductDetail.hook';

const router = useRouter();
const {
  product_id,
  data,
  dialog_delete,
  isError,
  isLoading,
  deleteProduct,
  deleteProductLoading,
  refetch,
} = useProductDetail();
</script>

<template>
  <Toolbar sticky>
    <ToolbarAction icon @click="router.back">
      <IconArrowLeftShort size="40" />
    </ToolbarAction>
    <ToolbarTitle>Product Detail</ToolbarTitle>
    <ToolbarSpacer />
    <ToolbarAction
      v-if="!isError && !isLoading"
      icon
      backgroundColor="var(--color-blue-4)"
      @click="router.push(`/product/edit/${product_id}`)"
    >
      <IconPencilSquare />
    </ToolbarAction>
    <ToolbarAction
      v-if="!isError && !isLoading"
      icon
      backgroundColor="var(--color-red-4)"
      @click="dialog_delete = true"
    >
      <IconTrash />
    </ToolbarAction>
  </Toolbar>
  <!--  -->
  <EmptyState
    v-if="isError"
    :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
    :title="GLOBAL.ERROR_EMPTY_TITLE"
    :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
    margin="56px 0"
  >
    <template #action>
      <Button @click="refetch">Try Again</Button>
    </template>
  </EmptyState>
  <!--  -->
  <template v-else>
    <Container class="page-container">
      <Bar v-if="isLoading" margin="56px 0" />
      <template v-else>
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
              <img :src="data.image ? data.image : no_image" :alt="`${data.name} image`" />
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
                  v-if="data.variants.length"
                  :items="[
                    {
                      title: 'Price, Stock, and SKU',
                      description: 'Since this product has variants that have their own price, stock, and SKU, the default price, stock, and SKU of this product will follow the variants.',
                      type: 'info',
                    },
                  ]"
                  margin="0 0 20px"
                />
                <DescriptionList
                  class="product-detail-list"
                  alignment="horizontal"
                  :items="data.variants.length ? [
                    {
                      title: 'Updated At',
                      description: data.updated_at || '-',
                    },
                  ] : [
                    {
                      title: 'Price',
                      description: data.price,
                    },
                    {
                      title: 'Stock',
                      description: data.stock || '-',
                    },
                    {
                      title: 'SKU',
                      description: data.sku || '-',
                    },
                    {
                      title: 'Updated At',
                      description: data.updated_at || '-',
                    },
                  ]"
                />
                <Separator />
                <Text as="h4" heading="5">Variants</Text>
                <EmptyState
                  v-if="!data.variants.length"
                  title="Hmm..."
                  description="This product doesn't have any variants."
                  margin="16px 0"
                />
                <div v-else class="product-detail-items">
                  <div
                    v-for="variant in data.variants"
                    class="product-detail-item"
                    :data-inactive="!variant.active ? true : undefined"
                  >
                    <ProductImage width="80px" height="80px">
                      <img :src="variant.image ? variant.image : no_image" :alt="`${variant.name} image`" />
                    </ProductImage>
                    <div class="product-detail-item__body">
                      <Text class="product-detail-item__name" body="large" as="h4">
                        <Label v-if="!variant.active" color="red">Inactive</Label>
                        {{ variant.name }}
                      </Text>
                      <Text class="product-detail-item__description">
                        Price: {{ variant.price }} | Stock: {{ variant.stock }} | SKU: {{ variant.sku }}
                      </Text>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Column>
        </Row>
      </template>
    </Container>
    <!--  -->
    <Dialog v-model="dialog_delete" class="product-detail-delete" :title="`Delete ${data?.name}?`">
      <Text body="large" textAlign="center" margin="0">
        Deleting this product will automatically remove this products or any of it's variants in any bundles.
      </Text>
      <template #footer>
        <div class="product-detail-delete__actions">
          <Button color="red" full @click="deleteProduct">
            {{ deleteProductLoading ? 'Loading' : 'Delete' }}
          </Button>
          <Button variant="outline" full @click="dialog_delete = false">Cancel</Button>
        </div>
      </template>
    </Dialog>
  </template>
</template>

<style lang="scss" src="@assets/_page-detail.scss" />
