#!/bin/bash

# ============================================
# COMMANDES UTILES NAVESTATS
# ============================================

# 📦 Installation et setup
echo "=== Installation ==="
npm install
npm run build

# 🧪 Développement
echo "=== Développement ==="
npm run dev              # Démarrer le serveur de développement
npm run lint             # Vérifier le linting
npm run type-check       # Vérifier les types TypeScript

# 🗄️ Base de données
echo "=== Base de données ==="
# Exécuter les migrations Supabase
# 1. Aller sur https://app.supabase.com
# 2. Sélectionner le projet
# 3. Aller dans SQL Editor
# 4. Copier le contenu de supabase/migrations/add_new_features.sql
# 5. Exécuter

# 🧪 Tests
echo "=== Tests ==="
npm run test             # Lancer les tests
npm run test:watch       # Tests en mode watch
npm run test:coverage    # Couverture de tests

# 📊 Performance
echo "=== Performance ==="
npm run build            # Build de production
npm run analyze          # Analyser la taille du bundle

# 🚀 Déploiement
echo "=== Déploiement ==="
# Sur Vercel (automatique avec git push)
git push origin main

# 📝 Documentation
echo "=== Documentation ==="
# Générer la documentation
npm run docs

# 🔍 Vérifications
echo "=== Vérifications ==="
# Vérifier les types
npx tsc --noEmit

# Vérifier le linting
npx eslint src/

# Vérifier les dépendances
npm audit

# 🧹 Nettoyage
echo "=== Nettoyage ==="
rm -rf .next              # Supprimer le cache Next.js
rm -rf node_modules       # Supprimer les dépendances
npm cache clean --force   # Nettoyer le cache npm

# 📱 Tests sur mobile
echo "=== Tests mobile ==="
# Accéder à http://localhost:8080 depuis un appareil mobile
# sur le même réseau

# 🔐 Sécurité
echo "=== Sécurité ==="
npm audit fix             # Corriger les vulnérabilités
npm audit                 # Vérifier les vulnérabilités

# 📊 Analytics
echo "=== Analytics ==="
# Vérifier les Core Web Vitals
# Utiliser Google PageSpeed Insights
# https://pagespeed.web.dev/

# 🐛 Debugging
echo "=== Debugging ==="
# Activer les logs de debug
DEBUG=* npm run dev

# Utiliser React DevTools
# https://react-devtools-tutorial.vercel.app/

# 🔄 Mise à jour des dépendances
echo "=== Mise à jour ==="
npm outdated             # Voir les dépendances obsolètes
npm update               # Mettre à jour les dépendances
npm update --save        # Mettre à jour et sauvegarder

# 📋 Checklist avant déploiement
echo "=== Checklist avant déploiement ==="
echo "✅ Migrations Supabase exécutées"
echo "✅ Composants intégrés"
echo "✅ Tests passés"
echo "✅ Pas d'erreurs console"
echo "✅ Performance acceptable"
echo "✅ Responsive design OK"
echo "✅ Accessibilité OK"
echo "✅ Sécurité validée"

# 🚀 Déploiement en production
echo "=== Déploiement production ==="
# 1. Créer une branche de release
git checkout -b release/v1.0.0

# 2. Mettre à jour la version
npm version minor

# 3. Pousser les changements
git push origin release/v1.0.0

# 4. Créer une pull request
# 5. Merger après approbation
# 6. Vercel déploiera automatiquement

# 📞 Support et aide
echo "=== Support ==="
echo "Documentation: IMPLEMENTATION_GUIDE.md"
echo "Résumé: README_FEATURES.md"
echo "Checklist: INTEGRATION_CHECKLIST.md"
echo "Résumé complet: SUMMARY.md"

# 🎯 Commandes rapides
echo "=== Commandes rapides ==="
echo "npm run dev              # Démarrer le dev"
echo "npm run build            # Build production"
echo "npm run lint             # Vérifier le linting"
echo "npm run test             # Lancer les tests"
echo "npm audit                # Vérifier la sécurité"
