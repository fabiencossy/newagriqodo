export default function ConfidentialitePage() {
  return (
    <>
      <section className="border-b border-(--color-border) bg-gradient-to-b from-(--color-bg) to-(--color-surface)/40 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block rounded-(--radius-pill) bg-(--color-primary)/10 px-3 py-1 text-xs font-semibold tracking-wider text-(--color-primary) uppercase">
            RGPD / LPD
          </span>
          <h1 className="m-0 mt-3 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
            Politique de confidentialité
          </h1>
          <p className="m-0 mt-3 text-sm text-(--color-muted)">
            Dernière mise à jour : 16 mai 2026
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-8 text-base leading-relaxed">
          <div className="rounded-(--radius-lg) border border-(--color-primary)/30 bg-(--color-primary)/5 p-5">
            <h2 className="m-0 text-lg font-bold text-(--color-primary)">
              L'essentiel en 4 points
            </h2>
            <ul className="m-0 mt-3 list-disc space-y-1 pl-5 text-sm">
              <li>
                Vos données sont hébergées <strong>en Suisse uniquement</strong> (Plan-les-Ouates,
                Genève).
              </li>
              <li>Nous ne les vendons pas, nous ne les utilisons pas pour de la publicité.</li>
              <li>
                Vous pouvez à tout moment exporter vos données ou demander leur suppression
                complète.
              </li>
              <li>
                L'accès est strictement limité aux membres de votre exploitation que vous invitez.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="m-0 text-2xl font-bold">1. Responsable du traitement</h2>
            <p className="mt-2">
              <strong>Qodo Digital Sàrl</strong>, Ch. des Halles 3, 1510 Moudon (VD), Suisse —{' '}
              <a href="mailto:info@qodo.ch" className="text-(--color-primary) hover:underline">
                info@qodo.ch
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="m-0 text-2xl font-bold">2. Données collectées</h2>
            <p className="mt-2">Trois catégories :</p>
            <ul className="m-0 mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>
                <strong>Compte</strong> : email, mot de passe haché (bcrypt), nom, IP + date de
                dernière connexion (90 jours)
              </li>
              <li>
                <strong>Exploitation</strong> : parcelles, interventions, équipe, catalogue de
                produits
              </li>
              <li>
                <strong>Techniques anonymes</strong> : logs d'erreur. Pas de cookies tiers ni Google
                Analytics
              </li>
            </ul>
          </div>

          <div>
            <h2 className="m-0 text-2xl font-bold">3. Hébergement et sécurité</h2>
            <p className="mt-2">
              Les données sont stockées sur un serveur dédié chez <strong>Infomaniak</strong> à
              Plan-les-Ouates (Genève, Suisse). Aucune réplication à l'étranger. HTTPS obligatoire,
              Row-Level Security Postgres, mots de passe bcrypt, sauvegardes quotidiennes 14 jours.
            </p>
          </div>

          <div>
            <h2 className="m-0 text-2xl font-bold">4. Sous-traitants</h2>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-(--color-border) text-left text-xs uppercase text-(--color-muted)">
                  <th className="py-2">Fournisseur</th>
                  <th className="py-2">Service</th>
                  <th className="py-2">Pays</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                <tr>
                  <td className="py-2">Infomaniak</td>
                  <td>Hébergement serveur</td>
                  <td>Suisse</td>
                </tr>
                <tr>
                  <td className="py-2">Vercel</td>
                  <td>Hébergement du site web</td>
                  <td>États-Unis (CDN edge)</td>
                </tr>
                <tr>
                  <td className="py-2">Resend</td>
                  <td>Emails transactionnels</td>
                  <td>Allemagne (UE)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="m-0 text-2xl font-bold">5. Vos droits (RGPD + LPD)</h2>
            <ul className="m-0 mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>
                <strong>Accès</strong> : obtenir une copie de toutes vos données
              </li>
              <li>
                <strong>Rectification</strong> : corriger toute donnée inexacte directement dans
                l'app
              </li>
              <li>
                <strong>Suppression</strong> : faire effacer votre compte et toutes vos données
                associées
              </li>
              <li>
                <strong>Portabilité</strong> : exporter dans un format standard (CSV, Excel,
                GeoJSON)
              </li>
              <li>
                <strong>Opposition</strong> : refuser certains traitements
              </li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, écrivez à{' '}
              <a href="mailto:info@qodo.ch" className="text-(--color-primary) hover:underline">
                info@qodo.ch
              </a>
              . Réponse sous 30 jours maximum.
            </p>
          </div>

          <div>
            <h2 className="m-0 text-2xl font-bold">6. Réclamations</h2>
            <p className="mt-2">
              Vous pouvez contacter le{' '}
              <a
                href="https://www.edoeb.admin.ch/edoeb/fr/home.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--color-primary) hover:underline"
              >
                Préposé fédéral à la protection des données (PFPDT)
              </a>
              , autorité de référence en Suisse.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
