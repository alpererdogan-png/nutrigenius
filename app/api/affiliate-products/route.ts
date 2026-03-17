import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export type AffiliateProduct = {
  id: string;
  supplement_id: string;
  brand: string;
  product_name: string;
  affiliate_url: string;
  price_usd: number;
  halal_certified: boolean;
  quality_verified: boolean;
  available_countries: string[];
};

// GET /api/affiliate-products?names=Omega-3+Fatty+Acids,Berberine,Psyllium+Husk
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const rawNames = searchParams.get("names") ?? "";

  if (!rawNames.trim()) {
    return NextResponse.json({});
  }

  const names = rawNames
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);

  try {
    const supabase = await createClient();

    // Single JOIN query: affiliate_products → supplements, filter by supplement name
    const { data, error } = await supabase
      .from("affiliate_products")
      .select("*, supplements!inner(name)")
      .in("supplements.name", names)
      .order("quality_verified", { ascending: false })
      .order("halal_certified", { ascending: false })
      .order("price_usd", { ascending: true });

    if (error) {
      console.error("[affiliate-api] query failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by supplement name
    const grouped: Record<string, AffiliateProduct[]> = {};

    for (const name of names) {
      grouped[name] = [];
    }

    for (const row of data ?? []) {
      const suppName = (row.supplements as { name: string })?.name;
      if (suppName && grouped[suppName] !== undefined) {
        const { supplements: _, ...product } = row;
        grouped[suppName].push(product as AffiliateProduct);
      }
    }

    return NextResponse.json(grouped);
  } catch (err) {
    console.error("[affiliate-api] unhandled error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
