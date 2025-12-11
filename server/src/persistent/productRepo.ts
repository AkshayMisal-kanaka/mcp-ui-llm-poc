// server/src/productRepo.ts
import { pgPool } from "./db";
import { PRODUCTS, Product } from "../products";

export async function upsertProduct(product: Product): Promise<void> {
  const client = await pgPool.connect();
  try {
    console.log('Adding product to db');
    await client.query(
      `
      INSERT INTO products (id, name, description, price, currency, image_url, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        currency = EXCLUDED.currency,
        image_url = EXCLUDED.image_url,
        tags = EXCLUDED.tags,
        updated_at = NOW()
      `,
      [
        product.id,
        product.name,
        product.description,
        product.price,
        product.currency,
        product.imageUrl,
        product.tags,
      ]
    );
  } finally {
    client.release();
  }
}

/**
 * Given a productId, find it in in-memory PRODUCTS and upsert.
 * Throws if not found.
 */
export async function ensureProductInDb(productId: string): Promise<void> {
  const product = PRODUCTS.find((p: Product) => p.id === productId);
  if (!product) {
    throw new Error(`Product not found in catalog: ${productId}`);
  }
  await upsertProduct(product);
}
