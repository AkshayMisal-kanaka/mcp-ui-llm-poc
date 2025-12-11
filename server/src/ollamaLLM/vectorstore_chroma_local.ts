// // server/src/vectorStore_chroma_local.ts
// import { ChromaClient, type Metadata } from "chromadb";
// import type { Product } from "../products";
// import { PRODUCTS } from "../products";

// const client = new ChromaClient({
//   host: "localhost",
//   port: 8000,
//   ssl: false
// });

// const COLLECTION_NAME = "products";

// const OLLAMA_EMBED_URL = "http://localhost:11434/api/embed";
// const EMBEDDING_MODEL = "nomic-embed-text";

// // Convert product to text
// function productToText(p: Product): string {
//   return `${p.name}\n${p.description}\nPrice: ${p.price} ${p.currency}\nTags: ${p.tags.join(", ")}`;
// }

// // Call Ollama for embeddings
// async function embedTexts(texts: string[]): Promise<number[][]> {
//    const res = await fetch(OLLAMA_EMBED_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       model: EMBEDDING_MODEL,
//       input: texts
//     })
//   });

//   if (!res.ok) {
//     const body = await res.text();
//     throw new Error(
//       `Ollama embedding error: ${res.status} ${res.statusText} - ${body}`
//     );
//   }

//   const json: any = await res.json();

//   // /api/embed returns: { model, embeddings: number[][], ... } :contentReference[oaicite:2]{index=2}
//   if (!Array.isArray(json.embeddings) || json.embeddings.length !== texts.length) {
//     throw new Error(
//       `Unexpected embeddings response from Ollama: ${JSON.stringify(json)}`
//     );
//   }

//   return json.embeddings as number[][];
// }

// // Collection accessor
// async function getCollection() {
//   return client.getOrCreateCollection({
//     name: COLLECTION_NAME
//   });
// }

// export async function deleteCollection(): Promise<void> {
//   try {
//     await client.deleteCollection({ name: COLLECTION_NAME });
//     console.log("Old Chroma collection deleted");
//   } catch {
//     console.log("No existing Chroma collection");
//   }
// }

// // Index all products
// export async function indexAllProducts(): Promise<void> {
//   // delete old collection
//   try {
//     await client.deleteCollection({ name: COLLECTION_NAME });
//     console.log("Old Chroma collection deleted");
//   } catch {
//     console.log("No existing Chroma collection");
//   }

//   const collection = await getCollection();

//   const documents = PRODUCTS.map(productToText);
//   const embeddings = await embedTexts(documents);
//   const ids = PRODUCTS.map((p) => p.id);

//   const metadatas: Metadata[] = PRODUCTS.map((p) => ({
//     productId: p.id,
//     name: p.name,
//     description: p.description,
//     price: p.price,
//     imageUrl: p.imageUrl,
//     currency: p.currency,
//     tags: p.tags.join(",")
//   }));

//   await collection.add({
//     ids,
//     documents,
//     embeddings,
//     metadatas
//   });

//   console.log(`Indexed ${ids.length} products into Chroma`);
// }

// export async function semanticSearchProducts(
//   query: string,
//   topK = 5
// ): Promise<Product[]> {
//   const collection = await getCollection();

//   const [queryEmbedding] = await embedTexts([query]);

//   const results = await collection.query({
//     nResults: topK,
//     queryEmbeddings: [queryEmbedding]
//   });

//   const metas = results.metadatas?.[0] ?? [];

//   return metas.map((m: any) => ({
//     id: m.productId,
//     name: m.name,
//     description: m.description,
//     price: Number(m.price),
//     currency: m.currency,
//     imageUrl: m.imageUrl,
//     tags: m.tags.split(",").map((s: string) => s.trim())
//   }));
// }
