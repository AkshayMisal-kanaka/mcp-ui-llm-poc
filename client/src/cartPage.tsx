// client/src/CartPage.tsx
import React, { useEffect, useState } from "react";
import { isUIResource, UIResourceRenderer } from "@mcp-ui/client";
import { shoppingComponentLibrary, shoppingRemoteElements } from "./library/remoteDomLibrary";
import { fetchCartUI, removeCartItem, removeWishlistItem } from "./api";
import type { UIActionResult } from "@mcp-ui/client";

export const CartPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [uiResource, setUiResource] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { ui } = await fetchCartUI();
        if (isUIResource(ui)) {
            setUiResource(ui);
        }else {
            console.error("not a ui resource: ", ui);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToolAction = async (action: UIActionResult) => {
    console.log("CartPage UI action:", action);

    if (action.type !== "tool") return { status: "ignored" as const };

    const { toolName, params } = action.payload ?? {};
    const productId = String(params?.productId ?? "");

    if (!toolName || !productId) return { status: "ignored" as const };

    try {
      if (toolName === "removeFromCart") {
        await removeCartItem(productId);
        // refresh UI from server so totals update
        const { ui } = await fetchCartUI();
        setUiResource(ui);
      }

      if (toolName === "removeFromWishlist") {
        await removeWishlistItem(productId);
        const { ui } = await fetchCartUI();
        setUiResource(ui);
      }
    } catch (err) {
      console.error(err);
      return { status: "error" as const };
    }

    return { status: "handled" as const };
  };

  if (loading && !uiResource) {
    return <div style={{ padding: 24 }}>Loading your cart...</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <button
        onClick={onBack}
        style={{
          marginBottom: 16,
          border: "none",
          background: "transparent",
          color: "#2563eb",
          cursor: "pointer",
        }}
      >
        ← Back to shopping
      </button>

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
    </div>
  );
};
