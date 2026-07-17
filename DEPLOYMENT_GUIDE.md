# 🚀 Guide de déploiement sur Vercel

## Prérequis
- Compte Vercel (https://vercel.com)
- Git configuré
- Accès au repository GitHub

## 📋 Étapes de déploiement

### Étape 1: Préparer le code local (5 min)

```bash
# 1. Vérifier que tout est à jour
cd /Users/owner-2/Desktop/NavéStats/navestats

# 2. Vérifier le statut Git
git status

# 3. Ajouter tous les fichiers
git add .

# 4. Créer un commit
git commit -m "feat: add all new features (pagination, filters, tabs, search, graphiques, trending, badges, social, follow, notifications)"

# 5. Vérifier que le build passe
npm run build

# 6. Vérifier le linting
npm run lint
```

### Étape 2: Exécuter les migrations Supabase (10 min)

```bash
# 1. Aller sur https://app.supabase.com
# 2. Sélectionner votre projet NavéStats
# 3. Aller dans "SQL Editor"
# 4. Créer une nouvelle query
# 5. Copier le contenu de: supabase/migrations/add_new_features.sql
# 6. Exécuter la query
# 7. Vérifier que toutes les tables sont créées
```

### Étape 3: Pousser le code sur GitHub (2 min)

```bash
# 1. Pousser les changements
git push origin main

# 2. Vérifier sur GitHub que les fichiers sont bien poussés
# https://github.com/votre-username/navestats
```

### Étape 4: Déployer sur Vercel (Automatique)

```
Vercel détectera automatiquement le push et commencera le déploiement.

1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet "navestats"
3. Attendre que le déploiement se termine
4. Vérifier que le déploiement est réussi
```

### Étape 5: Vérifier le déploiement (5 min)

```bash
# 1. Aller sur https://navestats.site
# 2. Vérifier que le site fonctionne
# 3. Tester les nouvelles fonctionnalités:
#    - Pagination sur /classements
#    - Filtres avancés
#    - Tabs
#    - Recherche
#    - Graphiques
#    - Notifications
# 4. Vérifier la console pour les erreurs
# 5. Vérifier les Core Web Vitals
```

---

## 🔧 Commandes utiles

```bash
# Vérifier le build
npm run build

# Vérifier le linting
npm run lint

# Vérifier les types TypeScript
npx tsc --noEmit

# Vérifier la sécurité
npm audit

# Nettoyer le cache
rm -rf .next
npm cache clean --force
```

---

## 📊 Checklist avant déploiement

- [ ] Tous les fichiers sont créés
- [ ] Les migrations Supabase sont exécutées
- [ ] Le build passe sans erreur
- [ ] Pas d'erreurs TypeScript
- [ ] Pas d'erreurs de linting
- [ ] Les tests passent
- [ ] Les composants sont intégrés
- [ ] Pas d'erreurs console
- [ ] Performance acceptable
- [ ] Responsive design OK

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
```
1. Vérifier que vous êtes connecté à Supabase
2. Vérifier que le projet est correct
3. Vérifier que les tables n'existent pas déjà
4. Exécuter les migrations une par une
```

### Le site ne se met pas à jour
```bash
# 1. Vérifier que le push est bien fait
git log --oneline -5

# 2. Vérifier sur Vercel que le déploiement est en cours
# https://vercel.com/dashboard

# 3. Forcer un redéploiement
# Aller sur Vercel > Deployments > Redeploy
```

---

## 📞 Support

- **Documentation**: Lire QUICKSTART.md
- **Erreurs**: Vérifier la console du navigateur
- **Logs**: Vérifier les logs Vercel
- **Supabase**: Vérifier le dashboard Supabase

---

## ✅ Après le déploiement

1. Vérifier que le site fonctionne
2. Tester les nouvelles fonctionnalités
3. Vérifier les performances
4. Recueillir les retours utilisateurs
5. Corriger les bugs éventuels

---

**Créé avec ❤️ pour NavéStats**
