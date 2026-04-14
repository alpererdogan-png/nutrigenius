# AmazonProductCard — Portable Spec

A shared, themeable Amazon affiliate product card for use across sibling
sites (NutriGenius, Dermawise, and any future properties). The component
depends only on a small CSS-variable contract — each site supplies its own
brand values and the component renders on-brand everywhere without any
hardcoded hex values in the component itself.

---

## 1. CSS variable contract

Define these seven variables in your site's global stylesheet. Each site
supplies its own brand values; the component never inspects the values, only
the variable names.

| Variable                      | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| `--color-primary`             | Brand accent — used for links, CTA hover ring, tier icons |
| `--color-primary-foreground`  | Text color that sits on top of `--color-primary`          |
| `--color-accent`              | Soft tinted surface — icon halos, subtle fills            |
| `--color-surface`             | Card / panel background                                   |
| `--color-border`              | Component & card borders                                  |
| `--color-text`                | Primary body and heading text                             |
| `--color-text-muted`          | Secondary body / description text                         |

Contrast requirement: `--color-text` and `--color-text-muted` must each hit
**≥4.5:1** contrast against `--color-surface` (WCAG AA for body text).
`--color-primary` must hit **≥3:1** against `--color-surface` (WCAG AA for
non-text UI).

### Example for Dermawise

Supply your own brand hexes, keeping the variable names identical:

```css
/* dermawise/app/globals.css */
@theme {
  --color-primary:            #your-derma-teal;
  --color-primary-foreground: #ffffff;
  --color-accent:             #your-derma-tint;
  --color-surface:            #ffffff;
  --color-border:             #your-derma-border;
  --color-text:               #your-derma-ink;
  --color-text-muted:         #your-derma-body;
}
```

> **Tailwind v4 note:** declaring the tokens inside a `@theme` block both
> (a) generates utility classes (`bg-surface`, `text-text`, `bg-accent`,
> `border-border`, etc.) and (b) publishes them as CSS variables on `:root`.

---

## 2. Tailwind config snippet

### Tailwind v4 (no `tailwind.config`)

Everything lives in `globals.css`. Drop the block above directly into a
`@theme { ... }` block after `@import "tailwindcss";`.

### Tailwind v3 (traditional `tailwind.config.ts`)

Paste into `theme.extend.colors`. Define the raw hexes on `:root` in
`globals.css`, then wire Tailwind to read from them so alpha modifiers
(`bg-primary/10`, `ring-primary/30`) work:

```css
/* globals.css */
:root {
  --color-primary:            0 104 95;     /* "R G B" triplet — no commas */
  --color-primary-foreground: 255 255 255;
  --color-accent:             240 253 250;
  --color-surface:            255 255 255;
  --color-border:             232 236 241;
  --color-text:               26 35 50;
  --color-text-muted:         90 101 120;
}
```

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:              'rgb(var(--color-primary) / <alpha-value>)',
        'primary-foreground': 'rgb(var(--color-primary-foreground) / <alpha-value>)',
        accent:               'rgb(var(--color-accent) / <alpha-value>)',
        surface:              'rgb(var(--color-surface) / <alpha-value>)',
        border:               'rgb(var(--color-border) / <alpha-value>)',
        text:                 'rgb(var(--color-text) / <alpha-value>)',
        'text-muted':         'rgb(var(--color-text-muted) / <alpha-value>)',
      },
    },
  },
} satisfies Config;
```

---

## 3. Full component source

Paste this verbatim at `components/ui/AmazonProductCard.tsx` (adjust path
to match your project's convention; on NutriGenius it lives at
`src/components/ui/AmazonProductCard.tsx`). The companion `AmazonLogo`
component is required — the source is at the bottom of this file.

```tsx
// components/ui/AmazonProductCard.tsx
import { Star, Gem, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AmazonLogo } from "./AmazonLogo";

/**
 * Shared Amazon affiliate product card.
 *
 * Depends exclusively on the brand token contract defined in globals.css
 * (`--color-primary`, `--color-accent`, `--color-surface`, `--color-border`,
 * `--color-text`, `--color-text-muted`, `--color-primary-foreground`).
 * No hardcoded brand hexes — the component is portable to any sibling site
 * that defines the same tokens.
 *
 * The Amazon wordmark itself stays Amazon-orange (#FF9900) because that is
 * Amazon's official brand color and required by their Associates TOS.
 */

export type AmazonProductTier = "best-fit" | "premium" | "budget";
export type AmazonProductVariant = "inline" | "tier" | "compact";
export type AmazonPriceLevel = "$" | "$$" | "$$$";

export interface AmazonProductCardProps {
  title: string;
  brand: string;
  description?: string;
  href: string;
  tier?: AmazonProductTier;
  priceLevel?: AmazonPriceLevel;
  imageUrl?: string;
  variant?: AmazonProductVariant;
}

interface TierMeta {
  icon: LucideIcon;
  label: string;
  iconFill: boolean;
}

const TIER_META: Record<AmazonProductTier, TierMeta> = {
  "best-fit": { icon: Star, label: "Best Fit", iconFill: true },
  premium:    { icon: Gem,  label: "Premium",  iconFill: true },
  budget:     { icon: Tag,  label: "Budget",   iconFill: false },
};

function ViewOnAmazonButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="inline-flex items-center gap-1.5 bg-surface text-text text-xs font-medium px-4 py-2 rounded-full ring-1 ring-border hover:ring-primary/30 hover:bg-accent transition-colors flex-shrink-0"
    >
      View on <AmazonLogo className="h-[14px] w-auto" /> →
    </a>
  );
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="w-12 h-12 rounded-lg object-cover ring-1 ring-border flex-shrink-0"
      loading="lazy"
    />
  );
}

function TierCard({
  title, brand, description, href, tier, priceLevel, imageUrl,
}: AmazonProductCardProps & { tier: AmazonProductTier }) {
  const meta = TIER_META[tier];
  const Icon = meta.icon;
  return (
    <div className="bg-surface ring-1 ring-border rounded-xl p-4 flex items-center gap-4">
      {imageUrl ? (
        <ProductImage src={imageUrl} alt={`${brand} ${title}`} />
      ) : (
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 ring-1 ring-border">
          <Icon
            className="w-4 h-4 text-primary"
            fill={meta.iconFill ? "currentColor" : "none"}
            strokeWidth={meta.iconFill ? 1.5 : 2}
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
            {meta.label}
          </span>
          {priceLevel && (
            <span className="text-[10px] font-semibold text-text">{priceLevel}</span>
          )}
        </div>
        <p className="text-[13px] font-semibold text-text leading-snug">
          {brand} <span className="font-normal text-text-muted">{title}</span>
        </p>
        {description && (
          <p className="text-[11px] text-text-muted leading-snug mt-0.5">{description}</p>
        )}
      </div>
      <ViewOnAmazonButton href={href} />
    </div>
  );
}

function InlineCard({
  title, brand, description, href, imageUrl,
}: AmazonProductCardProps) {
  return (
    <div className="bg-surface ring-1 ring-border rounded-xl shadow-sm shadow-black/[0.03] p-4 flex items-center gap-3">
      {imageUrl && <ProductImage src={imageUrl} alt={`${brand} ${title}`} />}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-text leading-snug">{title}</p>
        <p className="text-[12px] text-text-muted leading-snug mt-0.5">{brand}</p>
        {description && (
          <p className="text-[11px] text-text-muted leading-snug mt-0.5">{description}</p>
        )}
      </div>
      <ViewOnAmazonButton href={href} />
    </div>
  );
}

function CompactCard({ href }: AmazonProductCardProps) {
  return <ViewOnAmazonButton href={href} />;
}

export function AmazonProductCard(props: AmazonProductCardProps) {
  const variant: AmazonProductVariant =
    props.variant ?? (props.tier ? "tier" : "inline");
  if (variant === "compact") return <CompactCard {...props} />;
  if (variant === "tier") {
    const tier: AmazonProductTier = props.tier ?? "best-fit";
    return <TierCard {...props} tier={tier} />;
  }
  return <InlineCard {...props} />;
}
```

### Companion: `AmazonLogo.tsx`

```tsx
// components/ui/AmazonLogo.tsx
interface AmazonLogoProps {
  className?: string;
}

/**
 * Amazon wordmark SVG. Kept at Amazon-orange (#FF9900) — Amazon's official
 * brand color and required by Amazon Associates TOS; this is the one place
 * where a hardcoded hex is correct.
 */
export function AmazonLogo({ className }: AmazonLogoProps) {
  return (
    <svg
      viewBox="0 0 60 18"
      aria-label="Amazon"
      className={className}
      fill="currentColor"
    >
      <text
        x="0" y="14"
        fontSize="14"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fill="#FF9900"
      >
        amazon
      </text>
      <path
        d="M3 16 Q17 21 37 16"
        stroke="#FF9900" strokeWidth="2" fill="none" strokeLinecap="round"
      />
      <path
        d="M35 14 L38 17 L35 17"
        stroke="#FF9900" strokeWidth="1.5" fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
```

---

## 4. Props reference

```ts
type AmazonProductCardProps = {
  title: string;
  brand: string;
  description?: string;
  href: string;
  tier?: 'best-fit' | 'premium' | 'budget';
  priceLevel?: '$' | '$$' | '$$$';
  imageUrl?: string;
  variant?: 'inline' | 'tier' | 'compact';
};
```

| Prop          | Required | Notes                                                                                                                                             |
| ------------- | :------: | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`       |     ✓    | Product name (e.g. `"Magnesium Glycinate 400 mg"`).                                                                                               |
| `brand`       |     ✓    | Brand name (e.g. `"Doctor's Best"`). Rendered in bold ahead of `title` in tier variant.                                                           |
| `description` |          | Short qualifier (bioavailable form, third-party tested, dose rationale). Shown in muted text below the title.                                     |
| `href`        |     ✓    | Fully-formed Amazon Associates URL, already geo-routed and tagged. Opens in new tab with `rel="noopener noreferrer sponsored"`.                   |
| `tier`        |          | One of `'best-fit' \| 'premium' \| 'budget'`. Determines icon (Star / Gem / Tag), label, and default variant.                                    |
| `priceLevel`  |          | Visual price indicator (`$`, `$$`, `$$$`). Only rendered in the tier variant next to the tier label.                                              |
| `imageUrl`    |          | Optional product thumbnail (48×48 square). When set, replaces the tier-icon halo with a real image.                                               |
| `variant`     |          | Forces a layout. Defaults to `'tier'` if `tier` is set, otherwise `'inline'`. Pass `'compact'` for a bare "View on amazon →" CTA.                 |

---

## 5. Usage examples

### Inline variant (in-article card)

```tsx
<AmazonProductCard
  variant="inline"
  title="Magnesium Glycinate 400 mg"
  brand="Doctor's Best"
  description="Highly bioavailable chelated form — gentle on the stomach."
  href="https://www.amazon.com/dp/B000BD0RT0?tag=clareohealth-20"
/>
```

### Tier variant (Best Fit)

```tsx
<AmazonProductCard
  variant="tier"
  tier="best-fit"
  priceLevel="$$"
  title="Vitamin D3 5000 IU with K2"
  brand="Thorne"
  description="NSF-certified. Clinically dosed with MK-7 for synergy."
  href="https://www.amazon.com/dp/B07PXYZ?tag=clareohealth-20"
/>
```

### Compact variant (fallback CTA button)

```tsx
<AmazonProductCard
  variant="compact"
  title="Zinc Picolinate"
  brand=""
  href="https://www.amazon.com/s?k=zinc+picolinate&tag=clareohealth-20"
/>
```

---

## 6. Migration checklist

These are the NutriGenius call-sites that were replaced with
`AmazonProductCard`. Replicate the same replacements on Dermawise.

| # | NutriGenius file                                        | Before                                                                          | After                                                                                      |
| - | ------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1 | `app/results/page.tsx` (WhereToBuy, ~line 108–130)      | 3-tier mapping over `AffiliateTierCard` + fallback `<a>` when no curated product | `AmazonProductCard` tier cards + `AmazonProductCard variant="compact"` fallback            |
| 2 | `app/blog/[slug]/page.tsx` ("Products Mentioned", ~L988) | `TIER_ORDER.map(...)` over `AffiliateTierCard`                                  | `TIER_ORDER.map(...)` over `AmazonProductCard variant="tier"`                              |
| 3 | `app/blog/[slug]/page.tsx` (`affiliateCardHtml`, ~L583) | Raw-HTML card injected via `dangerouslySetInnerHTML` with hardcoded hex colors  | Same raw-HTML structure, but every color is now `var(--color-*)` — no hardcoded hexes      |
| 4 | `src/components/ui/AffiliateTierCard.tsx`                | Standalone 3-tier card component                                                | **Deleted** — superseded by `AmazonProductCard`                                            |
| — | `src/components/ui/AmazonLogo.tsx`                       | (unchanged)                                                                     | Still used internally by `AmazonProductCard`; wordmark stays `#FF9900` per Amazon TOS.     |
| — | `src/lib/data/amazonProducts.ts`                         | (unchanged)                                                                     | Data layer: `getAmazonProductLink(asin, countryCode)`, `getAmazonSearchLink(term, ...)`, `getProductsForSupplement(name)`, `getProductsForArticle(slug)`. Reuse as-is or reimplement per site. |

On Dermawise, the equivalent files will be under the Dermawise routes (e.g.
`app/quiz/results/page.tsx`, `app/blog/[slug]/page.tsx`). Apply the same
three replacements and delete any Dermawise-specific `AffiliateTierCard`
equivalent.

### Raw-HTML inline card — Dermawise note

If Dermawise also injects Amazon cards into blog prose via
`dangerouslySetInnerHTML`, copy the NutriGenius pattern where every inline
style uses `var(--color-surface)`, `var(--color-text)`, `var(--color-text-muted)`,
`var(--color-border)` — not hex. That way, a single call-site picks up the
brand automatically.
