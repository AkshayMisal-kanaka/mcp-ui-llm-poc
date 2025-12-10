// server/src/llm.ts
import OpenAI from 'openai';
import type { Product } from '../products';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateRemoteDomScriptFromLlm(opts: {
  userPrompt: string;
  products: Product[];
}): Promise<string> {
  const { userPrompt, products } = opts;

  // You pass product data as JSON and force the model
  // to output ONLY a JS Remote DOM script.
  const productJson = JSON.stringify(products, null, 2);
  const promptJson = JSON.stringify(userPrompt); // adds quotes safely

  const prelude = `
    const products = ${productJson};
    const originalPrompt = ${promptJson};
  `;

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
    model: 'gpt-5-mini',
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

  // 3. Final script = our prelude + the model's body
  const finalScript = `${prelude}\n\n${bodyCode}\n`;

  return finalScript;
}


export async function mockRemoteDomScript(opts: {
  userPrompt: string;
  products: Product[];
}): Promise<string> {
  const { userPrompt, products } = opts;

  // You pass product data as JSON and force the model
  // to output ONLY a JS Remote DOM script.
  const productJson = JSON.stringify(products, null, 2);
  const promptJson = JSON.stringify(userPrompt); // adds quotes safely

  const prelude = `
    const products = ${productJson};
    const originalPrompt = ${promptJson};
  `;

  const mockScript = ` root.innerHTML = "";

const header = document.createElement("shop-text");
header.setAttribute("kind", "title");
header.setAttribute(
  "content",
  typeof originalPrompt === "string" && originalPrompt.length
    ? "Result for " + originalPrompt
    : "Search results"
);
root.appendChild(header);

const sub = document.createElement("shop-text");
sub.setAttribute("kind", "subtitle");
sub.setAttribute(
  "content",
  Array.isArray(products)
    ? products.length + " found"
    : "No products"
);
root.appendChild(sub);

const grid = document.createElement("shop-grid");
grid.setAttribute(
  "style",
  "gap:16px; margin-top:12px; display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));"
);
root.appendChild(grid);

function toStr(v) {
  return v == null ? "" : String(v);
}
function boolToTF(v) {
  if (v === true || v === "true") return "true";
  return "false";
}

if (Array.isArray(products)) {
  products.forEach((product) => {
    const card = document.createElement("shop-product-card");

    card.setAttribute("title", toStr(product.title ?? product.name ?? ""));
    card.setAttribute(
      "description",
      toStr(product.description ?? product.desc ?? "")
    );
    // price and currency as strings
    card.setAttribute("price", toStr(product.price ?? ""));
    card.setAttribute("currency", toStr(product.currency ?? ""));
    card.setAttribute("imageUrl", toStr(product.imageUrl ?? product.image ?? ""));
    card.setAttribute("badge", toStr(product.badge ?? ""));
    card.setAttribute("inCart", boolToTF(product.inCart));
    card.setAttribute("inWishlist", boolToTF(product.inWishlist));

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

    grid.appendChild(card);
  });
} else {
  const noResult = document.createElement("shop-text");
  noResult.setAttribute("kind", "muted");
  noResult.setAttribute("content", "No products available.");
  root.appendChild(noResult);
}`;
// 3. Final script = our prelude + the model's body
  const finalScript = `${prelude}\n\n${mockScript}\n`;
return finalScript;
}
