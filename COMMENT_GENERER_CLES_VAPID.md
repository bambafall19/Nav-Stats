# 🔑 Comment générer les clés VAPID

## ⚠️ IMPORTANT

Les clés VAPID n'existent PAS dans Supabase. Ce sont des clés que VOUS devez générer sur votre ordinateur.

---

## 📋 ÉTAPE PAR ÉTAPE

### ÉTAPE 1 : Ouvrir le Terminal

**Sur Mac :**
1. Appuyez sur `Cmd + Espace` (pour ouvrir Spotlight)
2. Tapez `Terminal`
3. Appuyez sur `Entrée`

**Une fenêtre noire s'ouvre avec du texte.**

---

### ÉTAPE 2 : Aller dans le dossier du projet

Dans le Terminal, copiez-collez CETTE COMMANDE :

```bash
cd /Users/owner-2/Desktop/NavéStats/navestats
```

Appuyez sur `Entrée`.

---

### ÉTAPE 3 : Générer les clés VAPID

Toujours dans le Terminal, copiez-collez CETTE COMMANDE :

```bash
npx web-push generate-vapid-keys
```

Appuyez sur `Entrée`.

---

### ÉTAPE 4 : Récupérer les clés

Vous allez voir apparaître ceci :

```
VAPID public key: BG_XXXXXXXXXXXXXX
VAPID private key: XXXXXXXXXXXXXXX
```

**COPIEZ CES 2 CLÉS** (faites un clic droit → copier, ou Cmd+C)

---

### ÉTAPE 5 : Les ajouter dans Supabase

1. **Allez sur** https://supabase.com/dashboard
2. **Cliquez** sur votre projet
3. **Dans le menu gauche** (celui que vous avez montré), cliquez sur **Edge Functions**
4. **Descendez** jusqu'à voir **"Environment Variables"**
5. **Cliquez** sur **"Add variable"**

**Ajouter la première clé :**
- **Variable name** : `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- **Value** : La clé publique (commence par `BG_...`)
- Cliquez sur **Add variable**

**Ajouter la deuxième clé :**
- **Variable name** : `VAPID_PRIVATE_KEY`
- **Value** : La clé privée
- Cliquez sur **Add variable**

---

## ✅ C'EST FINI !

Les notifications push sont maintenant configurées.

---

## 🧪 TESTER

1. Allez sur https://navestats.site
2. Autorisez les notifications
3. Vous verrez un bouton vert en bas à droite
4. Envoyez une notification depuis l'admin
5. Elle arrive sur votre téléphone !

---

## 📝 NOTE

Les clés VAPID sont DIFFÉRENTES des clés Supabase :
- Clés Supabase : `sb_publishable_...` et `sb_secret_...` (déjà dans votre code)
- Clés VAPID : `BG_...` et `...` (à générer avec la commande ci-dessus)