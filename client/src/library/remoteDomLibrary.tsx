// client/src/mcp-ui/shopping-remote-library.tsx
import React from "react";
import {
  type ComponentLibrary,
  type RemoteElementConfiguration,
} from "@mcp-ui/client";

/* ------------ Strongly typed base components ------------ */

type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ShopButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export const ShopButton = React.forwardRef<
  HTMLButtonElement,
  ShopButtonProps
>((props, ref) => {
  const {
    label,
    variant = "primary",
    fullWidth,
    style,
    ...rest
  } = props;

  const base: React.CSSProperties = {
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 14,
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "transform 0.08s ease, box-shadow 0.08s ease, background 0.12s",
    width: fullWidth ? "100%" : undefined,
    whiteSpace: "nowrap",
    ...style,
  };

  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background:
        "linear-gradient(135deg, rgb(59,130,246), rgb(96,165,250))",
      color: "#fff",
      boxShadow: "0 8px 18px rgba(37, 99, 235, 0.35)",
    },
    secondary: {
      background: "#fff",
      color: "#111827",
      border: "1px solid #e5e7eb",
      boxShadow: "0 4px 10px rgba(15, 23, 42, 0.08)",
    },
    ghost: {
      background: "transparent",
      color: "#6b7280",
      border: "1px dashed #d1d5db",
      boxShadow: "none",
    },
  };

  return (
    <button
      ref={ref}
      style={{ ...base, ...variants[variant] }}
      {...rest}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.97)";
        rest.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        rest.onMouseUp?.(e);
      }}
    >
      {variant === "primary" && "🛒"} {label}
    </button>
  );
});
ShopButton.displayName = "ShopButton";

export interface ShopTextProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  content?: string;
  kind?: "title" | "subtitle" | "muted";
}

export const ShopText = React.forwardRef<HTMLParagraphElement, ShopTextProps>(
  (props, ref) => {
    const { content, kind = "subtitle", style, ...rest } = props;

    const base: React.CSSProperties = {
      margin: 0,
      ...style,
    };

    const styles: Record<string, React.CSSProperties> = {
      title: {
        ...base,
        fontSize: 18,
        fontWeight: 600,
        color: "#0f172a",
      },
      subtitle: {
        ...base,
        fontSize: 14,
        color: "#4b5563",
      },
      muted: {
        ...base,
        fontSize: 12,
        color: "#9ca3af",
      },
    };

    return (
      <p ref={ref} style={styles[kind]} {...rest}>
        {content}
      </p>
    );
  }
);
ShopText.displayName = "ShopText";

export interface ProductCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  price: string;
  currency?: string;
  imageUrl?: string;
  imageurl?: string;
  badge?: string;
  inCart?: boolean;
  inWishlist?: boolean;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
}

export const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  (props, ref) => {
    const {
      title,
      description,
      price,
      currency = "₹",
      imageUrl,
      badge,
      inCart,
      inWishlist,
      onAddToCart,
      onAddToWishlist,
      style,
      ...rest
    } = props;
    console.log('Image url: ', imageUrl);
    return (
      <div
        ref={ref}
        style={{
          borderRadius: 20,
          border: "1px solid #e5e7eb",
          background: "linear-gradient(180deg, #ffffff, #f9fafb)",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.18)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          position: "relative",
          overflow: "hidden",
          ...style,
        }}
        {...rest}
      >
        {badge && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "linear-gradient(135deg, #f97316, #fb923c)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 9px",
              borderRadius: 999,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {badge}
          </div>
        )}

        {imageUrl && (
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              height: 160,
              backgroundColor: "#f3f4f6",
              marginBottom: 4,
            }}
          >
            <img
              src={imageUrl}
              alt={title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <ShopText content={title} kind="title" />
          {description && (
            <ShopText content={description} kind="subtitle" />
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {currency} {price}
            </span>
            <span
              style={{
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              Inclusive of all taxes
            </span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginTop: 10,
          }}
        >
          <ShopButton
            label={inCart ? "In Cart" : "Add to Cart"}
            variant="primary"
            fullWidth
            onClick={()=> onAddToCart?.()}
          />
          <ShopButton
            label={inWishlist ? "Wishlisted" : "Wishlist"}
            variant="secondary"
            fullWidth
            onClick={()=> onAddToWishlist?.()}
          />
        </div>
      </div>
    );
  }
);
ProductCard.displayName = "ProductCard";

export interface ShopGridProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const ShopGrid = React.forwardRef<HTMLDivElement, ShopGridProps>(
  (props, ref) => {
    const { style, ...rest } = props;
    return (
      <div
        ref={ref}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
          marginTop: "12px",
          ...style,
        }}
        {...rest}
      />
    );
  }
);
ShopGrid.displayName = "ShopGrid";

/* ------------ Remote wrappers (ComponentType<Record<string, unknown>>) ------------ */

type RemoteProps = Record<string, unknown>;

const ShopButtonRemote = React.forwardRef<HTMLButtonElement, RemoteProps>(
  (raw, ref) => {
    // cast via unknown → Partial<ShopButtonProps> to avoid TS warning
    const {
      label,
      variant,
      fullWidth,
      ...rest
    } = raw as unknown as Partial<ShopButtonProps> &
      React.ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <ShopButton
        ref={ref}
        label={String(label ?? "")}
        variant={(variant as ButtonVariant) ?? "primary"}
        fullWidth={Boolean(fullWidth)}
        {...rest}
      />
    );
  }
);
ShopButtonRemote.displayName = "ShopButtonRemote";

const ShopTextRemote = React.forwardRef<HTMLParagraphElement, RemoteProps>(
  (raw, ref) => {
    const {
      content,
      kind,
      ...rest
    } = raw as unknown as Partial<ShopTextProps> &
      React.HTMLAttributes<HTMLParagraphElement>;

    return (
      <ShopText
        ref={ref}
        content={String(content ?? "")}
        kind={(kind as ShopTextProps["kind"]) ?? "subtitle"}
        {...rest}
      />
    );
  }
);
ShopTextRemote.displayName = "ShopTextRemote";

const ProductCardRemote = React.forwardRef<HTMLDivElement, RemoteProps>(
  (raw, ref) => {
    const {
      title,
      description,
      price,
      currency,
      imageUrl,
      imageurl,
      badge,
      inCart,
      inWishlist,
      onAddToCart,
      onAddToWishlist,
      ...rest
    } = raw as unknown as Partial<ProductCardProps> &
      React.HTMLAttributes<HTMLDivElement>;
    console.log('Product Image url (imageUrl)', imageUrl, imageurl);
      const rawAny = raw as any;
    const imageUrlLower = rawAny?.imageurl;
    const resolvedImageUrl =
      typeof imageUrl === "string"
        ? imageUrl
        : typeof imageUrlLower === "string"
        ? imageUrlLower
        : undefined;

    console.log('Product Image url (imageUrl)', resolvedImageUrl, rest);
    return (
      <ProductCard
        ref={ref}
        title={String(title ?? "")}
        description={
          typeof description === "string" ? description : undefined
        }
        price={String(price ?? "")}
        currency={currency ? String(currency) : "₹"}
        imageUrl={resolvedImageUrl}
        badge={typeof badge === "string" ? badge : undefined}
        inCart={Boolean(inCart)}
        inWishlist={Boolean(inWishlist)}
        onAddToCart={onAddToCart}
        onAddToWishlist={onAddToWishlist}
        {...rest}
      />
    );
  }
);
ProductCardRemote.displayName = "ProductCardRemote";

const ShopGridRemote = React.forwardRef<HTMLDivElement, RemoteProps>(
  (raw, ref) => {
    const rest = raw as unknown as ShopGridProps;
    return <ShopGrid ref={ref} {...rest} />;
  }
);
ShopGridRemote.displayName = "ShopGridRemote";

/* ------------ ComponentLibrary & RemoteElementConfiguration[] ------------ */

export const shoppingComponentLibrary: ComponentLibrary = {
  name: "shopping-ui",
  elements: [
    {
      tagName: "shop-button",
      component: ShopButtonRemote,
      propMapping: {
        label: "label",
        variant: "variant",
        fullWidth: "fullWidth",
      },
      eventMapping: {
        press: "onPress",
      },
    },
    {
      tagName: "shop-text",
      component: ShopTextRemote,
      propMapping: {
        content: "content",
        kind: "kind",
      },
    },
    {
      tagName: "shop-product-card",
      component: ProductCardRemote,
      propMapping: {
        title: "title",
        description: "description",
        price: "price",
        currency: "currency",
        imageUrl: "imageUrl",
        imageurl:  "imageurl",
        badge: "badge",
        inCart: "inCart",
        inWishlist: "inWishlist",
      },
      eventMapping: {
        addToCart: "onAddToCart",
        addToWishlist: "onAddToWishlist",
      },
    },
    {
      tagName: "shop-grid",
      component: ShopGridRemote,
      propMapping: {},
      eventMapping: {},
    },
  ],
};

export const shoppingRemoteElements: RemoteElementConfiguration[] = [
  {
    tagName: "shop-button",
    remoteAttributes: ['label', 'variant', 'fullWidth'],
    remoteEvents: ['press']
  },
  {
    tagName: "shop-text",
    remoteAttributes: ['content', 'kind'],
    remoteEvents: []
  },
  {
    tagName: "shop-product-card",
    remoteAttributes: ['title', 'description', 'price', 'currency', 'imageUrl', 'imageurl', 'badge', 'inCart', 'inWishlist'],
    remoteEvents: ['addToCart', 'addToWishlist']
  },
  {
    tagName: "shop-grid",
    remoteAttributes: [],
    remoteEvents: []
  }
];
