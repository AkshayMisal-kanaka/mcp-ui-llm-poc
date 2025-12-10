// client/src/api.ts
export type MCPUIResource = {
  type: 'resource';
  resource: {
    uri: string;
    mimeType: string;
    text?: string;
    blob?: string;
    _meta?: Record<string, unknown>;
  };
};

export async function searchProducts(prompt: string): Promise<{
  ui: MCPUIResource;
  products: any[];
}> {
  const res = await fetch('http://localhost:8082/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!res.ok) {
    throw new Error(`Search failed: ${res.statusText}`);
  }

  return res.json();
}
