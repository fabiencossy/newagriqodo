import { Link } from 'react-router-dom';

const GITHUB_URL = 'https://github.com/fabiencossy/newagriqodo';

export default function OpenSourcePage() {
  return (
    <>
      <section className="border-b border-(--color-border) bg-gradient-to-b from-(--color-bg) to-(--color-surface)/40 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-(--radius-pill) bg-(--color-primary)/10 px-3 py-1 text-xs font-semibold tracking-wider text-(--color-primary) uppercase">
            100 % Open source
          </span>
          <h1 className="m-0 mt-4 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
            Votre carnet des champs, sans boîte noire
          </h1>
          <p className="m-0 mt-4 text-lg text-(--color-muted)">
            Tout le code d'AgriQodo est public et auditable sous licence{' '}
            <strong className="text-(--color-text)">AGPL v3</strong>. Vous pouvez voir comment vos
            données sont traitées, contribuer aux améliorations, ou héberger votre propre instance
            gratuitement.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-5 text-sm font-semibold text-white hover:bg-(--color-primary-hover)"
            >
              <GitHubIcon />
              Voir le code sur GitHub
            </a>
            <Link
              to="/login"
              className="inline-flex h-11 items-center gap-2 rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-5 text-sm font-semibold text-(--color-text) hover:bg-(--color-bg)"
            >
              Essayer la démo
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-4">
          <h2 className="m-0 text-2xl font-bold tracking-tight sm:text-3xl">
            Pourquoi c'est important pour vous
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Bullet title="Aucune boîte noire">
              Vous pouvez lire chaque ligne de code qui traite vos parcelles et vos interventions.
              Aucune surprise, aucun comportement caché.
            </Bullet>
            <Bullet title="Vos données vous appartiennent">
              Export CSV, Excel, GeoJSON natifs. Si vous arrêtez le service, vous repartez avec
              tout. Aucun lock-in.
            </Bullet>
            <Bullet title="Conformité auditable">
              Pour les contrôles cantonaux et les normes phytosanitaires (OEngrais 2024, OFAG), tout
              le calcul est vérifiable dans le code.
            </Bullet>
            <Bullet title="Pérennité garantie">
              Si Qodo Digital disparaissait demain, le code reste accessible. Une coopérative ou un
              groupe d'exploitants peut reprendre la maintenance.
            </Bullet>
          </div>
        </div>
      </section>

      <section className="border-t border-(--color-border) bg-(--color-surface) px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="m-0 text-2xl font-bold tracking-tight sm:text-3xl">
            Que veut dire « AGPL v3 » ?
          </h2>
          <p className="text-base text-(--color-muted)">
            La GNU Affero General Public License v3 est une licence dite « copyleft fort ». En clair
            :
          </p>
          <ul className="list-none space-y-3 p-0 text-base">
            <li className="flex items-start gap-3">
              <CheckBadge />
              <span>
                <strong>Tout le monde peut utiliser AgriQodo gratuitement</strong>, en local ou en
                production, sans demander la permission.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckBadge />
              <span>
                <strong>Vous pouvez modifier le code</strong> pour l'adapter à vos besoins (langues,
                cultures spécifiques, intégrations).
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckBadge />
              <span>
                <strong>Si vous le proposez à d'autres en SaaS</strong> (même hébergé), vous devez
                publier vos modifications sous AGPL v3. Cela protège la communauté : personne ne
                peut « privatiser » le projet.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckBadge />
              <span>
                <strong>Qodo Digital reste l'éditeur principal</strong> et propose le SaaS hébergé
                clés en main (avec support, mises à jour, conformité Suisse). Vous payez si vous
                voulez la simplicité, pas l'accès au code.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="border-t border-(--color-border) px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="m-0 text-2xl font-bold tracking-tight sm:text-3xl">
            Vous voulez héberger votre propre instance ?
          </h2>
          <p className="mt-4 text-base text-(--color-muted)">
            Une coopérative, une école d'agronomie, une exploitation isolée : tout le monde peut
            installer AgriQodo sur son propre serveur. Le guide d'installation prend une vingtaine
            de minutes.
          </p>

          <ol className="m-0 mt-6 list-none space-y-4 p-0">
            <Step n="1" title="Un VPS Linux (Ubuntu 22.04+)">
              Comptez ~5 €/mois chez n'importe quel hébergeur. Pour la Suisse stricte (LPD),
              Infomaniak fait très bien le travail.
            </Step>
            <Step n="2" title="Une commande à lancer">
              Un script bash installe Docker, Caddy (TLS auto), génère tous les secrets, démarre la
              stack Supabase et active le backup quotidien.
            </Step>
            <Step n="3" title="Connecter votre app">
              Renseigner deux variables d'environnement côté front. C'est tout. Votre instance est
              opérationnelle.
            </Step>
          </ol>

          <div className="mt-8 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-5">
            <p className="m-0 text-sm font-semibold">Le guide complet est sur GitHub :</p>
            <code className="m-0 mt-2 block overflow-x-auto rounded-(--radius-sm) bg-(--color-bg) px-3 py-2 font-mono text-xs">
              github.com/fabiencossy/newagriqodo/blob/main/infra/supabase/README.md
            </code>
            <a
              href={`${GITHUB_URL}/blob/main/infra/supabase/README.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-(--radius) border border-(--color-primary)/30 bg-(--color-primary)/8 px-4 text-sm font-medium text-(--color-primary) hover:bg-(--color-primary)/14"
            >
              Lire le guide d'auto-hébergement
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-(--color-border) bg-(--color-surface) px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="m-0 text-2xl font-bold tracking-tight sm:text-3xl">
            Contribuer au projet
          </h2>
          <p className="mt-4 text-base text-(--color-muted)">
            Vous êtes développeur·euse, ingénieur·e agronome, étudiant·e ? Toute contribution est
            bienvenue, même petite.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <a
              href={`${GITHUB_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg) p-5 transition-colors hover:border-(--color-primary)"
            >
              <p className="m-0 font-semibold">Signaler un bug</p>
              <p className="m-0 mt-1 text-sm text-(--color-muted)">Ouvrir une issue sur GitHub</p>
            </a>
            <a
              href={`${GITHUB_URL}/discussions`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg) p-5 transition-colors hover:border-(--color-primary)"
            >
              <p className="m-0 font-semibold">Proposer une idée</p>
              <p className="m-0 mt-1 text-sm text-(--color-muted)">
                Démarrer une discussion publique
              </p>
            </a>
            <a
              href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg) p-5 transition-colors hover:border-(--color-primary)"
            >
              <p className="m-0 font-semibold">Envoyer du code</p>
              <p className="m-0 mt-1 text-sm text-(--color-muted)">Lire le guide CONTRIBUTING</p>
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-(--color-border) bg-gradient-to-b from-(--color-surface)/40 to-(--color-bg) px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-(--radius-lg) border border-(--color-primary)/20 bg-(--color-primary)/5 p-8 text-center sm:p-10">
          <h2 className="m-0 text-3xl font-bold tracking-tight sm:text-4xl">
            La transparence par défaut
          </h2>
          <p className="m-0 mt-3 text-base text-(--color-muted) sm:text-lg">
            Essayez la démo, lisez le code, hébergez votre instance. À vous de choisir.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex h-11 items-center gap-2 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-5 text-sm font-semibold text-white hover:bg-(--color-primary-hover)"
            >
              Lancer la démo
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-(--radius) border border-(--color-border) bg-(--color-bg) px-5 text-sm font-semibold text-(--color-text) hover:bg-(--color-surface)"
            >
              <GitHubIcon />
              GitHub
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function Bullet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg) p-5">
      <p className="m-0 font-semibold">{title}</p>
      <p className="m-0 mt-2 text-sm text-(--color-muted)">{children}</p>
    </div>
  );
}

function CheckBadge() {
  return (
    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-(--radius-pill) bg-(--color-primary)/15 text-(--color-primary)">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="12"
        height="12"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-4 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-5">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-(--radius-pill) bg-(--color-primary) text-base font-bold text-white">
        {n}
      </span>
      <div>
        <p className="m-0 font-semibold">{title}</p>
        <p className="m-0 mt-1 text-sm text-(--color-muted)">{children}</p>
      </div>
    </li>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.73.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.14 0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
