# 🚀 Étapes à suivre MAINTENANT

## ⚡ RÉCAPITULATIF RAPIDE

Vous devez faire **2 choses importantes** :

---

## 1️⃣ GÉNÉRER LES CLÉS VAPID (dans le terminal)

### Ouvrez le Terminal sur votre Mac :
- Appuyez sur `Cmd + Espace`
- Tapez `Terminal`
- Appuyez sur `Entrée`

### Copiez-collez CETTE COMMANDE EXACTE dans le terminal :

```bash
cd /Users/owner-2/Desktop/NavéStats/navestats && npx web-push generate-vapid-keys
```

### Appuyez sur `Entrée`

### Vous allez voir ceci apparaître :
```
VAPID public key: BG_abc123...
VAPID private key: xyz789...
```

### 📝 COPIEZ CES DEUX CLÉS dans un note (TextEdit)

---

## 2️⃣ AJOUTER LES CLÉS DANS SUPABASE

### Allez sur https://supabase.com/dashboard

### Cliquez sur votre projet

### Dans le menu de GAUCHE :
1. Cliquez sur l'icône **⚙️ Settings** (tout en bas)
2. Cliquez sur **Edge Functions**
3. Descendez jusqu'à **"Environment Variables"**
4. Cliquez sur **"Add variable"**

### Ajoutez la PREMIÈRE clé :
- **Variable name** : `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- **Value** : La clé publique que vous avez copiée (commence par `BG_...`)
- Cliquez sur **"Add variable"**

### Ajoutez la DEUXIÈME clé :
- **Variable name** : `VAPID_PRIVATE_KEY`
- **Value** : La clé privée que vous avez copiée
- Cliquez sur **"Add variable"**

---

## ✅ C'EST TOUT !

Maintenant, testez sur votre téléphone :

1. Allez sur https://navestats.site
2. Autorisez les notifications quand Chrome demande
3. Cliquez sur "Activer" dans le bouton en bas à droite
4. Envoyez une notification depuis/admin/notifications
5. Elle apparaît sur votre téléphone ! 🎉

---

## 🆘 Si vous ne trouvez pas les éléments dans Supabase

### Problème : "Je ne vois pas Edge Functions"
**Solution** : 
- Allez dans **Settings** → **API** 
- Cherchez la section **"Environment Variables"**

### Problème : "Je ne vois pas Settings"
**Solution** :
- C'est l'icône d'engrenage ⚙️ en bas du menu gauche

---

## 📞 Besoin d'aide ?

Dites-moi à quelle étape vous êtes bloqué et je vousaide pas à pas.