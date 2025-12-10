// server/src/vectorStore.ts
import { PRODUCTS, Product } from '../products';

export type ProductVector = {
  product: Product;
  embedding: number[];
};

// VERY DUMB embedding + similarity just for PoC.
// Replace with real embeddings + vector DB.
function fakeEmbed(text: string): number[] {
  // map chars to numbers; absolutely not real
  const v = new Array(10).fill(0);
  for (let i = 0; i < text.length; i++) {
    v[i % 10] += text.charCodeAt(i);
  }
  return v;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

const VECTOR_INDEX: ProductVector[] = PRODUCTS.map(product => ({
  product,
  embedding: fakeEmbed(
    `${product.name} ${product.description} ${product.tags.join(' ')}`
  )
}));

export async function semanticSearchProducts(
  query: string,
  topK = 5
): Promise<Product[]> {
  const qEmbedding = fakeEmbed(query);

  const scored = VECTOR_INDEX.map(row => ({
    product: row.product,
    score: cosineSimilarity(qEmbedding, row.embedding)
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.product);
}
