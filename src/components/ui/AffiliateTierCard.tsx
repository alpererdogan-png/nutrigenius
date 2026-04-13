import { Star, Gem, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AmazonProduct } from "@/src/lib/data/amazonProducts";
import {
  getAmazonProductLink,
  getAmazonSearchLink,
} from "@/src/lib/data/amazonProducts";
import { AmazonLogo } from "./AmazonLogo";

export type TierKey = "best" | "premium" | "budget";

interface TierStyle {
  icon: LucideIcon;
  label: string;
  priceRange: "$" | "$$" | "$$$";
  iconColor: string;
  labelColor: string;
  cardBg: string;
  cardBorder: string;
  iconFill: boolean;
}

// NutriGenius brand palette — mirrors the hex values already in use across
// results/blog/landing. All three tiers share the same card chrome
// (white surface, #E8ECF1 border, teal accent). Tiers differentiate via
// icon + label only, keeping the Amazon cards visually aligned with the
// rest of the site.
export const TIER_STYLES: Record<TierKey, TierStyle> = {
  best: {
    icon: Star,
    label: "Best Fit",
    priceRange: "$$",
    iconColor: "text-[#00685f]",
    labelColor: "text-[#00685f]",
    cardBg: "bg-white",
    cardBorder: "ring-[#E8ECF1]",
    iconFill: true,
  },
  premium: {
    icon: Gem,
    label: "Premium",
    priceRange: "$$$",
    iconColor: "text-[#00685f]",
    labelColor: "text-[#1A2332]",
    cardBg: "bg-white",
    cardBorder: "ring-[#E8ECF1]",
    iconFill: true,
  },
  budget: {
    icon: Tag,
    label: "Budget",
    priceRange: "$",
    iconColor: "text-[#00685f]",
    labelColor: "text-[#1A2332]",
    cardBg: "bg-white",
    cardBorder: "ring-[#E8ECF1]",
    iconFill: false,
  },
};

export const TIER_ORDER: TierKey[] = ["best", "premium", "budget"];

interface AffiliateTierCardProps {
  tier: TierKey;
  product: AmazonProduct;
  /** ISO 2-letter country code for geo-routing */
  countryCode?: string;
  /** Search fallback term when product has no ASIN */
  fallbackSearchTerm?: string;
}

export function AffiliateTierCard({
  tier,
  product,
  countryCode,
  fallbackSearchTerm,
}: AffiliateTierCardProps) {
  const style = TIER_STYLES[tier];
  const Icon = style.icon;
  const href = product.asin
    ? getAmazonProductLink(product.asin, countryCode)
    : getAmazonSearchLink(fallbackSearchTerm ?? `${product.brand} ${product.name}`, undefined, countryCode);

  return (
    <div
      className={`${style.cardBg} ring-1 ${style.cardBorder} rounded-xl p-4 flex items-center gap-4`}
    >
      <div className="w-10 h-10 rounded-full bg-[#F0FDFA] flex items-center justify-center flex-shrink-0 ring-1 ring-[#E8ECF1]">
        <Icon
          className={`w-4 h-4 ${style.iconColor}`}
          fill={style.iconFill ? "currentColor" : "none"}
          strokeWidth={style.iconFill ? 1.5 : 2}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${style.labelColor}`}>
            {style.label}
          </span>
          <span className={`text-[10px] font-semibold ${style.labelColor}`}>
            {style.priceRange}
          </span>
        </div>
        <p className="text-[13px] font-semibold text-[#1A2332] leading-snug">
          {product.brand} <span className="font-normal text-[#5A6578]">{product.name}</span>
        </p>
        <p className="text-[11px] text-[#5A6578] leading-snug mt-0.5">
          {product.description}
        </p>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center gap-1.5 bg-white border border-black/[0.08] hover:border-[#00685f]/30 hover:bg-[#f0fdfa] text-[#111c2c] text-xs font-medium px-4 py-2 rounded-full transition-colors flex-shrink-0"
      >
        View on <AmazonLogo className="h-[14px] w-auto" /> →
      </a>
    </div>
  );
}
