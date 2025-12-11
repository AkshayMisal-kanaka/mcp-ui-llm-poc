// server/src/llm.ts
import OpenAI from 'openai';
import type { ExtendedProduct, Product } from '../products';
import { CartRow, WishlistRow } from '../persistent/cartRepo';
import crypto from "crypto";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const openaiModel = process.env.OPEN_AI_MODEL || "gpt-5-mini";

export async function getProductsFromOpenAI(
  userPrompt: string,
  limit: number = 5
): Promise<Product[]> {
  const systemPrompt = `
You generate realistic product data as JSON.

Return ONLY a JSON object with this exact shape:

{
  "products": [
    {
      "id": "string (unique short stable id)",
      "name": "string",
      "description": "string",
      "price": number,
      "currency": "INR",
      "imageUrl": "https://... realistic product image URL",
      "tags": [
        "category:<category>",
        "segment:<segment>",
        "brand:<brand>",
        "use:<use-case>",
        ...
      ]
    },
    ...
  ]
}

Rules:
- prices must be realistic in INR for the Indian market.
- products must match the user intent (budget vs premium, gaming vs student, etc.).
- "id" must be unique within the array.
- Return exactly ${limit} items if possible.
- DO NOT include any extra keys outside "products".
- DO NOT include explanations or text outside JSON.
`;

  const completion = await openai.chat.completions.create({
    model: openaiModel,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `User search: ${userPrompt}`,
      },
    ],
  });

  const raw = completion.choices[0].message.content;
  if (!raw) {
    throw new Error("OpenAI returned empty content for products");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse product JSON:", raw);
    throw err;
  }

  const products: Product[] = (parsed.products ?? [])
    .map((p: any, idx: number) => {
      const llmId = p.id ? String(p.id) : `llm-${idx}`;
      const uniqueId = makeProductId(userPrompt, llmId, idx);

      return {
        id: uniqueId,
        name: String(p.name ?? "Unnamed product"),
        description: String(p.description ?? ""),
        price: Number(p.price ?? 0),
        currency: String(p.currency ?? "INR"),
        imageUrl: String(p.imageUrl ?? ""),
        tags: Array.isArray(p.tags) ? p.tags.map((t: any) => String(t)) : [],
      }
  });

  return products.slice(0, limit);
}

export async function generateRemoteDomScriptFromLlm(opts: {
  userPrompt: string;
  products: Product[];
}): Promise<string> {
  const { userPrompt, products } = opts;

  

  const system = `
You are generating JavaScript code for a Remote DOM UI.
The code will run inside a sandboxed iframe with a global "root" element available.

REMOTE DOM + REACT LIBRARY
--------------------------
The host React app uses @mcp-ui/client with a custom component library.
You MUST build the UI using ONLY these custom remote elements:

1) <shop-text>
   - Attributes:
     - content: string
     - kind: "title" | "subtitle" | "muted"

2) <shop-product-card>
   - Attributes (all values must be strings):
     - title: string
     - description: string
     - price: string
     - currency: string
     - imageUrl: string (optional)
     - badge: string (optional)
     - inCart: "true" | "false"
     - inWishlist: "true" | "false"
   - Events fired by the host React component:
     - "addToCart"
     - "addToWishlist"

3) <shop-grid>
   - Container used for layout.
   - It is rendered as a CSS grid in React.
   - You can still set inline styles on it if needed (e.g., gap, marginTop).

DO NOT create native HTML elements like <button> or <div> for the main layout.
Use <shop-grid> as the container and <shop-product-card> for items.

EVENT HANDLING REQUIREMENTS
---------------------------
For EACH created <shop-product-card>, you MUST attach listeners for:

- "addToCart"
- "addToWishlist"

They must use this pattern:

   card.addEventListener("addToCart", () => {
     window.parent.postMessage(
       {
         type: "tool",
         payload: {
           toolName: "addToCart",
           params: {
             productId: product.id,
             fromPrompt: originalPrompt
           }
         }
       },
       "*"
     );
   });

   card.addEventListener("addToWishlist", () => {
     window.parent.postMessage(
       {
         type: "tool",
         payload: {
           toolName: "addToWishlist",
           params: {
             productId: product.id,
             fromPrompt: originalPrompt
           }
         }
       },
       "*"
     );
   });

Rules:
- OUTPUT ONLY a valid JavaScript program (no backticks, no markdown, no explanation).
- Do not define HTML. Use "root" and DOM APIs (document.createElement, etc.).
- DO NOT redefine "products" or "originalPrompt".
`;

  const user = `
    User search prompt: "${userPrompt}"
    You already have products and originalPrompt variables defined in JS.
    Just create the DOM structure and event listeners as described.
`;

  // You can adapt to Responses API; using chat here
  const completion = await openai.chat.completions.create({
    model: 'openaiModel',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  const code = completion.choices[0]?.message?.content ?? '';
  console.log('code: ', code);
  let content  = code
    .replace(/```[a-zA-Z]*\n?/g, "")
    .replace(/```/g, "")
    .trim();

  // 2. If it accidentally appends explanation ("Note that..." etc.), drop it.
  //    This is a simple heuristic but works well enough for PoC.
  const cutExplanations = content.split(/(?:\n|^)Note that/gi)[0];

  const bodyCode = cutExplanations.trim();

  return bodyCode;
}

export async function generateCartPageRemoteDomFromLlm(params: {
  cart: (CartRow & {
    product_name: string;
    product_price: number;
    product_currency: string;
    product_image_url: string | null;
  })[];
  wishlist: (WishlistRow & {
    product_name: string;
    product_price: number;
    product_currency: string;
    product_image_url: string | null;
  })[];
}): Promise<string> {
 
  const systemPrompt = `
  You are generating a REMOTE DOM SCRIPT (JavaScript string) for an MCP UI client.

CRITICAL RULES:
- You must return ONLY executable JavaScript code, no JSON, no backticks.
- The script runs in a browser with a global root element as the container.
- You MUST NOT create or use native HTML elements such as:
  - <div>, <span>, <button>, <img>, <p>, <h1>... etc.

ALLOWED CUSTOM ELEMENTS (ONLY):
1) <shop-card>
   - Attributes:
     - variant: "default" | "outline" | "soft"
   - Use this as the main layout container for sections and individual items.

2) <shop-text>
   - Attributes:
     - content: string
     - kind: "title" | "subtitle" | "muted"
   - Use for all headings and normal text labels.

3) <shop-small-text>
   - Attributes:
     - content: string
     - muted: "true" | "false"
   - Use for secondary / helper text, totals, and small labels.

4) <shop-badge>
   - Attributes:
     - text: string
     - tone: "info" | "success" | "warning" | "danger" | "neutral"
   - May also be used as a clickable chip (e.g., "Remove") by attaching event listeners.

5) <shop-img>
   - Attributes:
     - src: string (image URL)
     - alt: string
     - rounded: "true" | "false"

6) <shop-grid>
   - Container used for layout.
   - It is rendered as a CSS grid in React.
   - You can still set inline styles on it if needed (e.g., gap, marginTop).

You may also set style properties directly on these custom elements in JavaScript
(e.g., card.style.display = "flex"), but you must not create extra native <div> containers.

DATA:
- You will receive 2 JavaScript arrays in the script you generate:
  - cartJson: cart rows, each with:
    {
      product_id,
      product_name,
      product_price,
      product_currency,
      product_image_url,
      qty,
      from_prompt
    }
  - wishlistJson: wishlist rows, each with:
    {
      product_id,
      product_name,
      product_price,
      product_currency,
      product_image_url,
      from_prompt
    }

LAYOUT REQUIREMENTS:
- Clear the root first: root.innerHTML = "".
- Overall layout:
  1) A header "Your Cart" using <shop-text kind="title">.
  2) A main <shop-card> as a summary card:
     - Show total price of cart (sum of product_price * qty).
     - Show number of items in cart.
  3) For the "Cart items" section:
    - Create a <shop-grid> with attribute columns="5".
    - For each cart item, create a <shop-card variant="outline"> representing a single item tile and append it to that <shop-grid>.
    - Include:
         - Product image using <shop-img> with src = product_image_url.
         - Product name using <shop-text>.
         - A small line with unit price and qty using <shop-small-text>.
         - A small line for per-item total (price * qty) using <shop-small-text>.
         - A <shop-badge tone="danger"> with text like "Remove" that acts as the remove control.
    - This ensures up to 5 tiles per row on wide screens.
   4) Apply the same pattern for the "Wishlist" section.   
  

INTERACTIONS:
- Removing cart items:
  - For the "Remove" badge in the cart section:
    - Attach a click listener in JavaScript:
      badge.addEventListener("click", () => {
        window.parent.postMessage(
          {
            type: "tool",
            payload: {
              toolName: "removeFromCart",
              params: {
                productId: item.product_id
              }
            }
          },
          "*"
        );
      });
- Removing wishlist items:
  - For the "Remove" badge in the wishlist section:
    - Attach a similar click listener, but with toolName "removeFromWishlist".

IMPORTANT:
- Do NOT pass complex objects like the event itself into postMessage.
  Only send simple, cloneable objects with primitives (strings, numbers).
- Do NOT create or reference <div>, <span>, <button>, <img>.
- You can only use <shop-card>, <shop-text>, <shop-small-text>, <shop-badge>, and <shop-img>.
    `;

  const userPrompt = `
  You already have cartJson and wishlistJson variables defined in JS.
  do not redefine cartJson and wishlistJson
  Just create the DOM structure and event listeners as described.`;

  const completion = await openai.chat.completions.create({
    model: 'openaiModel',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });

      const code = completion.choices[0]?.message?.content ?? '';
  
      console.log('code: ', code);
      let content  = code
        .replace(/```[a-zA-Z]*\n?/g, "")
        .replace(/```/g, "")
        .trim();

      // 2. If it accidentally appends explanation ("Note that..." etc.), drop it.
      //    This is a simple heuristic but works well enough for PoC.
      const cutExplanations = content.split(/(?:\n|^)Note that/gi)[0];

      const bodyCode = cutExplanations.trim();

  return bodyCode;
}

export function prepareFinalScript(
  userPrompt: string,
  products: Product[],
  script: string,
): string {

  const extendedProduct: ExtendedProduct[] = products.map((item) => {
    return {
      ...item, // Spread existing properties
      title: item.name, // Add the new field
    };
  });
 // You pass product data as JSON and force the model
  // to output ONLY a JS Remote DOM script.
  const productJson = JSON.stringify(extendedProduct, null, 2);
  const promptJson = JSON.stringify(userPrompt); // adds quotes safely

  const prelude = `
    const products = ${productJson};
    const originalPrompt = ${promptJson};
  `;

  const finalScript = `${prelude}\n\n${script}\n`;
  return finalScript;
}

export function prepareFinalCartScript(
  params: {
  cart: (CartRow & {
    product_name: string;
    product_price: number;
    product_currency: string;
    product_image_url: string | null;
  })[];
  wishlist: (WishlistRow & {
    product_name: string;
    product_price: number;
    product_currency: string;
    product_image_url: string | null;
  })[];
  script: string
}): string {

  const { cart, wishlist, script } = params;
  const cartJson = JSON.stringify(cart, null, 2);
  const wishlistJson = JSON.stringify(wishlist, null, 2);

  const prelude = `
    const cartJson = ${cartJson};
    const wishlistJson = ${wishlistJson};
  `;

  const finalScript = `${prelude}\n\n${script}\n`;
  return finalScript;
}

function makeProductId(userPrompt: string, rawId: string, idx: number): string {
  // hash(prompt + rawId + idx) so it’s unique even across different prompts
  const hash = crypto
    .createHash("sha256")
    .update(userPrompt + "|" + rawId + "|" + String(idx))
    .digest("hex")
    .slice(0, 16); // shorten for readability

  return `prod_${hash}`;
}