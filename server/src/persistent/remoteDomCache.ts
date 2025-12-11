import { pgPool } from "./db";
import type { Product } from "../products";

export type RemoteDomCacheRow = {
  id: number;
  cache_key: string;
  script: string;
  model: string | null;
  updated_at: string;
};

/**
 * Get the most recent cached script for a cache_key.
 */
export async function getCachedRemoteDomScript(
  cache_key: string
): Promise<string | null> {
  const client = await pgPool.connect();
  try {
    const result = await client.query<RemoteDomCacheRow>(
      `
      SELECT script
      FROM remote_dom_cache
      WHERE cache_key = $1
      ORDER BY updated_at DESC
      LIMIT 1
      `,
      [cache_key]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0].script;
  } finally {
    client.release();
  }
}

/**
 * Save a new script for a cache_key
 */
export async function saveRemoteDomScript(params: {
  cache_key: string;
  script: string;
  model?: string;
}): Promise<void> {
  const { cache_key, script, model } = params;
  const client = await pgPool.connect();
  try {
    
    await client.query(
      `
      INSERT INTO remote_dom_cache (cache_key, script, model)
      VALUES ($1, $2, $3)
      ON CONFLICT (cache_key)
      DO UPDATE SET 
        script = EXCLUDED.script,
        model = EXCLUDED.model,
        updated_at = NOW()
      `,
      [cache_key, script, model ?? null]
    );
  } finally {
    client.release();
  }
}
