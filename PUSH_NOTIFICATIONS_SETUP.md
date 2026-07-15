# Configuration des Notifications Push

## 📱 Objectif

Permettre aux utilisateurs de recevoir des notifications sur leur téléphone même s'ils ne sont pas sur le site.

## 🔧 Étape 1 : Générer les clés VAPID

Les clés VAPID sont nécessaires pour envoyer des push notifications.

### Option A : Utiliser web-push CLI (recommandé)

```bash
cd /Users/owner-2/Desktop/NavéStats/navestats
npx web-push generate-vapid-keys
```

Cela va générer quelque chose comme :
```
VAPID  public key: BG_to2J3ZYX1ZaZ3K3ry5JVJW8V4JcsXReLJhGcsMXZCKqlEcF5dVc9rUJ-qToqPxBB46eNc7S2HKwdzURn4aN8
VAPID private key: lTfF5QGSj1X9qzPF4B2cGZ3xZ3K3ry5JVJW8V4JcsXReLJhGcsMXZCKqlEcF5dVc9rUJ-qToqPxBB46eNc7S2HKw
```

### Option B : Générer manuellement avec Node.js

```bash
node -e "const webpush = require('web-push'); console.log(webpush.generateVAPIDKeys());"
```

## 🔐 Étape 2 : Ajouter les clés dans Supabase

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Menu gauche → "Settings" → "Edge Functions" ou "API"
4. Ajouter ces variables d'environnement :

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BG_to2J3ZYX1ZaZ3K3ry5JVJW8V4JcsXReLJhGcsMXZCKqlEcF5dVc9rUJ-qToqPxBB46eNc7S2HKwdzURn4aN8
VAPID_PRIVATE_KEY=lTfF5QGSj1X9qzPF4B2cGZ3xZ3K3ry5JVJW8V4JcsXReLJhGcsMXZCKqlEcF5dVc9rUJ-qToqPxBB46eNc7S2HKw
```

**Important** : Remplacez par vos propres clés générées !

## 🗄️ Étape 3 : Créer la table push_subscriptions dans Supabase

1. Aller dans Supabase Dashboard → SQL Editor
2. Copier-coller le contenu de `supabase/push-subscriptions-schema.sql`
3. Exécuter le script

## 🎨 Étape 4 : Le composant est déjà intégré

Le composant `PushNotificationManager` va automatiquement :
- Afficher un bouton "Activer les notifications" si l'utilisateur n'est pas abonné
- Afficher "✅ Notifications actives" si l'utilisateur est abonné
- Sauvegarder la subscription dans la base de données

## 📱 Étape 5 : Tester

1. Aller sur https://navestats.site
2. Autoriser les notifications quand le navigateur demande
3. Le bouton devrait afficher "✅ Notifications actives"
4. Envoyer une notification depuis l'admin
5. Vérifier que la notification apparaît sur le téléphone

## ⚠️ Limitations et Notes

### Navigateurs supportés
- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari (iOS 16.4+)
- ⚠️ Safari nécessite des certificats spécifiques

### Fonctionnement
- Les notifications nécessitent que le Service Worker soit enregistré
- L'utilisateur doit accepter la permission de notification
- Les notifications fonctionnent même si le site est fermé
- Les notifications sont stockées dans la base de données

### Coûts
- Gratuit pour les services basiques
- Pour des volumes élevés, considérer Firebase Cloud Messaging (FCM)

## 🚀 Étape 6 : Pour envoyer des notifications push

Dans `/admin/notifications`, quand vous envoyez une notification :
1. Elle est sauvegardée dans la table `notifications`
2. Le système peut ensuite envoyer une push notification via l'API `/api/notifications/push`

## 📋 Checklist complète

- [ ] Générer les clés VAPID
- [ ] Ajouter les clés dans Supabase
- [ ] Exécuter le script SQL `push-subscriptions-schema.sql`
- [ ] Tester l'abonnement aux notifications
- [ ] Vérifier que les notifications apparaissent sur mobile
- [ ] Tester l'envoi depuis l'admin

## 🐛 Dépannage

### Les notifications ne s'affichent pas
1. Vérifier que le Service Worker est enregistré (DevTools → Application → Service Workers)
2. Vérifier les permissions (DevTools → Application → Notifications)
3. Vérifier les logs de la console pour les erreurs

### Erreur "Invalid VAPID key"
- Vérifier que les clés sont correctement copiées dans Supabase
- Vérifier que le mailto est valide

### Les notifications ne fonctionnent pas en arrière-plan
- Vérifier que le Service Worker est bien activé
- Vérifier les paramètres de batterie du téléphone (optimisation)