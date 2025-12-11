// // server/src/llm_local.ts
// import type { Product } from "../products";

// const OLLAMA_CHAT_URL = "http://localhost:11434/api/chat";
// const LLM_MODEL = "qwen2.5:3b"; // or "llama3.2:3b", etc.

// /**
//  * Call local Ollama chat to generate Remote DOM JS ONLY.
//  */
// export async function generateRemoteDomScriptFromLlm(opts: {
//   userPrompt: string;
//   products: Product[];
// }): Promise<string> {
//   const { userPrompt, products } = opts;
//   const productJson = JSON.stringify(products, null, 2);
//   const promptJson = JSON.stringify(userPrompt); // safe string literal
// //   const systemPrompt = `
// // You generate JavaScript code for a Remote DOM UI.

// // The code will run inside a sandboxed iframe with a global "root" element available.

// // Requirements:
// // - Define: const products = ... (from JSON I give you).
// // - Render a product list with name, price, and description.
// // - For every product, render two buttons:
// //   - "Add to Cart"
// //   - "Add to Wishlist"
// // - When a button is clicked, call:

// //   window.parent.postMessage(
// //     {
// //       type: "tool",
// //       payload: {
// //         toolName: "addToCart" OR "addToWishlist",
// //         params: {
// //           productId: <string>,
// //           fromPrompt: <original user prompt>
// //         }
// //       }
// //     },
// //     "*"
// //   );

// // Rules:
// // - OUTPUT ONLY pure JavaScript code (no markdown, no explanation).
// // - Use "root" and DOM APIs (document.createElement, etc.).
// // - Do NOT wrap code in backticks.
// // `;

// // We will prepend this ourselves to the final script
//   const prelude = `
// const products = ${productJson};
// const originalPrompt = ${promptJson};
// `;

//   const systemPrompt = `
// You generate ONLY JavaScript code that will be appended AFTER:

//   const products = [...];
//   const originalPrompt = "...";

// These variables ALREADY exist. DO NOT redefine them.

// The code runs inside a sandboxed iframe with a global "root" element.
// The host React app provides custom Remote DOM elements:

// 1) <shop-text>
//    - Attributes:
//      - content: string
//      - kind: "title" | "subtitle" | "muted"

// 2) <shop-product-card>
//    - Attributes:
//      - title: string
//      - description: string
//      - price: string
//      - currency: string
//      - imageUrl: string (optional)
//      - badge: string (optional)
//      - inCart: "true" | "false"
//      - inWishlist: "true" | "false"
//    - Events:
//      - "addToCart"
//      - "addToWishlist"

// REQUIREMENTS
// ------------
// - Use <shop-text> and <shop-product-card> only (no native <button> elements).
// - For layout:
//   - Create a header <shop-text kind="title"> whose content includes originalPrompt.
//   - Optionally create a muted subtitle <shop-text kind="muted"> below it.
//   - Create a <div> container configured as a CSS grid:
//       display: "grid"
//       gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"
//       gap: "16px"
//       marginTop: "12px"
// - For EACH product in products:
//   - Create a <shop-product-card>.
//   - Set attributes using setAttribute only, with STRING values:
//       title      = product.name
//       description = product.description || ""
//       price      = String(product.price)
//       currency   = product.currency || "₹"
//       badge      = "Student Pick" if product.tags includes "student", else ""
//       inCart     = "false"
//       inWishlist = "false"
// - Attach event listeners on each card:

//     card.addEventListener("addToCart", () => {
//       window.parent.postMessage(
//         {
//           type: "tool",
//           payload: {
//             toolName: "addToCart",
//             params: {
//               productId: product.id,
//               fromPrompt: originalPrompt
//             }
//           }
//         },
//         "*"
//       );
//     });

//     card.addEventListener("addToWishlist", () => {
//       window.parent.postMessage(
//         {
//           type: "tool",
//           payload: {
//             toolName: "addToWishlist",
//             params: {
//               productId: product.id,
//               fromPrompt: originalPrompt
//             }
//           }
//         },
//         "*"
//       );
//     });

// - Finally, append the grid container to root.

// STRICT OUTPUT RULES
// -------------------
// - Output ONLY raw JavaScript statements that assume products and originalPrompt already exist.
// - Do NOT redefine products or originalPrompt.
// - Do NOT output any explanation, comments, or natural language.
// - Do NOT wrap the code in backticks or markdown fences.
// - Do NOT create raw <button> elements.
// - Do NOT use console.log or comments.

// You must follow these DOM creation patterns exactly:

// 1) Creating a <shop-text> header:

//    const header = document.createElement("shop-text");
//    header.setAttribute("kind", "title");
//    header.setAttribute("content", "Results for: " + originalPrompt);
//    root.appendChild(header);

// 2) Creating a muted subtitle:

//    const subtitle = document.createElement("shop-text");
//    subtitle.setAttribute("kind", "muted");
//    subtitle.setAttribute("content", "Student Picks");
//    root.appendChild(subtitle);

// 3) Creating the grid container:

//    const gridContainer = document.createElement("shop-grid");
//    gridContainer.style.display = "grid";
//    gridContainer.style.gridTemplateColumns = "repeat(auto-fit, minmax(260px, 1fr))";
//    gridContainer.style.gap = "16px";
//    gridContainer.style.marginTop = "12px";
//    root.appendChild(gridContainer);

// 4) For each product:

//    const card = document.createElement("shop-product-card");
//    card.setAttribute("title", product.name);
//    card.setAttribute("description", product.description || "");
//    card.setAttribute("price", String(product.price));
//    card.setAttribute("currency", product.currency || "₹");
//    card.setAttribute("badge", product.tags && product.tags.includes("student") ? "Student Pick" : "");
//    card.setAttribute("inCart", "false");
//    card.setAttribute("inWishlist", "false");

//    card.addEventListener("addToCart", () => {
//      window.parent.postMessage(
//        {
//          type: "tool",
//          payload: {
//            toolName: "addToCart",
//            params: {
//              productId: product.id,
//              fromPrompt: originalPrompt
//            }
//          }
//        },
//        "*"
//      );
//    });

//    card.addEventListener("addToWishlist", () => {
//      window.parent.postMessage(
//        {
//          type: "tool",
//          payload: {
//            toolName: "addToWishlist",
//            params: {
//              productId: product.id,
//              fromPrompt: originalPrompt
//            }
//          }
//        },
//        "*"
//      );
//    });

//    gridContainer.appendChild(card);

// STRICT PROHIBITED PATTERNS
// --------------------------
// - Do NOT chain createElement, setAttribute, innerHTML, and appendChild
//   into a single expression. For example, NEVER do:

//     root.appendChild(
//       document.createElement("shop-text")
//         .setAttribute("kind", "title")
//         .innerHTML = originalPrompt
//     );

// - Do NOT use innerHTML or textContent on <shop-text>; ALWAYS use
//   setAttribute("content", ...).

// - Do NOT create native <button> elements. Only use <shop-product-card>
//   and its "addToCart" and "addToWishlist" events.
// `;

//   const userContent = `
// User search prompt: ${userPrompt}
// You already have products and originalPrompt variables defined in JS.
// Just create the DOM structure and event listeners as described.
// `;

//   const res = await fetch(OLLAMA_CHAT_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       model: LLM_MODEL,
//       stream: false,
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userContent }
//       ]
//     })
//   });

//   if (!res.ok) {
//     const body = await res.text();
//     throw new Error(
//       `Ollama chat error: ${res.status} ${res.statusText} - ${body}`
//     );
//   }

//   const json: any = await res.json();

//   // Ollama's /api/chat returns { message: { content: string }, ... }
//   let content: string = json.message?.content ?? "";

//   // Ideally you might want to strip ``` fences if the model adds them anyway
//   content  = content
//     .replace(/```[a-zA-Z]*\n?/g, "")
//     .replace(/```/g, "")
//     .trim();

//   // 2. If it accidentally appends explanation ("Note that..." etc.), drop it.
//   //    This is a simple heuristic but works well enough for PoC.
//   const cutExplanations = content.split(/(?:\n|^)Note that/gi)[0];

//   const bodyCode = cutExplanations.trim();

//   // 3. Final script = our prelude + the model's body
//   const finalScript = `${prelude}\n\n${bodyCode}\n`;

//   return finalScript;
// }

// export async function buildRemoteDomScript(opts:{
//   products: Product[],
//   userPrompt: string
// }): Promise<string> {
//   const { userPrompt, products } = opts;
//   const productJson = JSON.stringify(products, null, 2);
//   const promptJson = JSON.stringify(userPrompt); // adds quotes safely

//   return `
// const products = ${productJson};
// const originalPrompt = ${promptJson};

// const header = document.createElement("shop-text");
// header.setAttribute("kind", "title");
// header.setAttribute("content", "Results for: " + originalPrompt);
// root.appendChild(header);

// if (products.some(p => Array.isArray(p.tags) && p.tags.includes("student"))) {
//   const subtitle = document.createElement("shop-text");
//   subtitle.setAttribute("kind", "muted");
//   subtitle.setAttribute("content", "Student Picks");
//   root.appendChild(subtitle);
// }

// const gridContainer = document.createElement("shop-grid");

// products.forEach(product => {
//   const card = document.createElement("shop-product-card");
//   card.setAttribute("title", product.name);
//   card.setAttribute("description", product.description || "");
//   card.setAttribute("price", String(product.price));
//   card.setAttribute("currency", product.currency || "₹");
//   card.setAttribute(
//     "badge",
//     product.tags && product.tags.includes("student") ? "Student Pick" : ""
//   );
//   card.setAttribute("inCart", "false");
//   card.setAttribute("inWishlist", "false");

//   card.addEventListener("addToCart", () => {
//     window.parent.postMessage(
//       {
//         type: "tool",
//         payload: {
//           toolName: "addToCart",
//           params: {
//             productId: product.id,
//             fromPrompt: originalPrompt
//           }
//         }
//       },
//       "*"
//     );
//   });

//   card.addEventListener("addToWishlist", () => {
//     window.parent.postMessage(
//       {
//         type: "tool",
//         payload: {
//           toolName: "addToWishlist",
//           params: {
//             productId: product.id,
//             fromPrompt: originalPrompt
//           }
//         }
//       },
//       "*"
//     );
//   });

//   gridContainer.appendChild(card);
// });

// root.appendChild(gridContainer);
// `.trim();
// }
