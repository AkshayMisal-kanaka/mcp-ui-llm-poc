import { type Product } from "./products";
import { getProductsFromOpenAI } from "./openaiLLM/llm";
import { upsertProduct } from "./persistent/productRepo";
export async function searchProductsWithVectorFallback(
  prompt: string,
  topK: number = 5
): Promise<Product[]> {
  
  // 1) Fallback to OpenAI, then store
  console.log("[SEARCH] Vector store empty or insufficient, calling OpenAI");
  const fromLLM = await getProductsFromOpenAI(prompt, topK);

  // Store in pg (make it async)
  const upsertAll = fromLLM.map((p) => { 
    return upsertProduct(p);
  });
  await Promise.all(upsertAll);
  
  return fromLLM;
}