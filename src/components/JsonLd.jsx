/**
 * Injects a Schema.org JSON-LD script tag for a vendor (FoodEstablishment).
 * Google uses this for rich results: stars, price range, location.
 */
export default function JsonLd({ vendor }) {
  if (!vendor?.shop) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: vendor.shop,
    description: vendor.description
      || `Samboussas comoriens artisanaux à ${vendor.city}. Commandez sur WhatsApp.`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: vendor.city,
      addressCountry: 'FR',
    },
    servesCuisine: ['Comorian', 'African'],
    url: `https://osamboussa.vercel.app/vendeur/${vendor.id}`,
    ...(vendor.tel ? { telephone: `+${String(vendor.tel).replace(/\D/g, '')}` } : {}),
    ...(vendor.from ? { priceRange: `dès ${vendor.from.toFixed(2)} €` } : {}),
    ...(vendor.photo || vendor.logo ? { image: vendor.photo || vendor.logo } : {}),
    ...(vendor.rating > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: vendor.rating,
        bestRating: 5,
        worstRating: 1,
        reviewCount: Math.max(vendor.reviews || 1, 1),
      },
    } : {}),
    ...(vendor.types?.length > 0 ? {
      hasMenuItem: vendor.types.map(t => ({
        '@type': 'MenuItem',
        name: `Samboussa ${t}`,
        suitableForDiet: 'https://schema.org/HalalDiet',
      })),
    } : {}),
    ...(vendor.instagram ? {
      sameAs: [`https://instagram.com/${vendor.instagram}`],
    } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
