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
  Dialog,
  EmptyState,
  Label,
  PullToRefresh,
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
import { BUNDLE_DETAIL } from './constants';

// Assets
import no_image from '@assets/illustration/no_image.svg';

// Hooks
import { useBundleDetail } from './hooks/BundleDetail.hook';

const router = useRouter();
const {
  bundleId,
  data,
  dialogDelete,
  isError,
  isLoading,
  deleteBundle,
  deleteBundleLoading,
  refetch,
  handleRefresh,
} = useBundleDetail();

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
      <ToolbarTitle>{{ data ? data.name : 'Bundle Detail' }}</ToolbarTitle>
      <ToolbarSpacer />
      <ToolbarAction
        v-if="!isError && !isLoading"
        icon
        backgroundColor="var(--color-blue-4)"
        @click="router.push(`/bundle/edit/${bundleId}`)"
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
                    <dd>{{ data.priceFormatted }}</dd>
                  </DescriptionListItem>
                  <DescriptionListItem>
                    <dt>Updated At</dt>
                    <dd>{{ data.updatedAt || '-' }}</dd>
                  </DescriptionListItem>
                </DescriptionList>
              </CardBody>
            </Card>
            <Card class="section-card" variant="outline">
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardSubtitle>Products available in this bundle.</CardSubtitle>
              </CardHeader>
              <CardBody padding="0">
                <EmptyState
                  v-if="!data.products.length"
                  emoji="🍃"
                  :title="BUNDLE_DETAIL.EMPTY_PRODUCT_TITLE"
                  :description="BUNDLE_DETAIL.EMPTY_PRODUCT_DESCRIPTION"
                  padding="48px 16px"
                />
                <template v-else>
                  <ProductListItem
                    :key="`product-bundle-${product.id}`"
                    v-for="product of data.products"
                    :active="product.active"
                    :name="product.name"
                    :images="product.image ? [product.image] : []"
                    :details="[
                      {
                        name: 'Price',
                        value: product.priceFormatted,
                      },
                      {
                        name: 'Stock',
                        value: String(product.stock),
                      },
                      {
                        name: 'Quantity',
                        value: String(product.quantity),
                      },
                      {
                        name: 'SKU',
                        value: product.sku || '-',
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
      Deleting this bundle will automatically remove this bundle from any sale.
    </Text>
    <template #footer>
      <div class="dialog-actions">
        <Button color="red" full @click="deleteBundle">
          {{ deleteBundleLoading ? 'Loading' : 'Delete' }}
        </Button>
        <Button variant="outline" full @click="dialogDelete = false">Cancel</Button>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss" src="@/assets/common.page-detail.scss" />
