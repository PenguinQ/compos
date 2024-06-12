<script setup lang="ts">
import { useRouter } from 'vue-router';

// Common Components
import Button from '@components/Button';
import Dialog from '@components/Dialog';
import EmptyState from '@components/EmptyState';
import Label from '@components/Label';
import Separator from '@components/Separator';
import Text from '@components/Text';
import Ticker from '@components/Ticker';
import Card, { CardHeader, CardTitle, CardSubtitle, CardBody } from '@components/Card';
import DescriptionList, { DescriptionListItem } from '@components/DescriptionList';
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import { Bar } from '@components/Loader';
import { Column, Row, Container } from '@components/Layout';
import { IconArrowLeftShort, IconPencilSquare, IconTrash } from '@icons';

// View Components
import ProductImage from '@/views/components/ProductImage.vue';

// Constants
import GLOBAL from '@/views/constants';
import { BUNDLE_DETAIL } from './constants';

// Assets
import no_image from '@assets/illustration/no_image.svg';

// Hooks
import { useBundleDetail } from './hooks/BundleDetail.hook';

const router = useRouter();
const {
  bundle_id,
  data,
  dialog_delete,
  isError,
  isLoading,
  deleteBundle,
  deleteBundleLoading,
  refetch,
} = useBundleDetail();
</script>

<template>
  <Toolbar sticky>
    <ToolbarAction icon @click="router.back">
      <IconArrowLeftShort size="40" />
    </ToolbarAction>
    <ToolbarTitle>Bundle Detail</ToolbarTitle>
    <ToolbarSpacer />
    <ToolbarAction
      v-if="!isError && !isLoading"
      icon
      backgroundColor="var(--color-blue-4)"
      @click="router.push(`/bundle/edit/${bundle_id}`)"
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
          class="page-ticker"
          :items="[
            {
              title: 'Inactive Bundle',
              description: `This product bundle currently inactive since any or one of its products stock is empty or doesn't have any products at all.`,
            },
          ]"
          margin="0 0 16px"
        />
        <Row>
          <Column :col="{ default: 12, md: 'auto' }">
            <ProductImage class="product-detail-image">
              <img
                v-if="data.images.length"
                v-for="image of data.images"
                :src="image"
                :alt="`${data.name} image`"
              />
              <img v-else :src="no_image" :alt="`${data.name} image`" />
            </ProductImage>
          </Column>
          <Column>
            <Card class="section-card" variant="outline">
              <CardBody>
                <Text heading="3" margin="0 0 4px">{{ data.name }}</Text>
                <Text v-if="data.description">{{ data.description }}</Text>
                <Separator />
                <DescriptionList class="product-detail-list" alignment="horizontal">
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
                    <dd>{{ data.price || data.total_price }}</dd>
                  </DescriptionListItem>
                  <DescriptionListItem>
                    <dt>Updated At</dt>
                    <dd>{{ data.updated_at || '-' }}</dd>
                  </DescriptionListItem>
                </DescriptionList>
              </CardBody>
            </Card>
            <Card class="section-card" variant="outline">
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardSubtitle>Products available in this bundle.</CardSubtitle>
              </CardHeader>
              <CardBody>
                <EmptyState
                  v-if="!data.products.length"
                  emoji="🍃"
                  :title="BUNDLE_DETAIL.EMPTY_PRODUCT_TITLE"
                  :description="BUNDLE_DETAIL.EMPTY_PRODUCT_DESCRIPTION"
                  margin="56px 0"
                />
                <div v-else class="product-detail-items">
                  <div
                    v-for="product in data.products"
                    class="product-detail-item"
                    :data-inactive="!product.active ? true : undefined"
                  >
                    <ProductImage width="80px" height="80px">
                      <img :src="`${product.image ? product.image : no_image}`" :alt="`${product.name} image`" />
                    </ProductImage>
                    <div class="product-detail-item__body">
                      <Text class="product-detail-item__name" body="large" as="h4">
                        <Label v-if="!product.active" color="red">Inactive</Label>
                        {{ product.product_name ? `${product.product_name} - ${product.name}` : product.name }}
                      </Text>
                      <div class="product-detail-item__body">
                        <Text body="small" margin="0 0 2px">Price: {{ product.price }}</Text>
                        <Text body="small" margin="0 0 2px">Quantity: {{ product.quantity }}</Text>
                        <Text body="small" margin="0">SKU: {{ product.sku || '-' }}</Text>
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
    <Dialog v-model="dialog_delete" class="product-detail-delete" :title="`Delete ${data?.name}?`">
      <template #footer>
        <div class="product-detail-delete__actions">
          <Button color="red" full @click="deleteBundle">
            {{ deleteBundleLoading ? 'Loading' : 'Delete' }}
          </Button>
          <Button variant="outline" full @click="dialog_delete = false">Cancel</Button>
        </div>
      </template>
    </Dialog>
  </template>
</template>

<style lang="scss" src="@assets/_page-detail.scss" />
