// client/src/App.tsx
import React, { useState } from "react";
import {
  isUIResource,
  UIActionResult,
  UIResourceRenderer,
} from "@mcp-ui/client";
import type { MCPUIResource } from "./api";
import { searchProducts } from "./api";
import {
  shoppingComponentLibrary,
  shoppingRemoteElements,
} from "./library/remoteDomLibrary";

type CartItem = { productId: any; fromPrompt: any };
type WishlistItem = { productId: any; fromPrompt: any };

const App: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uiResource, setUiResource] = useState<MCPUIResource | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setError(null);
    setLoading(true);
    try {
      const result = await searchProducts(prompt);
      if (isUIResource(result.ui)) {
        setUiResource(result.ui);
      } else {
        console.error("not a ui resource: ", result.ui);
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const handleToolAction = async (action: UIActionResult) => {
    console.log("UI action:", action);

    if (action.type === "tool") {
      const { toolName, params } = action.payload ?? {};
      if (!toolName || !params) return { status: "ignored" as const };

      if (toolName === "addToCart") {
        setCart((prev) => [
          ...prev,
          { productId: params.productId, fromPrompt: params.fromPrompt },
        ]);
      }

      if (toolName === "addToWishlist") {
        setWishlist((prev) => [
          ...prev,
          { productId: params.productId, fromPrompt: params.fromPrompt },
        ]);
      }
    }

    return { status: "handled" as const };
  };

  // --- Small derived helpers ---
  const cartCount = cart.length;
  const wishlistCount = wishlist.length;

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "24px 16px",
        background:
          "radial-gradient(circle at top left, #e0f2fe, #f9fafb 55%, #f3e8ff)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, system-ui, -system-ui, 'Segoe UI', sans-serif",
        color: "#0f172a",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Top bar / header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: 0.2,
              }}
            >
              🛍️ Smart Cart Explorer
            </h1>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 14,
                color: "#6b7280",
              }}
            >
              Search with natural language and let the AI render your shopping
              UI.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.10)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                color: "#9ca3af",
                letterSpacing: 0.06,
              }}
            >
              Status
            </div>
            <span
              style={{
                fontSize: 12,
                padding: "4px 10px",
                borderRadius: 999,
                backgroundColor: "#dcfce7",
                color: "#166534",
                fontWeight: 600,
              }}
            >
              {loading ? "Searching…" : "Ready"}
            </span>
          </div>
        </header>

        {/* Search panel */}
        <section
          style={{
            backgroundColor: "rgba(255,255,255,0.98)",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
            border: "1px solid rgba(226, 232, 240, 0.9)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                Search products
              </h2>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                Ask for things like{" "}
                <span style={{ fontStyle: "italic" }}>
                  “budget gaming laptop under 50k”
                </span>{" "}
                or{" "}
                <span style={{ fontStyle: "italic" }}>
                  “lightweight student laptop”
                </span>
                .
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  backgroundColor: "#eff6ff",
                  color: "#1d4ed8",
                  fontWeight: 500,
                }}
              >
                Cart: {cartCount}
              </span>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  backgroundColor: "#fdf2ff",
                  color: "#a855f7",
                  fontWeight: 500,
                }}
              >
                Wishlist: {wishlistCount}
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              gap: 10,
              marginTop: 8,
              alignItems: "stretch",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  fontSize: 14,
                  color: "#9ca3af",
                }}
              >
                🔍
              </span>
              <input
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 32px",
                  borderRadius: 999,
                  border: "1px solid #e5e7eb",
                  fontSize: 14,
                  outline: "none",
                  transition:
                    "border-color 0.12s ease, box-shadow 0.12s ease, background 0.12s",
                  backgroundColor: "#f9fafb",
                }}
                value={prompt}
                placeholder="Try: “budget laptop with SSD under 40k”"
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 1px rgba(59,130,246,0.2)";
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "none",
                cursor:
                  loading || !prompt.trim() ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 600,
                background:
                  loading || !prompt.trim()
                    ? "linear-gradient(135deg,#d1d5db,#e5e7eb)"
                    : "linear-gradient(135deg,#3b82f6,#2563eb)",
                color: loading || !prompt.trim() ? "#6b7280" : "#ffffff",
                boxShadow:
                  loading || !prompt.trim()
                    ? "none"
                    : "0 12px 30px rgba(37,99,235,0.35)",
                minWidth: 120,
                transition:
                  "transform 0.08s ease, box-shadow 0.08s ease, background 0.12s",
              }}
              onMouseDown={(e) => {
                if (loading || !prompt.trim()) return;
                e.currentTarget.style.transform = "scale(0.97)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: 6,
                padding: "8px 10px",
                borderRadius: 8,
                fontSize: 13,
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}
        </section>

        {/* Main content: results + sidebar */}
        <main
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2.2fr) minmax(260px, 1fr)",
            gap: 20,
            alignItems: "flex-start",
          }}
        >
          {/* Remote DOM results */}
          <section
            style={{
              backgroundColor: "rgba(255,255,255,0.98)",
              borderRadius: 18,
              padding: 16,
              boxShadow: "0 16px 36px rgba(15, 23, 42, 0.10)",
              border: "1px solid rgba(226, 232, 240, 0.9)",
              minHeight: 200,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
                gap: 8,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                Search Results
              </h2>
              {prompt.trim() && (
                <span
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                >
                  Showing UI for “{prompt}”
                </span>
              )}
            </div>

            {!uiResource && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  color: "#9ca3af",
                }}
              >
                Run a search to see the AI-generated product layout here.
              </div>
            )}

            {uiResource && (
              <UIResourceRenderer
                key={uiResource.resource.uri}
                resource={uiResource.resource}
                onUIAction={handleToolAction}
                remoteDomProps={{
                  library: shoppingComponentLibrary,
                  remoteElements: shoppingRemoteElements,
                }}
              />
            )}
          </section>

          {/* Sidebar: cart + wishlist */}
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Cart card */}
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.98)",
                borderRadius: 16,
                padding: 14,
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
                border: "1px solid rgba(226, 232, 240, 0.9)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  Cart
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 999,
                    backgroundColor: "#eff6ff",
                    color: "#1d4ed8",
                    fontWeight: 600,
                  }}
                >
                  {cartCount} item{cartCount === 1 ? "" : "s"}
                </span>
              </div>

              {cart.length === 0 && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#9ca3af",
                    paddingTop: 4,
                  }}
                >
                  No items yet. Use “Add to Cart” in the results.
                </div>
              )}

              {cart.length > 0 && (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >
                  {cart.map((c, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: 13,
                        padding: "6px 8px",
                        borderRadius: 10,
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div style={{ fontWeight: 500 }}>
                        Product ID: {c.productId}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        From: “{c.fromPrompt}”
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Wishlist card */}
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.98)",
                borderRadius: 16,
                padding: 14,
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
                border: "1px solid rgba(226, 232, 240, 0.9)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  Wishlist
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 999,
                    backgroundColor: "#fdf2ff",
                    color: "#a855f7",
                    fontWeight: 600,
                  }}
                >
                  {wishlistCount} saved
                </span>
              </div>

              {wishlist.length === 0 && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#9ca3af",
                    paddingTop: 4,
                  }}
                >
                  No favourites yet. Tap “Wishlist” in the results.
                </div>
              )}

              {wishlist.length > 0 && (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >
                  {wishlist.map((w, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: 13,
                        padding: "6px 8px",
                        borderRadius: 10,
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div style={{ fontWeight: 500 }}>
                        Product ID: {w.productId}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        From: “{w.fromPrompt}”
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default App;
