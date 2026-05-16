# Templates emails — GoTrue

Templates HTML français pour les emails transactionnels Supabase Auth.

## Fichiers

| Fichier                     | Email envoyé par GoTrue           | Variables utilisées            |
| --------------------------- | --------------------------------- | ------------------------------ |
| `confirm-signup.html`       | Confirmation d'inscription        | `{{ .ConfirmationURL }}`       |
| `recover-password.html`     | Réinitialisation de mot de passe  | `{{ .ConfirmationURL }}`       |
| `invite-member.html`        | Invitation membre d'exploitation  | `{{ .ConfirmationURL }}`       |

Variables Go-template disponibles côté GoTrue :
`{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .TokenHash }}`, `{{ .SiteURL }}`,
`{{ .Email }}`, `{{ .Data }}` (raw user metadata).

## Application

GoTrue ne lit pas ces fichiers automatiquement — il faut soit :

1. **Variables d'env** : monter les templates et pointer
   `GOTRUE_MAILER_TEMPLATES_*` vers `/etc/gotrue/templates/*.html` dans
   `docker-compose.yml`. Pratique pour le self-host.

2. **Studio** : Settings → Auth → Email Templates, copier-coller le HTML.
   Plus simple si la stack Supabase Cloud est utilisée à un moment.

### Pour le self-host

Ajouter aux variables d'environnement du service `auth` :

```yaml
auth:
  environment:
    GOTRUE_MAILER_TEMPLATES_CONFIRMATION: file:///etc/gotrue/templates/confirm-signup.html
    GOTRUE_MAILER_TEMPLATES_RECOVERY: file:///etc/gotrue/templates/recover-password.html
    GOTRUE_MAILER_TEMPLATES_INVITE: file:///etc/gotrue/templates/invite-member.html
  volumes:
    - ./email-templates:/etc/gotrue/templates:ro
```

## Charte graphique

- Couleur primaire : `#1f7a4d` (vert NewagriQodo, cohérent avec `--color-primary`)
- Fond clair : `#f5f7f6`, surface `#ffffff`, bordure `#e3e8e5`
- Typo système (pas de webfont — meilleur rendu dans tous les clients mail)
- Largeur max 520px, mobile-friendly via `<meta viewport>`
- Footer avec coordonnées Qodo Digital pour conformité RGPD/LPD
