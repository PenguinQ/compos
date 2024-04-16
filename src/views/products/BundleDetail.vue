<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useBundleDetail } from './hooks/BundleDetail.hook';

import Button from '@components/Button';
import Card, { CardBody } from '@components/Card';
import DescriptionList from '@components/DescriptionList';
import Dialog from '@components/Dialog';
import EmptyState from '@components/EmptyState';
import Label from '@components/Label';
import Text from '@components/Text';
import Ticker from '@components/Ticker';
import Toolbar, { ToolbarAction, ToolbarTitle, ToolbarSpacer } from '@components/Toolbar';
import { Column, Row, Container } from '@components/Layout';
import { Shimmer } from '@components/Loader';
import { IconArrowLeftShort, IconPencilSquare, IconTrash } from '@icons';

import { PRODUCT_DETAIL } from './constants';

import no_image from '@assets/illustration/no_image.svg';
import error_image from '@assets/illustration/error.svg';

const router = useRouter();
const {
  bundleID,
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
      @click="router.push(`/bundle/edit/${bundleID}`)"
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

  <EmptyState
    v-if="isError"
    :image="error_image"
    :title="PRODUCT_DETAIL.ERROR_TITLE"
    :description="PRODUCT_DETAIL.ERROR_DESCRIPTION"
  >
    <template #action>
      <Button @click="refetch">Try Again</Button>
    </template>
  </EmptyState>
  <template v-else>
    <Container class="pd-container">
      <template v-if="isLoading">
        <Row>
          <Column :col="{ default: 12, md: 'auto' }">
            <Shimmer block class="pd-loading-image" />
          </Column>
          <Column>
            <Card class="pd-card" variant="outline">
              <CardBody>
                <Shimmer block width="50%" height="20px" radius="4px" margin="4px 0 8px" />
                <Shimmer block width="100%" height="14px" radius="4px" margin="4px 0 0" />
                <hr class="pd-card__separator" />
                <div class="pd-loading-detail">
                  <Shimmer width="30%" height="18px" radius="4px" />
                  <Shimmer width="30%" height="18px" radius="4px" />
                </div>
                <hr class="pd-card__separator" />
                <Shimmer block width="100px" height="20px" radius="4px" margin="4px 0 20px" />
                <div style="display: flex; align-items: center; gap: 16px;">
                  <Shimmer width="80px" height="80px" radius="4px" style="flex-shrink: 0;" />
                  <div style="flex: 1 0 auto;">
                    <Shimmer block width="50%" height="16px" radius="4px" margin="0 0 8px" />
                    <Shimmer block width="30%" height="14px" radius="4px" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Column>
        </Row>
      </template>
      <template v-else>
        <Ticker
          v-if="!data.active"
          :items="[
            {
              title: 'Inactive Product',
              description: `This product bundle currently inactive since any products of it has 0 stock, or doesn't have any products at all.`,
            },
          ]"
          margin="0 0 16px"
        />
        <Row>
          <Column :col="{ default: 12, md: 'auto' }">
            <picture class="pd-image">
              <img
                v-if="data.image.length"
                v-for="image of data.image"
                :src="image"
                :alt="`${data.name} image`"
              />
              <img v-else :src="no_image" :alt="`${data.name} image`" />
            </picture>
          </Column>
          <Column>
            <Card class="pd-card" variant="outline">
              <CardBody>
                <Text heading="3" margin="0 0 4px">{{ data.name }}</Text>
                <Text v-if="data.description">{{ data.description }}</Text>
                <hr class="pd-card__separator" />
                <DescriptionList
                  class="pd-description-list"
                  alignment="horizontal"
                  :items="[
                    {
                      title: 'Price',
                      description: data.price || data.total_price,
                    },
                    {
                      title: 'Updated At',
                      description: data.updated_at || 'None',
                    },
                  ]"
                />
                <hr class="pd-card__separator" />
                <Text as="h4" heading="5">Products</Text>
                <EmptyState
                  v-if="!data.product.length"
                  title="Hmm..."
                  description="This bundle doesn't have any products."
                  margin="16px 0"
                />
                <div v-else class="pd-items">
                  <div
                    v-for="product in data.product"
                    class="pd-item"
                    :data-inactive="!product.active ? true : undefined"
                  >
                    <picture class="pd-item__image">
                      <img
                        :src="`${product.image.length ? product.image[0] : no_image}`"
                        :alt="`${product.name} image`"
                      />
                    </picture>
                    <div class="pd-item__detail">
                      <Text class="pd-item__name" body="large" as="h4">
                        <Label v-if="!product.active" color="red">Inactive</Label>
                        {{ product.product_name ? `${product.product_name} - ${product.name}` : product.name }}
                      </Text>
                      <Text class="pd-item__description">
                        Price: {{ product.price }} | Stock: {{ product.stock }}
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
    <Dialog v-model="dialog_delete" class="pd-dialog-delete" :title="`Delete ${data?.name}?`">
      <template #footer>
        <div class="pd-dialog-delete__actions">
          <Button color="red" full @click="deleteBundle">
            {{ deleteBundleLoading ? 'Loading' : 'Delete' }}
          </Button>
          <Button variant="outline" full @click="dialog_delete = false">Cancel</Button>
        </div>
      </template>
    </Dialog>
  </template>
</template>

<style lang="scss" src="./assets/_detail.scss" scoped />
<style lang="scss" scoped></style>
