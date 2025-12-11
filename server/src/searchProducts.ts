import { PRODUCTS, type Product } from "./products";
import {
  semanticSearchProducts,
  upsertProductsToVectorStore,
} from "./openaiLLM/vectorstore_chroma";
import { getProductsFromOpenAI } from "./openaiLLM/llm";
import { upsertProduct } from "./persistent/productRepo";
export async function searchProductsWithVectorFallback(
  prompt: string,
  topK: number = 5
): Promise<Product[]> {
  // 1) Try vector store
  // const fromVector = await semanticSearchProducts(prompt, topK);

  // if (fromVector.length >= topK) {
  //   console.log("[SEARCH] Using vector store results");
  //   return fromVector;
  // }

  // 2) Fallback to OpenAI, then store
  console.log("[SEARCH] Vector store empty or insufficient, calling OpenAI");
  const fromLLM = await getProductsFromOpenAI(prompt, topK);

  // store them so next time vector has something
  // await upsertProductsToVectorStore(fromLLM);

  // Store in pg (make it async)
  const upsertAll = fromLLM.map((p) => { 
    // PRODUCTS.push(p);
    return upsertProduct(p);
  });
  await Promise.all(upsertAll);
  console.log('In memory products: ', PRODUCTS.length);
  return fromLLM;
}