// client/src/api.ts
export type MCPUIResource = {
  type: 'resource';
  resource: {
    uri: string;
    mimeType: string;
    text?: string;
    blob?: string;
    _meta?: Record<string, unknown>;
  };
};

export async function searchProducts(prompt: string): Promise<{
  ui: MCPUIResource;
  products: any[];
}> {
  const res = await fetch('http://localhost:8082/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!res.ok) {
    throw new Error(`Search failed: ${res.statusText}`);
  }

  return res.json();
}

// client/src/api.ts
export async function addProductToCart(params: {
  productId: string;
  fromPrompt?: string;
}) {
  const res = await fetch("http://localhost:8082/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Failed to add to cart: ${res.statusText}`);
  }

  return res.json() as Promise<{
    status: string;
    added: { product_id: string; from_prompt: string | null };
    cart: { product_id: string; from_prompt: string | null }[];
  }>;
}

export async function addProductToWishlist(params: {
  productId: string;
  fromPrompt?: string;
}) {
  const res = await fetch("http://localhost:8082/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Failed to add to wishlist: ${res.statusText}`);
  }

  return res.json() as Promise<{
    status: string;
    added: { product_id: string; from_prompt: string | null };
    wishlist: { product_id: string; from_prompt: string | null }[];
  }>;
}

export async function fetchCartUI() {
  const res = await fetch("http://localhost:8082/cart-ui");
  if (!res.ok) {
    throw new Error("Failed to load cart UI");
  }
  return res.json() as Promise<{
    ui: any;
    cart: any[];
    wishlist: any[];
  }>;
}

export async function removeCartItem(productId: string) {
  const res = await fetch(`http://localhost:8082/cart/${productId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to remove from cart");
  }
  return res.json();
}

export async function removeWishlistItem(productId: string) {
  const res = await fetch(`http://localhost:8082/wishlist/${productId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to remove from wishlist");
  }
  return res.json();
}
