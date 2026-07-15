# 🎯 Où ajouter les clés VAPID

## ⚠️ ERREUR À NE PAS FAIRE

Les clés VAPID ne vont PAS dans Supabase, mais dans **VERCEL** !

---

## 📋 MARCHE À SUIVRE

### ÉTAPE 1 : Générer les clés (dans le Terminal)

```bash
cd /Users/owner-2/Desktop/NavéStats/navestats && npx web-push generate-vapid-keys
```

Vous allez obtenir :
```
VAPID public key: BG_XXXXXXXXX
VAPID private key: XXXXXXXXX
```

**Gardez ces 2 clés.**

---

### ÉTAPE 2 : Ajouter les clés dans VERCEL

1. **Allez sur** : https://vercel.com
2. **Connectez-vous** à votre compte
3. **Sélectionnez** votre projet `Nav-Stats` (ou navestats)
4. **Cliquez sur** l'onglet **"Settings"** (en haut)
5. **Dans le menu gauche**, cliquez sur **"Environment Variables"**
6. **Cliquez sur** **"Add New"** ou le bouton **"+"**

### Ajouter la clé publique :

- **Key** : `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- **Value** : La clé publique que vous avez générée (BG_...)
- **Environments** : Cochez `Production`, `Preview`, et `Development`
- Cliquez sur **"Save"**

### Ajouter la clé privée :

- **Key** : `VAPID_PRIVATE_KEY`
- **Value** : La clé privée que vous avez générée
- **Environments** : Cochez `Production`, `Preview`, et `Development`
- Cliquez sur **"Save"**

---

### ÉTAPE 3 : Redéployer

1. Dans Vercel, allez dans l'onglet **"Deployments"**
2. Cliquez sur le bouton **"Redeploy"** ou faites un petit changement et poussez sur Git

---

## ✅ C'EST TOUT !

Les clés sont maintenant dans Vercel et le site pourra les utiliser.

---

## 🆘 SI VOUS N'AVEZ PAS VERCEL

Si votre site n'est pas sur Vercel mais sur un autre hébergeur :

1. Les clés doivent être ajoutées dans les variables d'environnement de votre hébergeur
2. Ou dans un fichier `.env.local` (qui ne doit PAS être commité dans Git)

---

## 📝 NOTE IMPORTANTE

- **Supabase** : C'est votre base de données (déjà configuré avec les clés sb_...)
- **Vercel** : C'est votre hébergement (ajoutez les clés VAPID ici)
- **VAPID** : Ce sont des clés spécifiques pour les notifications push (à générer avec web-push)