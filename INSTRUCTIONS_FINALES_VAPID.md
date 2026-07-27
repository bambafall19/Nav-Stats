# ✅ INSTRUCTIONS FINALES - Configurer les clés VAPID

## 🎯 Vous avez déjà généré les clés :

**Clé publique** : `BEY402bD-RcJ2eLdrTu4GgM1Wt6YOahbPUjgwWxSWnsBHjYBzi7msxpXngqAhkXQElBNkjeB0Tq5ikKVXpk9Kzg`

**Clé privée** : `nVTkieSUYzpR4Ykv8GyMeEu9DsEtKYh-UWBZEPyYjjE`

---

## 📋 Ajouter les clés dans VERCEL (pas Supabase !)

### ÉTAPE 1 : Aller sur Vercel

1. Ouvrir https://vercel.com
2. Se connecter
3. Cliquer sur le projet **Nav-Stats** (ou navestats)

### ÉTAPE 2 : Ouvrir les variables d'environnement

1. Cliquer sur l'onglet **Settings** (en haut)
2. Dans le menu gauche, cliquer sur **Environment Variables**
3. Cliquer sur le bouton **"Add New"** ou **"+"**

### ÉTAPE 3 : Ajouter la clé publique

Remplir le formulaire :
- **Name** : `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- **Value** : `BEY402bD-RcJ2eLdrTu4GgM1Wt6YOahbPUjgwWxSWnsBHjYBzi7msxpXngqAhkXQElBNkjeB0Tq5ikKVXpk9Kzg`
- **Environments** : Cochez les 3 cases (Production, Preview, Development)
- Cliquez sur **Save**

### ÉTAPE 4 : Ajouter la clé privée

Cliquer à nouveau sur **"Add New"** :
- **Name** : `VAPID_PRIVATE_KEY`
- **Value** : `nVTkieSUYzpR4Ykv8GyMeEu9DsEtKYh-UWBZEPyYjjE`
- **Environments** : Cochez les 3 cases (Production, Preview, Development)
- Cliquez sur **Save**

### ÉTAPE 5 : Redéployer

1. Aller dans l'onglet **Deployments**
2. Cliquer sur les 3 points **...** du dernier déploiement
3. Cliquer sur **Redeploy**
4. Attendre 2-3 minutes

---

## ✅ C'EST FINI !

Maintenant, testez :
1. Allez sur https://navestats.site
2. Autorisez les notifications
3. Un bouton vert apparaît en bas à droite
4. Les notifications fonctionnent sur votre téléphone !

---

## 🧪 TESTER MAINTENANT

1. Ouvrir https://navestats.site sur votre téléphone
2. Accepter les notifications quand demandé
3. Envoyer une notification depuis `/admin/notifications`
4. Elle apparaît sur le téléphone même si le site est fermé !

---

## 📝 NOTE

- ✅ Les clés sont maintenant dans Vercel
- ✅ Le site est déployé avec les clés
- ✅ Les notifications push fonctionnent
- ❌ N'ajoutez JAMAIS les clés dans Supabase (ce n'est pas la base de données)