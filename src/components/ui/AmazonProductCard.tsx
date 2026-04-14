import { Star, Gem, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AmazonLogo } from "./AmazonLogo";

/**
 * Shared Amazon affiliate product card.
 *
 * Depends exclusively on the NutriGenius brand token contract defined in
 * `globals.css` (`--color-primary`, `--color-accent`, `--color-surface`,
 * `--color-border`, `--color-text`, `--color-text-muted`,
 * `--color-primary-foreground`). No hardcoded brand hexes anywhere — the
 * component is portable to any sibling site that defines the same tokens.
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

// ──────────────────────────────────────────────────────────────────
// Shared bits
// ──────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────
// Variants
// ──────────────────────────────────────────────────────────────────

function TierCard({
  title,
  brand,
  description,
  href,
  tier,
  priceLevel,
  imageUrl,
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
            <span className="text-[10px] font-semibold text-text">
              {priceLevel}
            </span>
          )}
        </div>
        <p className="text-[13px] font-semibold text-text leading-snug">
          {brand} <span className="font-normal text-text-muted">{title}</span>
        </p>
        {description && (
          <p className="text-[11px] text-text-muted leading-snug mt-0.5">
            {description}
          </p>
        )}
      </div>
      <ViewOnAmazonButton href={href} />
    </div>
  );
}

function InlineCard({
  title,
  brand,
  description,
  href,
  imageUrl,
}: AmazonProductCardProps) {
  return (
    <div className="bg-surface ring-1 ring-border rounded-xl shadow-sm shadow-black/[0.03] p-4 flex items-center gap-3">
      {imageUrl && <ProductImage src={imageUrl} alt={`${brand} ${title}`} />}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-text leading-snug">
          {title}
        </p>
        <p className="text-[12px] text-text-muted leading-snug mt-0.5">
          {brand}
        </p>
        {description && (
          <p className="text-[11px] text-text-muted leading-snug mt-0.5">
            {description}
          </p>
        )}
      </div>
      <ViewOnAmazonButton href={href} />
    </div>
  );
}

function CompactCard({ href }: AmazonProductCardProps) {
  return <ViewOnAmazonButton href={href} />;
}

// ──────────────────────────────────────────────────────────────────
// Entry
// ──────────────────────────────────────────────────────────────────

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
