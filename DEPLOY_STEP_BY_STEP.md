# 🚀 Guide de déploiement étape par étape

## ⏱️ Temps estimé: 15-20 minutes

---

## 📋 ÉTAPE 1: Préparer le code local (5 min)

### 1.1 Ouvrir le terminal
```bash
cd /Users/owner-2/Desktop/NavéStats/navestats
```

### 1.2 Vérifier le statut Git
```bash
git status
```

Vous devriez voir les fichiers créés en rouge (non stagés).

### 1.3 Ajouter tous les fichiers
```bash
git add .
```

### 1.4 Vérifier que le build passe
```bash
npm run build
```

Si le build échoue, vérifier les erreurs et les corriger.

### 1.5 Créer un commit
```bash
git commit -m "feat: add all new features (pagination, filters, tabs, search, charts, trending, badges, social, follow, notifications)"
```

---

## 📋 ÉTAPE 2: Pousser le code sur GitHub (2 min)

### 2.1 Pousser les changements
```bash
git push origin main
```

### 2.2 Vérifier sur GitHub
Aller sur: https://github.com/votre-username/navestats

Vérifier que les fichiers sont bien poussés.

---

## 📋 ÉTAPE 3: Vercel déploie automatiquement (5-10 min)

### 3.1 Aller sur le dashboard Vercel
https://vercel.com/dashboard

### 3.2 Sélectionner le projet "navestats"

### 3.3 Attendre le déploiement
Vous devriez voir:
- Status: "Building" → "Ready"
- URL: https://navestats.site

### 3.4 Vérifier le déploiement
Cliquer sur le déploiement pour voir les logs.

---

## 📋 ÉTAPE 4: Exécuter les migrations Supabase (5 min)

### 4.1 Aller sur Supabase
https://app.supabase.com

### 4.2 Sélectionner le projet NavéStats

### 4.3 Aller dans "SQL Editor"
Menu gauche → SQL Editor

### 4.4 Créer une nouvelle query
Cliquer sur "New Query"

### 4.5 Copier le contenu des migrations
Ouvrir le fichier: `supabase/migrations/add_new_features.sql`

Copier tout le contenu.

### 4.6 Coller dans Supabase
Coller le contenu dans l'éditeur SQL.

### 4.7 Exécuter la query
Cliquer sur "Run" ou Ctrl+Enter

### 4.8 Vérifier que tout s'est bien passé
Vous devriez voir:
- ✅ Toutes les tables créées
- ✅ Tous les index créés
- ✅ Toutes les politiques RLS créées

---

## 📋 ÉTAPE 5: Vérifier le site en ligne (5 min)

### 5.1 Aller sur le site
https://navestats.site

### 5.2 Tester les nouvelles fonctionnalités

#### Test 1: Pagination
1. Aller sur `/classements`
2. Vérifier que 12 items s'affichent
3. Cliquer sur "Suivant"
4. Vérifier que la page change

#### Test 2: Filtres
1. Cliquer sur "Filtres avancés"
2. Sélectionner un quartier
3. Vérifier que la liste se filtre
4. Réinitialiser les filtres

#### Test 3: Recherche
1. Taper dans la barre de recherche
2. Vérifier que les résultats s'affichent
3. Cliquer sur un résultat
4. Vérifier la navigation

#### Test 4: Tabs (sur mobile)
1. Ouvrir sur mobile
2. Vérifier les tabs
3. Cliquer sur "Équipes"
4. Vérifier que le contenu change

#### Test 5: Graphiques
1. Aller sur une page d'équipe
2. Vérifier que les graphiques s'affichent
3. Vérifier les données

### 5.3 Vérifier la console
Ouvrir les DevTools (F12)
Vérifier qu'il n'y a pas d'erreurs rouges.

### 5.4 Vérifier les performances
Aller sur: https://pagespeed.web.dev/
Entrer: https://navestats.site
Vérifier les Core Web Vitals.

---

## ✅ Checklist finale

- [ ] Code poussé sur GitHub
- [ ] Vercel a déployé avec succès
- [ ] Migrations Supabase exécutées
- [ ] Site accessible sur https://navestats.site
- [ ] Pagination fonctionne
- [ ] Filtres fonctionnent
- [ ] Recherche fonctionne
- [ ] Tabs fonctionnent (mobile)
- [ ] Graphiques s'affichent
- [ ] Pas d'erreurs console
- [ ] Performance acceptable

---

## 🐛 Dépannage

### Le build échoue
```bash
# 1. Vérifier les erreurs
npm run build

# 2. Nettoyer et réessayer
rm -rf .next node_modules
npm install
npm run build
```

### Les migrations Supabase échouent
1. Vérifier que vous êtes connecté à Supabase
2. Vérifier que le projet est correct
3. Vérifier que les tables n'existent pas déjà
4. Exécuter les migrations une par une

### Le site ne se met pas à jour
1. Vérifier que le push est bien fait: `git log --oneline -5`
2. Vérifier sur Vercel que le déploiement est en cours
3. Forcer un redéploiement sur Vercel

### Les nouvelles fonctionnalités ne s'affichent pas
1. Vider le cache du navigateur (Ctrl+Shift+Delete)
2. Vérifier que les migrations Supabase sont exécutées
3. Vérifier la console pour les erreurs

---

## 📞 Support

- **Documentation**: Lire QUICKSTART.md
- **Erreurs**: Vérifier la console du navigateur
- **Logs Vercel**: https://vercel.com/dashboard
- **Supabase**: https://app.supabase.com

---

## 🎉 Résultat final

Après ces étapes, vous devriez avoir:
- ✅ Classements avancés avec pagination et filtres
- ✅ Recherche rapide et intuitive
- ✅ Statistiques détaillées avec graphiques
- ✅ Système de gamification avec badges
- ✅ Système social avec follow et partage
- ✅ Notifications en temps réel
- ✅ Design responsive et moderne
- ✅ Performance optimisée

**Prêt à lancer! 🚀**

---

**Créé avec ❤️ pour NavéStats**
