<script setup lang="ts">
import { useRouter } from 'vue-router';

// Common Components
import Button from '@components/Button';
import Dialog from '@components/Dialog';
import EmptyState from '@components/EmptyState';
import Label from '@components/Label';
import Separator from '@components/Separator'
import Text from '@components/Text';
import Ticker from '@components/Ticker';
import Card, { CardHeader, CardTitle, CardSubtitle, CardBody } from '@components/Card';
import DescriptionList, { DescriptionListItem } from '@components/DescriptionList';
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import { Bar } from '@components/Loader';
import { Column, Row, Container } from '@components/Layout';
import ComposIcon, { ArrowLeftShort, PencilSquare, Trash } from '@components/Icons';

// View Components
import ProductImage from '@/views/components/ProductImage.vue';

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
} = useProductDetail();
</script>

<template>
  <Toolbar sticky>
    <ToolbarAction icon @click="router.back">
      <ComposIcon :icon="ArrowLeftShort" :size="40" />
    </ToolbarAction>
    <ToolbarTitle>Product Detail</ToolbarTitle>
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
                <DescriptionList class="product-detail-list" alignment="horizontal">
                  <template v-if="data.variants.length">
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
                      <dd>{{ data.price }}</dd>
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
                    <dd>{{ data.updated_at }}</dd>
                  </DescriptionListItem>
                </DescriptionList>
              </CardBody>
            </Card>
            <Card class="section-card" variant="outline">
              <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardSubtitle>Variants available in this product.</CardSubtitle>
              </CardHeader>
              <CardBody>
                <EmptyState
                  v-if="!data.variants.length"
                  emoji="🍃"
                  :title="PRODUCT_DETAIL.EMPTY_VARIANT_TITLE"
                  :description="PRODUCT_DETAIL.EMPTY_VARIANT_DESCRIPTION"
                  margin="56px 0"
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
                      <div class="product-detail-item__body">
                        <Text body="small" margin="0 0 2px">Price: {{ variant.price }}</Text>
                        <Text body="small" margin="0 0 2px">Quantity: {{ variant.stock }}</Text>
                        <Text body="small" margin="0">SKU: {{ variant.sku || '-' }}</Text>
                      </div>
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
    <Dialog v-model="dialogDelete" class="product-detail-delete" :title="`Delete ${data?.name}?`">
      <Text body="large" textAlign="center" margin="0">
        Deleting this product will automatically remove this products or any of it's variants in any bundles.
      </Text>
      <template #footer>
        <div class="product-detail-delete__actions">
          <Button color="red" full @click="deleteProduct">
            {{ deleteProductLoading ? 'Loading' : 'Delete' }}
          </Button>
          <Button variant="outline" full @click="dialogDelete = false">Cancel</Button>
        </div>
      </template>
    </Dialog>
  </template>
</template>

<style lang="scss" src="@assets/_page-detail.scss" />
