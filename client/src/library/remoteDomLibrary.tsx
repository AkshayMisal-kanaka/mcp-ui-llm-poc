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
  onPress?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
    onPress,
    onClick,
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
      onClick={(e)=>{
        if(onPress){onPress();};
        if(onClick){onClick(e);};
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
  extends React.HTMLAttributes<HTMLDivElement> {
  // how many columns to render, optional
  columns?: number | string;
}

export const ShopGrid = React.forwardRef<HTMLDivElement, ShopGridProps>(
  (props, ref) => {
    const { style, columns, ...rest } = props;

    // default: auto-fit for search page
    let templateColumns = "repeat(auto-fit, minmax(260px, 1fr))";

    if (columns != null) {
      const n = Number(columns);
      if (!Number.isNaN(n) && n > 0) {
        // e.g. columns="5" => repeat(5, minmax(0, 1fr))
        templateColumns = `repeat(${n}, minmax(0, 1fr))`;
      }
    }

    return (
      <div
        ref={ref}
        style={{
          display: "grid",
          gridTemplateColumns: templateColumns,
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


export interface ShopBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  text?: string;
  tone?: "info" | "success" | "warning" | "danger" | "neutral";
}

export const ShopBadge = React.forwardRef<HTMLSpanElement, ShopBadgeProps>(
  (props, ref) => {
    const { text, tone = "info", style, ...rest } = props;

    const base: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "3px 9px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      whiteSpace: "nowrap",
      ...style,
    };

    const tones: Record<NonNullable<ShopBadgeProps["tone"]>, React.CSSProperties> =
      {
        info: {
          background: "rgba(59,130,246,0.1)",
          color: "#1d4ed8",
        },
        success: {
          background: "rgba(22,163,74,0.12)",
          color: "#15803d",
        },
        warning: {
          background: "rgba(234,179,8,0.12)",
          color: "#a16207",
        },
        danger: {
          background: "rgba(239,68,68,0.12)",
          color: "#b91c1c",
        },
        neutral: {
          background: "rgba(107,114,128,0.12)",
          color: "#374151",
        },
      };

    return (
      <span ref={ref} style={{ ...base, ...tones[tone] }} {...rest}>
        {text}
      </span>
    );
  }
);
ShopBadge.displayName = "ShopBadge";

export interface ShopSmallTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  content?: string;
  muted?: boolean;
}

export const ShopSmallText = React.forwardRef<
  HTMLSpanElement,
  ShopSmallTextProps
>((props, ref) => {
  const { content, muted = true, style, ...rest } = props;
  return (
    <span
      ref={ref}
      style={{
        fontSize: 11,
        color: muted ? "#9ca3af" : "#4b5563",
        ...style,
      }}
      {...rest}
    >
      {content}
    </span>
  );
});
ShopSmallText.displayName = "ShopSmallText";

export interface ShopImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  rounded?: boolean;
}

export const ShopImage = React.forwardRef<HTMLImageElement, ShopImageProps>(
  (props, ref) => {
    const { src, alt, rounded = true, style, ...rest } = props;
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: rounded ? 16 : 0,
          display: "block",
          ...style,
        }}
        {...rest}
      />
    );
  }
);
ShopImage.displayName = "ShopImage";

export interface ShopCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "soft";
}

export const ShopCard = React.forwardRef<HTMLDivElement, ShopCardProps>(
  (props, ref) => {
    const { variant = "default", style, children, ...rest } = props;

    const base: React.CSSProperties = {
      borderRadius: 20,
      padding: 16,
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      transition: "box-shadow 0.12s ease, transform 0.08s ease, border-color 0.12s ease",
      cursor: "default",
      ...style,
    };

    const variants: Record<NonNullable<ShopCardProps["variant"]>, React.CSSProperties> =
      {
        default: {
          border: "1px solid #e5e7eb",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.10)",
        },
        outline: {
          border: "1px solid #d1d5db",
          boxShadow: "none",
        },
        soft: {
          border: "1px solid rgba(148, 163, 184, 0.35)",
          background:
            "radial-gradient(circle at top left, #eff6ff, #ffffff 55%)",
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.16)",
        },
      };

    return (
      <div
        ref={ref}
        style={{ ...base, ...variants[variant] }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
ShopCard.displayName = "ShopCard";

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
    const { columns, ...rest } =
      (raw as unknown as Partial<ShopGridProps>) as ShopGridProps;

    return (
      <ShopGrid
        ref={ref}
        columns={columns}
        {...(rest as any)}
      />
    );
  }
);
ShopGridRemote.displayName = "ShopGridRemote";



const ShopBadgeRemote = React.forwardRef<HTMLSpanElement, RemoteProps>(
  (raw, ref) => {
    const { text, tone, ...rest } =
      raw as unknown as Partial<ShopBadgeProps> &
        React.HTMLAttributes<HTMLSpanElement>;

    return (
      <ShopBadge
        ref={ref}
        text={text != null ? String(text) : undefined}
        tone={(tone as ShopBadgeProps["tone"]) ?? "info"}
        {...(rest as any)}
      />
    );
  }
);
ShopBadgeRemote.displayName = "ShopBadgeRemote";

const ShopSmallTextRemote = React.forwardRef<HTMLSpanElement, RemoteProps>(
  (raw, ref) => {
    const { content, muted, ...rest } =
      raw as unknown as Partial<ShopSmallTextProps> &
        React.HTMLAttributes<HTMLSpanElement>;

    return (
      <ShopSmallText
        ref={ref}
        content={content != null ? String(content) : undefined}
        muted={muted === undefined ? true : Boolean(muted)}
        {...(rest as any)}
      />
    );
  }
);
ShopSmallTextRemote.displayName = "ShopSmallTextRemote";

const ShopImageRemote = React.forwardRef<HTMLImageElement, RemoteProps>(
  (raw, ref) => {
    const {
      src,
      alt,
      rounded,
      children,
      dangerouslySetInnerHTML,
      ...rest
    } = raw as unknown as Partial<ShopImageProps> &
      React.ImgHTMLAttributes<HTMLImageElement>;

    return (
      <ShopImage
        ref={ref}
        src={src != null ? String(src) : undefined}
        alt={alt != null ? String(alt) : undefined}
        rounded={rounded === undefined ? true : Boolean(rounded)}
        {...(rest as any)}   
      />
    );
  }
);
ShopImageRemote.displayName = "ShopImageRemote";

const ShopCardRemote = React.forwardRef<HTMLDivElement, RemoteProps>(
  (raw, ref) => {
    const { variant, ...rest } =
      raw as unknown as Partial<ShopCardProps> &
        React.HTMLAttributes<HTMLDivElement>;

    return (
      <ShopCard
        ref={ref}
        variant={(variant as ShopCardProps["variant"]) ?? "default"}
        {...(rest as any)}
      />
    );
  }
);
ShopCardRemote.displayName = "ShopCardRemote";

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
      propMapping: {
        columns: "columns"
      },
      eventMapping: {},
    },
    {
      tagName: "shop-badge",
      component: ShopBadgeRemote,
      propMapping: {
        text: "text",
        tone: "tone",
      },
      eventMapping: {},
    },
    {
      tagName: "shop-small-text",
      component: ShopSmallTextRemote,
      propMapping: {
        content: "content",
        muted: "muted",
      },
      eventMapping: {},
    },
    {
      tagName: "shop-img",
      component: ShopImageRemote,
      propMapping: {
        src: "src",
        alt: "alt",
        rounded: "rounded",
      },
      eventMapping: {},
    },
    {
      tagName: "shop-card",
      component: ShopCardRemote,
      propMapping: {
        variant: "variant",
      },
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
    remoteAttributes: ["columns"],
    remoteEvents: []
  },
   {
    tagName: "shop-badge",
    remoteAttributes: ["text", "tone"],
    remoteEvents: [],
  },
  {
    tagName: "shop-small-text",
    remoteAttributes: ["content", "muted"],
    remoteEvents: [],
  },
  {
    tagName: "shop-img",
    remoteAttributes: ["src", "alt", "rounded"],
    remoteEvents: [],
  },
  {
    tagName: "shop-card",
    remoteAttributes: ["variant"],
    remoteEvents: [],
  },
];
