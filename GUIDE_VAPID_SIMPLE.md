# Guide Simple : Configurer les Notifications Push

## 🎯 Objectif
Fonctionnement des notifications sur téléphone, même sans être sur le site.

## 📋 Ce qu'il faut faire (3 étapes simples)

---

## ÉTAPE 1 : Générer les clés VAPID

### Ouvrir le terminal (ligne de commande) :

**Sur Mac :**
1. Ouvrir le fichier `Terminal` (dans Applications → Utilitaires)
2. Taper cette commande et appuyer sur Entrée :

```bash
cd /Users/owner-2/Desktop/NavéStats/navestats && npx web-push generate-vapid-keys
```

**Ce qui va apparaître :**
```
VAPID public key: BG_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID private key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**📝 COPIEZ CES 2 CLÉS** dans un fichier texte temporaire.

---

## ÉTAPE 2 : Ajouter les clés dans Supabase

1. **Aller sur** : https://supabase.com/dashboard
2. **Cliquer** sur votre projet NavéStats
3. **Dans le menu gauche** : Cliquer sur l'icône ⚙️ **Settings**
4. **Cliquer** sur **Edge Functions**
5. **Descendre** jusqu'à "Environment Variables"
6. **Cliquer** sur "Add variable"

### Ajouter la première clé :
- **Name** : `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- **Value** : La clé publique que vous avez générée (BG_...)
- **Cliquer** sur "Add"

### Ajouter la deuxième clé :
- **Name** : `VAPID_PRIVATE_KEY`
- **Value** : La clé privée que vous avez générée
- **Cliquer** sur "Add"

---

## ÉTAPE 3 : Créer la table dans Supabase

1. **Dans Supabase Dashboard**, menu gauche → **SQL Editor**
2. **Cliquer** sur "New query"
3. **Ouvrir** le fichier `navestats/supabase/push-subscriptions-schema.sql`
4. **Copier TOUT le contenu** (Ctrl+A, Ctrl+C)
5. **Coller** dans Supabase SQL Editor
6. **Cliquer** sur "Run" (ou Ctrl+Entrée)
7. **Vous devriez voir** : "Success. No rows returned"

---

## ✅ C'est terminé !

Maintenant, testez sur votre téléphone :

1. **Aller sur** : https://navestats.site
2. **Autoriser les notifications** quand le navigateur demande
3. **Un bouton vert** "✅ Notifications actives" apparaît en bas à droite
4. **Envoyer une notification** depuis `/admin/notifications`
5. **Elle apparaît** sur votre téléphone, même si le site est fermé !

---

## 🆘 Si ça ne marche pas

### Vérifier que les clés VAPID sont bien dans Supabase
- Settings → Edge Functions → Environment Variables
- Vous devez voir `NEXT_PUBLIC_VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY`

### Vérifier que la table existe
- Table Editor → Vous devez voir `push_subscriptions`

### Tester en console
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet "Console"
3. Chercher les erreurs en rouge

---

## 📞 Besoin d'aide ?

Si vous avez une erreur, copiez-collez le message d'erreur complet.