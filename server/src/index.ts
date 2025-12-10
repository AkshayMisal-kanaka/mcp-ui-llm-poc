
// server/src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { createUIResource } from '@mcp-ui/server';
// import { buildRemoteDomScript, generateRemoteDomScriptFromLlm } from './ollamaLLM/llm_local';
import {
  semanticSearchProducts,
  indexAllProducts
} from "./ollamaLLM/vectorstore_chroma_local";
import { generateRemoteDomScriptFromLlm, mockRemoteDomScript } from './openaiLLM/llm';

const app = express();
app.use(cors());
app.use(express.json());

const SearchBody = z.object({
  prompt: z.string().min(1)
});

app.get('/load/collections', async (req, res) => {
   try {
    await indexAllProducts();
    console.log("Chroma product index ready");
    res.json({
      'message': 'Chroma DB loaded successfully'
    });
  } catch (err) {
    console.error("Failed to index products into Chroma:", err);
    res.json({
      'error': 'Chroma DB loading failed.'
    });
  }
});

app.post('/search', async (req, res) => {
  try {
    const { prompt } = SearchBody.parse(req.body);
    console.log('prompt: ', prompt);

    // 1) vector search for relevant products
    const products = await semanticSearchProducts(prompt, 5);

    console.log('search products: ', products);

    // 2) ask LLM to generate Remote DOM JS ONLY
    const remoteDomScript = await mockRemoteDomScript({
      userPrompt: prompt,
      products
    });
  
    console.log('Remote dom script: ', remoteDomScript);

    // 3) Wrap in MCP-UI resource
    const uiResource = createUIResource({
      uri: `ui://product-search/${Date.now()}`,
      content: {
        type: 'remoteDom',
        script: remoteDomScript,
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

const PORT = process.env.PORT ?? 8082;
app.listen(PORT, () => {
  console.log(`MCP-UI server listening on http://localhost:${PORT}`);
});
