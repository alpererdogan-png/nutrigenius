import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export type AffiliateProduct = {
  id: string;
  supplement_name: string;
  brand: string;
  product_name: string;
  affiliate_url: string;
  price_usd: number;
  halal_certified: boolean;
  quality_verified: boolean;
  available_countries: string[];
};

// Maps engine supplement names → seed supplement names for DB lookup
const SUPPLEMENT_ALIAS: Record<string, string> = {
  "coenzyme q10": "CoQ10",
  "coq10":        "CoQ10",
  "methylfolate": "Folate",
  "vitamin d":    "Vitamin D3",
  "fish oil":     "Omega-3",
  "inositol":     "Myo-Inositol",
  "lion's mane":  "Lion's Mane",
  "lions mane":   "Lion's Mane",
};

function normalizeSupplementName(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(SUPPLEMENT_ALIAS)) {
    if (lower === key || lower.includes(key)) return val;
  }
  return name;
}

// GET /api/affiliate-products?names=Vitamin D3,Magnesium&country=US&halal=false
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const rawNames = searchParams.get("names") ?? "";
  const country  = searchParams.get("country") ?? "";
  const halal    = searchParams.get("halal") === "true";

  if (!rawNames.trim()) {
    return NextResponse.json({});
  }

  const requestedNames = rawNames
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);

  const normalizedNames = requestedNames.map(normalizeSupplementName);
  const uniqueNames = [...new Set(normalizedNames)];

  try {
    const supabase = await createClient();

    // Fetch all products, filter by country if provided
    let query = supabase
      .from("affiliate_products")
      .select("*")
      .order("quality_verified", { ascending: false })
      .order("halal_certified", { ascending: false })
      .order("price_usd", { ascending: true });

    if (country) {
      query = query.contains("available_countries", [country]);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Affiliate products query error:", error);
      return NextResponse.json({}, { status: 500 });
    }

    const allProducts: AffiliateProduct[] = data ?? [];

    // Group products by requested supplement name
    const grouped: Record<string, AffiliateProduct[]> = {};

    for (let i = 0; i < requestedNames.length; i++) {
      const reqName = requestedNames[i];
      const normName = uniqueNames[i] ?? normalizeName(reqName);

      // Match products whose supplement_name contains the lookup term (case-insensitive)
      let matches = allProducts.filter((p) =>
        p.supplement_name.toLowerCase().includes(normName.toLowerCase()) ||
        normName.toLowerCase().includes(p.supplement_name.toLowerCase())
      );

      // If halal preference, sort halal-certified first
      if (halal) {
        matches = [
          ...matches.filter((p) => p.halal_certified),
          ...matches.filter((p) => !p.halal_certified),
        ];
      }

      grouped[reqName] = matches.slice(0, 3);
    }

    return NextResponse.json(grouped);
  } catch (err) {
    console.error("Affiliate products route error:", err);
    return NextResponse.json({}, { status: 500 });
  }
}

function normalizeName(name: string): string {
  return normalizeSupplementName(name);
}
