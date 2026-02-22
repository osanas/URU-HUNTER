# Configuration Meta (Facebook & Instagram)

## Variables d'environnement

Ajoutez dans `.env.local` :

```env
# Meta / Facebook App
META_APP_ID=votre_app_id
META_APP_SECRET=votre_app_secret

# Webhook - token de vérification (choisissez une chaîne secrète)
META_WEBHOOK_VERIFY_TOKEN=votre_token_secret

# Déjà présent normalement
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

## Endpoints créés

| Endpoint | Méthode | Usage |
|----------|---------|-------|
| `/api/auth/meta` | GET | Lance le flux OAuth - redirige vers Facebook |
| `/api/auth/meta/callback` | GET | Callback OAuth - reçoit le code et sauvegarde les comptes |
| `/api/meta/webhook` | GET | Vérification du webhook par Meta |
| `/api/meta/webhook` | POST | Réception des messages Meta |

## Utilisation

1. **Connecter Facebook** : redirigez l'utilisateur vers `/api/auth/meta`
2. **Webhook** : configurez dans Meta Developer Console → Webhooks → URL : `https://votre-domaine.com/api/meta/webhook`
