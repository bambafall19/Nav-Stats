# Guide d'intégration des nouvelles fonctionnalités NavéStats

## 📋 Résumé des implémentations

### 1. Performance & Technique

#### ✅ Skeleton Loader
- **Fichier**: `src/components/shared/Skeleton.tsx` (déjà existant)
- **Utilisation**: Importer `SkeletonList` pour afficher pendant le chargement

#### ✅ Pagination
- **Fichier**: `src/components/shared/Pagination.tsx`
- **Utilisation**:
```tsx
import { Pagination } from '@/components/shared/Pagination'

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

#### ✅ Cache avec React Query
- **Fichier**: `src/lib/hooks/useCache.ts`
- **Utilisation**:
```tsx
import { useClassementCache, useEquipesCache } from '@/lib/hooks/useCache'

const { classement, isLoading } = useClassementCache()
```

---

### 2. Design & UX Mobile

#### ✅ Tabs/Onglets
- **Fichier**: `src/components/shared/ClassementTabs.tsx`
- **Utilisation**:
```tsx
import { ClassementTabs } from '@/components/shared/ClassementTabs'

<ClassementTabs children={{
  pronostiqueurs: <PronostiqueursList />,
  equipes: <EquipesList />,
  quartiers: <QuartiersList />,
  asc: <ASCList />,
}} />
```

#### ✅ Filtres avancés
- **Fichier**: `src/components/shared/AdvancedFilters.tsx`
- **Utilisation**:
```tsx
import { AdvancedFilters } from '@/components/shared/AdvancedFilters'

<AdvancedFilters
  quartiers={quartiers}
  ascs={ascs}
  onFilterChange={setFilters}
/>
```

#### ✅ Graphiques statistiques
- **Fichier**: `src/components/shared/TeamStatsChart.tsx`
- **Utilisation**:
```tsx
import { TeamStatsChart } from '@/components/shared/TeamStatsChart'

<TeamStatsChart stats={teamStats} />
```

---

### 3. Fonctionnalités

#### ✅ Recherche rapide
- **Fichier**: `src/components/shared/QuickSearch.tsx`
- **API**: `src/app/api/search/route.ts`
- **Utilisation**:
```tsx
import { QuickSearch } from '@/components/shared/QuickSearch'

<QuickSearch onSearch={handleSearch} onSelect={handleSelect} />
```

#### ✅ Statistiques détaillées par équipe
- **Fichier**: `src/components/equipes/EquipeClient.tsx`
- **Inclut**: Graphiques, résumé, partage social

#### ✅ Comparaison équipes/pronostiqueurs
- **Fichier**: `src/components/shared/ComparisonChart.tsx`
- **Utilisation**:
```tsx
import { ComparisonChart } from '@/components/shared/ComparisonChart'

<ComparisonChart item1={user1} item2={user2} />
```

#### ✅ Notifications temps réel
- **Fichier**: `src/components/shared/RankingNotificationListener.tsx`
- **API**: `src/app/api/notifications/ranking/route.ts`
- **Utilisation**: Ajouter au layout principal
```tsx
import { RankingNotificationListener } from '@/components/shared/RankingNotificationListener'

<RankingNotificationListener />
```

---

### 4. Engagement

#### ✅ Badges/Achievements
- **Fichier**: `src/components/shared/BadgesDisplay.tsx`
- **Utilisation**:
```tsx
import { BadgesDisplay, ACHIEVEMENT_BADGES } from '@/components/shared/BadgesDisplay'

<BadgesDisplay badges={userBadges} />
```

#### ✅ Système Trending
- **Fichier**: `src/components/shared/TrendingList.tsx`
- **Utilisation**:
```tsx
import { TrendingList } from '@/components/shared/TrendingList'

<TrendingList items={trendingItems} period="semaine" />
```

#### ✅ Statistiques personnalisées
- **Fichier**: `src/components/shared/PersonalStatsDisplay.tsx`
- **Utilisation**:
```tsx
import { PersonalStatsDisplay } from '@/components/shared/PersonalStatsDisplay'

<PersonalStatsDisplay stats={personalStats} />
```

---

### 5. Social

#### ✅ Partage réseaux sociaux
- **Fichier**: `src/components/shared/SocialShareButtons.tsx`
- **Utilisation**:
```tsx
import { SocialShareButtons } from '@/components/shared/SocialShareButtons'

<SocialShareButtons
  title="Mon titre"
  text="Mon texte"
  url="https://..."
/>
```

#### ✅ Système de suivi (Follow)
- **Fichier**: `src/components/shared/FollowSystem.tsx`
- **API**: `src/app/api/follow/route.ts`
- **Utilisation**:
```tsx
import { FollowButton, FollowersList } from '@/components/shared/FollowSystem'

<FollowButton userId={userId} isFollowing={isFollowing} onFollowChange={handleFollow} />
<FollowersList followers={followers} />
```

#### ✅ Commentaires/Réactions
- **Fichier**: `src/components/communaute/CommentSection.tsx` (déjà existant)

---

## 🔧 Intégration dans la page classements

Remplacer le contenu de `src/app/(public)/classements/page.tsx` par:

```tsx
import { createClient } from '@/lib/supabase/server'
import { ClassementsClient } from '@/components/classements/ClassementsClient'

export default async function ClassementsPage() {
  const supabase = await createClient()

  // Récupérer les données...
  const { data: classementGeneral } = await supabase
    .from('profiles')
    .select('*')
    .order('points', { ascending: false })
    .limit(100) // Augmenté pour la pagination

  // ... autres requêtes

  return (
    <div className="page-content">
      <div className="container-app">
        <ClassementsClient
          classementGeneral={classementGeneral || []}
          classementQuartier={classementQuartier}
          classementASC={classementASC}
          equipesRanked={equipesRanked}
        />
      </div>
    </div>
  )
}
```

---

## 📊 Intégration dans la page profil

Utiliser `src/components/profil/UserProfileClient.tsx`:

```tsx
import { UserProfileClient } from '@/components/profil/UserProfileClient'

<UserProfileClient
  user={user}
  followers={followers}
  isFollowing={isFollowing}
  onFollowChange={handleFollowChange}
/>
```

---

## ⚽ Intégration dans la page équipe

Utiliser `src/components/equipes/EquipeClient.tsx`:

```tsx
import { EquipeClient } from '@/components/equipes/EquipeClient'

<EquipeClient equipe={equipe} stats={stats} />
```

---

## 🗄️ Migrations Supabase requises

Créer les tables suivantes:

```sql
-- Table pour les followers
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  follower_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, follower_id)
);

-- Table pour les notifications de classement
CREATE TABLE ranking_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('up', 'down')),
  old_rank INT NOT NULL,
  new_rank INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_followers_user_id ON followers(user_id);
CREATE INDEX idx_ranking_notifications_user_id ON ranking_notifications(user_id);
```

---

## 🚀 Prochaines étapes

1. **Tester les composants** dans le navigateur
2. **Ajuster les styles** selon votre design system
3. **Implémenter les endpoints API** manquants
4. **Configurer les notifications** en temps réel (WebSocket/SSE)
5. **Ajouter les animations** avec Framer Motion
6. **Optimiser les performances** avec React Query

---

## 📝 Notes importantes

- Tous les composants utilisent les variables CSS existantes (`--color-primary`, etc.)
- Les composants sont responsifs et mobiles-first
- Recharts est déjà dans les dépendances
- React Query est configuré pour le caching automatique
- Les emojis sont utilisés pour une meilleure UX visuelle
