# Guide de Déploiement - NavéStats

## 🚀 Problème : Le site en ligne ne se met pas à jour

Si vous avez fait des modifications en local mais que le site `https://navestats.site` ne se met pas à jour, suivez ces étapes.

## 📋 Étapes de déploiement

### Option 1 : Déploiement automatique (Recommandé)

Si votre projet est connecté à Vercel :

1. **Poussez vos modifications vers Git**
   ```bash
   cd navestats
   git add .
   git commit -m "Update: new features and SEO improvements"
   git push origin main  # ou master selon votre branche
   ```

2. **Vercel déploiera automatiquement**
   - Vercel détecte le push
   - Build automatique en 2-3 minutes
   - Le site se met à jour tout seul

### Option 2 : Déploiement manuel avec Vercel CLI

```bash
# 1. Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Déployer
cd navestats
vercel --prod
```

### Option 3 : Si vous utilisez un autre hébergeur

#### Netlify
```bash
# Build local
npm run build

# Déployer le dossier .next
# Ou connecter votre repo GitHub à Netlify pour auto-deploy
```

#### Serveur VPS/Dédié
```bash
# 1. Build sur votre serveur
npm run build

# 2. Démarrer le serveur
npm start

# Ou avec PM2 pour la production
pm2 start npm --name "navestats" -- start
```

## 🔍 Vérifications avant déploiement

### 1. Vérifier que le build fonctionne localement
```bash
cd navestats
npm run build
```
✅ Si le build réussit, passez à l'étape 2

### 2. Vérifier les variables d'environnement
Assurez-vous que ces variables sont définies sur votre hébergeur (pas en local .env.local) :

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
```

### 3. Vérifier la configuration Next.js
Le fichier `next.config.ts` doit être présent et correct.

## 🐛 Problèmes courants

### Problème : "La page ne se met pas à jour"
**Solution :**
1. Vider le cache du navigateur (Ctrl+Shift+R / Cmd+Shift+R)
2. Attendre 2-3 minutes après le déploiement
3. Vérifier que le déploiement a réussi sur Vercel/Netlify

### Problème : "Erreur 500 sur le site en ligne"
**Solution :**
1. Vérifier les logs sur Vercel (Dashboard → Deployments → Logs)
2. Vérifier que les variables d'environnement sont bien définies
3. Vérifier que Supabase est accessible

### Problème : "Les notifications ne fonctionnent pas en production"
**Solution :**
- Vérifier que la table `notifications` existe dans Supabase
- Vérifier les politiques RLS (Row Level Security)
- Vérifier que l'admin a bien `is_admin = true`

## 📊 Pour vérifier que le déploiement a fonctionné

1. **Aller sur** : https://navestats.site
2. **Ouvrir les DevTools** (F12)
3. **Aller dans l'onglet "Network"**
4. **Actualiser la page**
5. **Vérifier le fichier** `.next/static/...` pour voir la version

Ou plus simple :
- Ajouter un élément unique temporaire (ex: un émoji dans le titre)
- Redéployer
- Vérifier si l'émoji apparaît sur le site en ligne

## 🎯 Pour votre cas spécifique

Si le déploiement automatique ne fonctionne pas :

1. **Connecter le repo GitHub à Vercel** :
   - Aller sur https://vercel.com/new
   - Importer le repo NavéStats
   - Ajouter les variables d'environnement
   - Cliquer sur "Deploy"

2. **Ou déployer manuellement** :
   ```bash
   cd navestats
   vercel --prod
   ```

## 📞 Support

Si le problème persiste :
1. Vérifier les logs de déploiement sur votre hébergeur
2. Vérifier la console du navigateur pour les erreurs JS
3. Vérifier les logs Supabase pour les erreurs de base de données

---

**Dernière mise à jour :** Juillet 2026
**Site :** https://navestats.site