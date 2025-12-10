// client/src/App.tsx
import React, { useState } from 'react';
import { isUIResource, UIActionResult, UIResourceRenderer } from '@mcp-ui/client';
import type { MCPUIResource } from './api';
import { searchProducts } from './api';
import { shoppingComponentLibrary, shoppingRemoteElements } from './library/remoteDomLibrary';

type CartItem = { productId: any; fromPrompt: any };
type WishlistItem = { productId: any; fromPrompt: any };

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uiResource, setUiResource] = useState<MCPUIResource | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await searchProducts(prompt);
      if(isUIResource(result.ui)){
          setUiResource(result.ui);
      }else {
        console.error('not a ui resource: ', result.ui);
      }
      
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const handleToolAction = async (action: UIActionResult) => {
    // This corresponds to window.parent.postMessage({ type: 'tool', payload: {...}})
    console.log('UI action:', action);

    if (action.type === 'tool') {
      const { toolName, params } = action.payload ?? {};
      if (!toolName) return;

      if (toolName === 'addToCart') {
        setCart(prev => [...prev, { productId: params.productId, fromPrompt: params.fromPrompt }]);
      }

      if (toolName === 'addToWishlist') {
        setWishlist(prev => [
          ...prev,
          { productId: params.productId, fromPrompt: params.fromPrompt }
        ]);
      }
    }
    return { status: 'handled' as const };
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '16px' }}>
      <h1>MCP-UI Product Search</h1>

      <form
        onSubmit={handleSearch}
        style={{ display: 'flex', gap: 8, marginBottom: 16 }}
      >
        <input
          style={{ flex: 1, padding: 8 }}
          value={prompt}
          placeholder="Search e.g. 'budget gaming laptop under 50k'"
          onChange={e => setPrompt(e.target.value)}
        />
        <button type="submit" disabled={loading || !prompt.trim()}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginBottom: 8 }}>
          {error}
        </div>
      )}

      {/* The interactive UI coming from the server / LLM */}
      {uiResource && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16
          }}
        >
          <h2 style={{ marginTop: 0 }}>Search Results (Remote DOM)</h2>
          <UIResourceRenderer
            key={uiResource.resource.uri}
            resource={uiResource.resource}
            onUIAction={handleToolAction}
            remoteDomProps={{
                  library: shoppingComponentLibrary,
                  remoteElements: shoppingRemoteElements,
                }}
          />
        </div>
      )}

      {/* Simple view of cart & wishlist state tracked by host */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div>
          <h3>Cart</h3>
          {cart.length === 0 && <div>No items yet</div>}
          <ul>
            {cart.map((c, idx) => (
              <li key={idx}>
                {c.productId} (from: “{c.fromPrompt}”)
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Wishlist</h3>
          {wishlist.length === 0 && <div>No items yet</div>}
          <ul>
            {wishlist.map((w, idx) => (
              <li key={idx}>
                {w.productId} (from: “{w.fromPrompt}”)
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
