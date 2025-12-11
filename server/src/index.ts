
// server/src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { createUIResource } from '@mcp-ui/server';
import { generateCartPageRemoteDomFromLlm, generateRemoteDomScriptFromLlm, prepareFinalCartScript, prepareFinalScript } from './openaiLLM/llm';
import {getCachedRemoteDomScript, saveRemoteDomScript} from './persistent/remoteDomCache';
import { addToCart, addToWishlist, getCart, getWishlist, removeFromCart, removeFromWishlist } from './persistent/cartRepo';
import { Product } from './products';
import { searchProductsWithVectorFallback } from './searchProducts';

const app = express();
app.use(cors());
app.use(express.json());

const SearchBody = z.object({
  prompt: z.string().min(1)
});

const openaiModel = process.env.OPEN_AI_MODEL || "gpt-5-mini";

app.post('/search', async (req, res) => {
  try {
    const { prompt } = SearchBody.parse(req.body);
    console.log('prompt: ', prompt);

    // 1) Ask OpenAI for realistic products (no vector store)
    const products: Product[] = await searchProductsWithVectorFallback(prompt, 5);

    console.log('search products: ', products.length);

    const CACHE_KEY = "searchProducts"; 

    // Step 2: Try to load cached remote DOM script
    let remoteDomScript = await getCachedRemoteDomScript(CACHE_KEY);

    if (!remoteDomScript) {
      console.log("Remote dom script is not available in database, asking LLM to prepare it");

       // Step 3: ask LLM to generate Remote DOM JS ONLY
        remoteDomScript = await generateRemoteDomScriptFromLlm({
          userPrompt: prompt,
          products
        });

        // Step 4: Store script in DB
        await saveRemoteDomScript({
          cache_key: CACHE_KEY,
          script: remoteDomScript,
          model: openaiModel,
        });
    }

     // Step 5: Prepare script with product searched
    const script = prepareFinalScript(prompt, products, remoteDomScript);

    // Step 6: Wrap in MCP-UI resource
    const uiResource = createUIResource({
      uri: `ui://product-search/${Date.now()}`,
      content: {
        type: 'remoteDom',
        script: script,
        framework: 'react'
      },
      encoding: 'text'
    });

    res.json({
      ui: uiResource
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message ?? 'Bad request' });
  }
});


// Add to cart
app.post("/cart", async (req, res) => {
  try {
    const { productId, fromPrompt } = req.body ?? {};
    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    // Add product to the cart
    const row = await addToCart({ productId, fromPrompt });

    // Get the full cart with product
    const cart = await getCart(); // latest view

    res.json({
      status: "ok",
      added: row,
      cart,
    });
  } catch (err) {
    console.error("Failed to add to cart", err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// Add to wishlist
app.post("/wishlist", async (req, res) => {
  try {
    const { productId, fromPrompt } = req.body ?? {};
    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    const row = await addToWishlist({ productId, fromPrompt });
    const wishlist = await getWishlist(); // latest view

    res.json({
      status: "ok",
      added: row,
      wishlist,
    });
  } catch (err) {
    console.error("Failed to add to wishlist", err);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// (optional) GET endpoints if you want to load on page load
app.get("/cart", async (_req, res) => {
  try {
    const cart = await getCart();
    res.json({ cart });
  } catch (err) {
    console.error("Failed to fetch cart", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

app.get("/wishlist", async (_req, res) => {
  try {
    const wishlist = await getWishlist();
    res.json({ wishlist });
  } catch (err) {
    console.error("Failed to fetch wishlist", err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

app.get("/cart-ui", async (_req, res) => {
  try {
    const [cart, wishlist] = await Promise.all([getCart(), getWishlist()]);

    const CACHE_KEY = "cartPage";

    let remoteDomScript = await getCachedRemoteDomScript(CACHE_KEY);

    if (!remoteDomScript) {
      console.log("Generating dom from LLM, since it is not available in db.");
      remoteDomScript = await generateCartPageRemoteDomFromLlm({
        cart,
        wishlist,
      });

      console.log("saving the generated dom script in db...");
      await saveRemoteDomScript({
        cache_key: CACHE_KEY,
        script: remoteDomScript,
        model: "gpt-5-mini",
      });
    } else {
      console.log("[CACHE HIT] cartPage");
    }

    const script = prepareFinalCartScript({cart, wishlist, script: remoteDomScript});
    console.log('Remote dom script: ', script);

    const uiResource = createUIResource({
      uri: `ui://cart/${Date.now()}`,
      content: {
        type: 'remoteDom',
        script: script,
        framework: 'react'
      },
      encoding: 'text'
    });

    res.json({ ui: uiResource });
  } catch (err) {
    console.error("Failed to build cart UI:", err);
    res.status(500).json({ error: "Failed to build cart UI" });
  }
});

// Remove from cart
app.delete("/cart/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    await removeFromCart({ productId });
    const cart = await getCart();
    res.json({ status: "ok", cart });
  } catch (err) {
    console.error("Failed to remove from cart", err);
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// Remove from wishlist
app.delete("/wishlist/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    await removeFromWishlist({ productId });
    const wishlist = await getWishlist();
    res.json({ status: "ok", wishlist });
  } catch (err) {
    console.error("Failed to remove from wishlist", err);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

const PORT = process.env.PORT ?? 8082;
app.listen(PORT, () => {
  console.log(`MCP-UI server listening on http://localhost:${PORT}`);
});
