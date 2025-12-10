// server/src/vectorStore_chroma.ts
import "dotenv/config";
import { ChromaClient } from "chromadb";
import OpenAI from "openai";
import type { Product } from "../products";
import { PRODUCTS } from "../products";

// --- Setup ---

const client = new ChromaClient({
  path: "./chroma_db" // persistent local store
});

// OpenAI for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const COLLECTION_NAME = "products";
const EMBEDDING_MODEL = "text-embedding-3-small"; // 1536 dims

// Convert a product into a text description for embedding
function productToText(p: Product): string {
  return [
    p.name,
    p.description,
    `Price: ${p.price} ${p.currency}`,
    `Tags: ${p.tags.join(", ")}`
  ].join("\n");
}

// Generate embeddings using OpenAI
async function embedTexts(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts
  });

  return response.data.map(x => x.embedding as number[]);
}

// Get or create collection
async function getCollection() {
  return client.getOrCreateCollection({
    name: COLLECTION_NAME
  });
}

// ------------------ PUBLIC API ------------------

/**
 * Index all PRODUCTS into Chroma (call at startup)
 */
export async function indexAllProducts(): Promise<void> {
  const collection = await getCollection();

  // Optional: wipe old data in dev mode
   try {
    await client.deleteCollection({ name: COLLECTION_NAME });
    console.log("Existing Chroma collection deleted");
  } catch {
    console.log("Collection did not exist. Creating new one...");
  }

  const documents = PRODUCTS.map(productToText);
  const embeddings = await embedTexts(documents);
  const ids = PRODUCTS.map(p => p.id);
  const metadatas = PRODUCTS.map(p => ({
    productId: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    currency: p.currency,
    tags: p.tags.join(",")
  }));

  await collection.add({
    ids,
    embeddings,
    documents,
    metadatas
  });

  console.log(`Indexed ${ids.length} products into Chroma`);
}

/**
 * Semantic search using vector similarity from Chroma
 */
export async function semanticSearchProducts(
  query: string,
  topK = 5
): Promise<Product[]> {
  const collection = await getCollection();

  const [queryEmbedding] = await embedTexts([query]);

  const results = await collection.query({
    nResults: topK,
    queryEmbeddings: [queryEmbedding]
  });

  const metadatas = results.metadatas?.[0] || [];

  return metadatas.map((m: any) => ({
    id: m.productId,
    name: m.name,
    description: m.description,
    price: Number(m.price),
    currency: m.currency,
    tags: typeof m.tags === "string"
      ? m.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : []
  }));
}
