import { reactive, toRefs } from 'vue';
import { monotonicFactory } from 'ulidx';
import { db } from '@database';

interface ProductData {
  id: string;
  name: string;
  description?: string;
  image?: string;
  by?: string;
  price: unknown;
  stock?: number;
  sku?: string;
  timestamp: Date;
};

export const updateProduct = async (id: string, data: ProductData) => {
  await db.product.findOne(id).exec().then((prod: any) => {
    prod.update({
      $set: {
        name: data.name,
        description: data.description,
        image: data.image,
        by: data.by,
        price: parseInt(data.price as string),
        stock: data.stock,
        sku: data.sku,
      },
    });
  });
};

export const removeProduct = async (id: string) => {
  await db.product.findOne(id).exec().then((prod: any) => {
    prod.remove();
  });
};

export const createSampleProduct = async () => {
  const productObj = [];
  const ulid = monotonicFactory();

  for (let i = 1; i < 21; i++) {
    productObj.push({
      id: ulid(),
      active: true,
      name: `Product ${i}`,
      description: `This is description for Product ${i}`,
      image: `product_${i}_image_path`,
      by: '',
      price: 10000 * i,
      stock: i < 3 ? i : 0,
      sku: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return await db.product.bulkInsert(productObj);
};

export const createSampleBundle = async (data: any) => {
  const ulid = monotonicFactory();
  const slicedData = data.slice(0, 2);
  const productArr: any = [];
  const productID: string[] = [];
  let available: boolean = true;
  // const productImage: string[] = [];
  // const productPrice: number[] = [];

  slicedData.forEach((data: any) => {
    available = data.stock !== 0;
    productID.push(data.id);
    productArr.push({
      id: data.id,
      name: data.name,
      image: data.image,
      price: data.price,
      stock: data.stock,
    });
  });

  // const available = productArr.filter((product: any) => product.stock === 0);

  return await db.bundle.insert({
    id: ulid(),
    active: available,
    name: 'Bundle 1',
    description: 'Bundle 1 description',
    product_id: productID,
    product: productArr,
    price: productArr.reduce((acc: any, curr: any) => acc + curr.price, 0),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
};

export const queryProduct = async () => {

};

export const mutateAddProduct = async ({ data }: any) => {
  try {
    const ulid = monotonicFactory();

    return await db.product.insert({
      id: ulid(),
      name: data.name,
      description: data.description,
      image: data.image,
      by: data.by,
      price: parseInt(data.price as string),
      stock: parseInt(data.stock as string),
      sku: data.sku,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};

export const mutateEditProduct = async ({ id, data }: any) => {
  try {
    const product = db.product.findOne({
      selector: {
        id: {
          $eq: id,
        },
      },
    });

    const productUpdate = await product.update({
      $set: {
        updated_at: new Date().toISOString(),
        ...data,
      },
    });

    // Update any bundle items related contain the product after updating product data.
    if (productUpdate) {
      const isActive = data.stock !== 0 ? true : false;

      const bundle = db.bundle.find({
        selector: {
          product: {
            $elemMatch: {
              id: id,
            },
          },
        },
      });

      /**
       * Bundle price are automatically summed from product of each price,
       * unless the user set fixed price, so there's no need to query the product.
       *
       * Fixed product price are always the same even though individual product
       * price are changed.
       */
      await bundle.update({
        $set: {
          active: isActive,
          updated_at: new Date().toISOString(),
        },
      });
    }

    return productUpdate;
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};

