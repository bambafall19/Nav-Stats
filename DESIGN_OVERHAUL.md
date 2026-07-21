# 🎨 Refonte Design NavéStats - Inspiration Football App Moderne

## 📱 Design Reference
Basé sur l'app football fournie : dark theme, vert néon, cards glass, bottom nav centrale.

## 🎨 Nouveau Design System

### Couleurs (Dark Theme + Accents Football)
```css
/* Backgrounds */
--bg-primary: #0a0f0d;
--bg-secondary: #111916;
--bg-card: #161f1a;
--bg-elevated: #1c2722;
--bg-overlay: rgba(22, 31, 26, 0.92);

/* Accents */
--accent-primary: #39FF14; /* Vert néon football */
--accent-secondary: #00ff88;
--accent-gold: #FFD700;
--accent-red: #FF3B3B;
--accent-blue: #00B4D8;

/* Text */
--text-primary: #ffffff;
--text-secondary: #b8c4bf;
--text-muted: #6b7c75;
--text-on-accent: #0a0f0d;

/* Borders */
--border: rgba(57, 255, 20, 0.15);
--border-subtle: rgba(255, 255, 255, 0.06);
```

### Typography
- **Headings**: Aeonik Bold (déjà utilisé)
- **Body**: Inter Regular
- **Stats**: Outfit Black
- **Tabs/Labels**: Space Grotesk

### Composants Clés

#### 1. Bottom Navigation (Style Image)
```
┌────────────────────────────────────┐
│  🏠    📅    ➕    📊    👤       │
│ Home  Match  Add  Stats  Profile   │
└────────────────────────────────────┘
- Floating FAB centrale (vert néon)
- 5 icons avec labels
- Background glass morphism
- Active state: vert accent
```

#### 2. Match Cards (Modernes)
```
┌──────────────────────────────────────┐
│ [Live] Poule A                       │
│                                      │
│   [Logo A]   VS   [Logo B]           │
│   ASC Khom       ASC Ndia            │
│                                      │
│   📍 Stade de Khombole               │
│   🕐 17:00                           │
│   🎯 Pronostiquer →                  │
└──────────────────────────────────────┘
- Layout centré avec logos carrés
- Badge live animé
- Gradient overlay sur image background
```

#### 3. Stats Cards (Glassmorphism)
```
┌──────────────────────────────────────┐
│ 🏆 Points                             │
│ 1,247                                 │
│ ████████░░ 78% de l'objectif          │
└──────────────────────────────────────┘
- Background: gradient vert transparent
- Border: 1px vert
- Progress bar intégrée
```

#### 4. Live Match Banner
```
┌──────────────────────────────────────┐
│ ⚽ LIVE                                 │
│ Arsenal 2 - 0 Leicester               │
│ 56:19'                                 │
│ [Watch Now]                            │
└──────────────────────────────────────┘
- Full width card
- Red live indicator
- CTA gradient button
```

#### 5. Tabs Style (Arrondis)
```
┌──────────┬──────────┬──────────┐
│  Soccer  │ Basketball│ Football │
│  ⚽      │  🏀      │  🏈     │
└──────────┴──────────┴──────────┘
- Circular icons
- Active: filled accent
- Inactive: outlined gray
```

## 🛠️ Plan d'Implémentation

### Phase 1: Theme & Global Styles
- [ ] Créer variables CSS dark theme
- [ ] Ajouter toggle dark/light mode
- [ ] Update globals.css avec nouveau design system
- [ ] Update Tailwind config

### Phase 2: Header & Nav
- [ ] Redesign header: glass morphism, search, notifications
- [ ] Refactor mobile bottom nav: FAB centrale, icons style image
- [ ] Add haptic feedback simulation

### Phase 3: Components
- [ ] Redesign HeroSection: dark gradient, stats bandeau
- [ ] Redesign MatchCard: layout moderne, badges live
- [ ] Redesign PronosticCard: style football
- [ ] Redesign ClassementCard: glass cards, avatars circulaires
- [ ] Update buttons: neon effect, gradients

### Phase 4: Pages
- [ ] Homepage: sections modernes (Highlights, Live, News)
- [ ] Matchs: calendar view + list view
- [ ] Pronostics: cards redesign
- [ ] Classements: top 3 podium + trending
- [ ] Profil: stats dashboard style

### Phase 5: Animations
- [ ] Micro-interactions (hover, press)
- [ ] Page transitions
- [ ] Live pulse animations
- [ ] Confetti on predictions

## 🎨 Assets Nécessaires
- Icons: Lucide React (déjà installé)
- Fonts: Aeonik, Inter, Outfit (déjà configurés)
- Images: placeholder gradients si pas d'images équipes

## 📐 Spacing & Layout
```
Mobile: 375px base
- Padding: 16px
- Gap: 12px
- Border radius: 16-24px

Tablet: 768px
- Padding: 24px
- Gap: 16px
- Border radius: 20px

Desktop: 1280px
- Padding: 40px
- Gap: 24px
- Border radius: 24px
```

## ✨ Features UI à Ajouter
1. **Pull to refresh** avec animation football
2. **Skeleton loaders** style shimmer vert
3. **Toast notifications** avec icônes
4. **Empty states** illustrés
5. **Error boundaries** avec retry button
6. **Tooltips** au long press mobile
7. **Haptic feedback** sur actions importantes

## 🚀 Performance
- Lazy load images avec blur placeholder
- Skeleton screens partout
- Code splitting par page
- Service worker pour offline mode
- Optimized fonts (subset)

## 📱 Mobile First Approach
Tous les components d'abord mobile, puis tablet, puis desktop.

---

**Goal**: Créer une expérience utilisateur moderne, rapide, et agréable qui rappelle les meilleures apps de football tout en gardant l'identité NavéStats.

**Inspiration**: Design football app fourni
**Target**: Dark theme prioritaire avec toggle light possible
**Timeline**: 2-3 jours pour redesign complet