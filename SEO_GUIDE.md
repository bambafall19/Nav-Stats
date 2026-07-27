# SEO & Social Media Guide for NavéStats

## ✅ Completed Optimizations

### 1. Technical SEO
- ✅ **robots.txt**: Created in `/public/robots.txt` with proper directives
- ✅ **sitemap.ts**: Enhanced with proper priorities and change frequencies in `/src/app/sitemap.ts`
- ✅ **JSON-LD Structured Data**: Added to main pages for rich search results

### 2. Pages Optimized

#### Homepage (`src/app/(public)/page.tsx`)
- ✅ Optimized title: "NavéStats – Pronostics & Statistiques Navétanes Khombole 2026"
- ✅ Enhanced meta description with keywords
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Card metadata
- ✅ JSON-LD WebSite schema
- ✅ OG image reference: `/og-image.jpg`

#### Matches Page (`src/app/(public)/matchs/page.tsx`)
- ✅ Optimized title and description
- ✅ Open Graph tags
- ✅ Twitter Card metadata
- ✅ JSON-LD SportsEvent schema
- ✅ OG image reference: `/og-matchs.jpg`

#### Rankings Page (`src/app/(public)/classements/page.tsx`)
- ✅ Optimized title and description
- ✅ Open Graph tags
- ✅ Twitter Card metadata
- ✅ Enhanced with ItemList JSON-LD
- ✅ OG image reference: `/og-classements.jpg`

#### Pronostics Page (`src/app/(public)/pronostics/page.tsx`)
- ✅ Optimized title and description
- ✅ Open Graph tags
- ✅ Twitter Card metadata
- ✅ OG image reference: `/og-pronostics.jpg`

#### Statistics Page (`src/app/(public)/statistiques/page.tsx`)
- ✅ Optimized title and description
- ✅ Open Graph tags
- ✅ Twitter Card metadata
- ✅ OG image reference: `/og-statistiques.jpg`

#### Community Page (`src/app/(public)/communaute/page.tsx`)
- ✅ Optimized title and description
- ✅ Open Graph tags
- ✅ Twitter Card metadata
- ✅ OG image reference: `/og-communaute.jpg`

## 🆕 Required Actions

### 1. Create Social Sharing Images

Create the following images (1200x630px, JPG format, max 8MB):

```
/public/
├── og-image.jpg          # Homepage - Main site preview
├── og-matchs.jpg         # Matches/Calendar page
├── og-classements.jpg    # Rankings/Leaderboard page
├── og-pronostics.jpg     # My Predictions page
├── og-statistiques.jpg   # Statistics/Pools page
└── og-communaute.jpg     # Community page
```

**Image Specifications:**
- Dimensions: 1200x630 pixels (1.91:1 ratio)
- Format: JPG
- Max size: 8MB
- Include: Logo, site name, key messaging
- Brand colors: Green (#006233) and Gold (#FBBF00)

**Recommended Image Content:**
- **og-image.jpg**: Main NavéStats branding with "Pronostiquez, Analysez, Dominez"
- **og-matchs.jpg**: Football/stadium imagery with "Calendrier des Matchs"
- **og-classements.jpg**: Trophy/podium imagery with "Classements Pronostiqueurs"
- **og-pronostics.jpg**: Target/goal imagery with "Mes Pronostics"
- **og-statistiques.jpg**: Stats/chart imagery with "Poules & Statistiques"
- **og-communaute.jpg**: Community/conversation imagery with "Communauté"

**Quick Solution:**
Use a tool like [Canva](https://www.canva.com/) or [Figma](https://www.figma.com/) with templates for "Open Graph Image" to create these quickly. Use the brand colors from the design system.

### 2. Update Root Layout Metadata

Consider enhancing `src/app/layout.tsx` with:
```typescript
export const metadata: Metadata = {
  // ... existing metadata ...
  alternates: {
    canonical: 'https://navestats.site',
  },
  manifest: '/manifest.json',
}
```

### 3. Add Google Search Console

1. Verify site ownership in [Google Search Console](https://search.google.com/search-console)
2. Add verification meta tag to `src/app/layout.tsx`
3. Submit sitemap: `https://navestats.site/sitemap.xml`

### 4. Add Social Media Profiles

Consider adding to `src/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  // ... existing ...
  other: {
    'fb:app_id': 'YOUR_FACEBOOK_APP_ID',
  },
}
```

## 📊 SEO Features Implemented

### Search Engine Optimization
- ✅ Semantic HTML structure
- ✅ Proper heading hierarchy (H1, H2, H3)
- ✅ Meta titles and descriptions on all pages
- ✅ Canonical URLs via sitemap
- ✅ robots.txt configuration
- ✅ XML sitemap with priorities
- ✅ Structured data (JSON-LD) on key pages
- ✅ Mobile-responsive design
- ✅ Fast loading with Next.js optimizations
- ✅ PWA support for better UX

### Social Media Optimization
- ✅ Open Graph tags on all main pages
- ✅ Twitter Card metadata
- ✅ Social sharing images referenced (need to create)
- ✅ Proper content descriptions for sharing
- ✅ Site name and locale settings

### Content SEO
- ✅ Keyword-rich descriptions in French
- ✅ Relevant page titles with year (2026)
- ✅ Location-specific content (Khombole, Sénégal)
- ✅ Descriptive URL structure
- ✅ Rich internal linking structure

## 🎯 Keywords Targeted

### Primary Keywords
- Navétanes Khombole
- Pronostics football Sénégal
- Classements Navétanes
- Statistiques football Khombole

### Secondary Keywords
- Pronostiqueur Sénégal
- Poules A B C Navétanes
- Matchs football Khombole
- Top pronostiqueurs

### Long-tail Keywords
- "Plateforme pronostics Navétanes Khombole 2026"
- "Classement général pronostiqueurs Khombole"
- "Scores en direct Navétanes Zone 6"
- "Communauté pronostics football Sénégal"

## 🔍 Next Steps

1. **Immediate (Required):**
   - [ ] Create 6 social sharing images (1200x630px)
   - [ ] Upload images to `/public/` directory
   - [ ] Test with [Facebook Debugger](https://developers.facebook.com/tools/debug/)
   - [ ] Test with [Twitter Card Validator](https://cards-dev.twitter.com/validator)

2. **Short-term (1-2 weeks):**
   - [ ] Submit sitemap to Google Search Console
   - [ ] Submit sitemap to Bing Webmaster Tools
   - [ ] Create Google Business Profile (if applicable)
   - [ ] Add schema.org markup for Organization
   - [ ] Implement breadcrumb schema

3. **Medium-term (1 month):**
   - [ ] Create blog/content section for long-tail keywords
   - [ ] Add FAQ schema for common questions
   - [ ] Implement hreflang if targeting multiple languages
   - [ ] Add review/rating schema
   - [ ] Create team/player profile pages with unique content

## 📈 Monitoring

Track these metrics:
- Google Search Console: Impressions, clicks, CTR, position
- Bing Webmaster Tools: Same as above
- Social media: Shares, clicks, engagement
- Analytics: Organic traffic, bounce rate, time on page

## 📝 Notes

- All metadata is in French (fr-FR) for local SEO
- Site targets Sénégal specifically (address Country: SN)
- JSON-LD structured data follows schema.org standards
- Open Graph images should be optimized under 8MB
- Sitemap auto-updates via Next.js dynamic generation

---

**Created:** July 2026
**Site:** https://navestats.site
**Location:** Khombole, Sénégal