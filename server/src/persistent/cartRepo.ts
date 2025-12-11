// server/src/cartRepo.ts
import { pgPool } from "./db";
import { ensureProductInDb } from "./productRepo";

const DEMO_USER_ID = "demo-user"; // replace with real auth later

export type CartRow = {
  id: number;
  user_id: string;
  product_id: string;
  from_prompt: string | null;
  qty: number;
  created_at: string;
  updated_at: string;
};

export type WishlistRow = {
  id: number;
  user_id: string;
  product_id: string;
  from_prompt: string | null;
  created_at: string;
};

export async function addToCart(params: {
  productId: string;
  fromPrompt?: string;
  userId?: string;
}): Promise<CartRow> {
  const { productId, fromPrompt, userId = DEMO_USER_ID } = params;

  // 1) Make sure product exists in products table
  // await ensureProductInDb(productId);

  const client = await pgPool.connect();
  try {
    const result = await client.query<CartRow>(
      `
      INSERT INTO cart_items (user_id, product_id, from_prompt, qty)
      VALUES ($1, $2, $3, 1)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET
        qty = cart_items.qty + 1,
        from_prompt = EXCLUDED.from_prompt,
        updated_at = NOW()
      RETURNING *
      `,
      [userId, productId, fromPrompt ?? null]
    );

    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function addToWishlist(params: {
  productId: string;
  fromPrompt?: string;
  userId?: string;
}): Promise<WishlistRow> {
  const { productId, fromPrompt, userId = DEMO_USER_ID } = params;

  // 1) Ensure product exists
  // await ensureProductInDb(productId);

  const client = await pgPool.connect();
  try {
    const result = await client.query<WishlistRow>(
      `
      INSERT INTO wishlist_items (user_id, product_id, from_prompt)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET
        from_prompt = EXCLUDED.from_prompt,
        created_at = NOW()
      RETURNING *
      `,
      [userId, productId, fromPrompt ?? null]
    );

    return result.rows[0];
  } finally {
    client.release();
  }
}


export async function removeFromCart(params: {
  productId: string;
  userId?: string;
}): Promise<void> {
  const { productId, userId = DEMO_USER_ID } = params;
  const client = await pgPool.connect();
  try {
    await client.query(
      `
      DELETE FROM cart_items
      WHERE user_id = $1 AND product_id = $2
      `,
      [userId, productId]
    );
  } finally {
    client.release();
  }
}

export async function removeFromWishlist(params: {
  productId: string;
  userId?: string;
}): Promise<void> {
  const { productId, userId = DEMO_USER_ID } = params;
  const client = await pgPool.connect();
  try {
    await client.query(
      `
      DELETE FROM wishlist_items
      WHERE user_id = $1 AND product_id = $2
      `,
      [userId, productId]
    );
  } finally {
    client.release();
  }
}

/**
 * Get cart with product details (for totals later)
 */
export async function getCart(
  userId: string = DEMO_USER_ID
): Promise<
  (CartRow & {
    product_name: string;
    product_price: number;
    product_currency: string;
    product_image_url: string | null;
  })[]
> {
  const client = await pgPool.connect();
  try {
    const result = await client.query(
      `
      SELECT
        c.*,
        p.name as product_name,
        p.price as product_price,
        p.currency as product_currency,
        p.image_url as product_image_url
      FROM cart_items c
      JOIN products p ON p.id = c.product_id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
      `,
      [userId]
    );

    return result.rows as any;
  } finally {
    client.release();
  }
}

export async function getWishlist(
  userId: string = DEMO_USER_ID
): Promise<
  (WishlistRow & {
    product_name: string;
    product_price: number;
    product_currency: string;
    product_image_url: string | null;
  })[]
> {
  const client = await pgPool.connect();
  try {
    const result = await client.query(
      `
      SELECT
        w.*,
        p.name as product_name,
        p.price as product_price,
        p.currency as product_currency,
        p.image_url as product_image_url
      FROM wishlist_items w
      JOIN products p ON p.id = w.product_id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
      `,
      [userId]
    );

    return result.rows as any;
  } finally {
    client.release();
  }
}
