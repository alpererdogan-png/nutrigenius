const AMAZON_TAG = "clareohealth-20";
const AMAZON_BASE = "https://www.amazon.com/s";

/**
 * Returns an Amazon UK search affiliate link for a supplement.
 * Falls back to UK store for all regions.
 */
export function getAmazonLink(supplementName: string, form?: string): string {
  const query = form
    ? `${supplementName} ${form} supplement`
    : `${supplementName} supplement`;
  const encoded = encodeURIComponent(query);
  return `${AMAZON_BASE}?k=${encoded}&tag=${AMAZON_TAG}`;
}
