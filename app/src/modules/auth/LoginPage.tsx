import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { enterDemoMode, loginAs } from './auth.store';

/**
 * Page de connexion. Deux modes :
 *   - **Démo** : accès direct aux données mockées Darval (bouton en haut, mis en avant)
 *   - **Connexion** : email + mot de passe (placeholder Phase 3 Odoo)
 *
 * Layout dédié sans sidebar ni FAB — c'est la 1re page avant entrée dans l'app.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleDemo = () => {
    enterDemoMode();
    navigate('/parcellaire', { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    // Stub Phase 3 — pour l'instant on accepte tout et on connecte
    await new Promise((r) => setTimeout(r, 400));
    loginAs(email.trim());
    setSubmitting(false);
    navigate('/parcellaire', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-(--color-bg)">
      {/* Header — bouton Démo en haut à droite */}
      <header className="flex items-center justify-between border-b border-(--color-border) bg-(--color-surface) px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <img src="/qodo-logo.svg" alt="Qodo Digital" className="h-7" />
        </div>
        <button
          type="button"
          onClick={handleDemo}
          className="inline-flex h-10 items-center gap-2 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-4 text-sm font-semibold text-white hover:bg-(--color-primary-hover)"
        >
          <PlayIcon />
          Essayer la démo
        </button>
      </header>

      {/* Contenu centré */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          <h1 className="m-0 text-2xl font-semibold">Bienvenue</h1>
          <p className="m-0 mt-1 text-sm text-(--color-muted)">
            Connectez-vous à votre exploitation
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-3">
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="vous@exploitation.ch"
                required
                className={inputClass}
              />
            </Field>
            <Field label="Mot de passe">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className={inputClass}
              />
            </Field>

            <button
              type="submit"
              disabled={submitting || !email.trim() || !password.trim()}
              className="inline-flex h-11 w-full items-center justify-center rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-5 text-sm font-semibold text-white hover:bg-(--color-primary-hover) disabled:opacity-50"
            >
              {submitting ? 'Connexion…' : 'Se connecter'}
            </button>

            <p className="m-0 text-center text-xs text-(--color-muted)">
              Mot de passe oublié ? Phase 3 — Odoo SSO.
            </p>
          </form>

          {/* Bouton Démo en bas aussi (visible mobile) */}
          <div className="mt-6 rounded-(--radius) border border-dashed border-(--color-border) bg-(--color-surface) p-4 text-center">
            <p className="m-0 text-xs text-(--color-muted)">
              Pas de compte ? Découvrez l'app sur des données réelles du Domaine Darval.
            </p>
            <button
              type="button"
              onClick={handleDemo}
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-(--radius) border border-(--color-primary)/30 bg-(--color-primary)/8 px-4 text-sm font-medium text-(--color-primary) hover:bg-(--color-primary)/14"
            >
              <PlayIcon />
              Mode démo
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-(--color-border) bg-(--color-surface) px-4 py-3 text-center text-xs text-(--color-muted)">
        NewagriQodo v2 ·{' '}
        <a href="https://qodo.ch" className="hover:underline">
          Qodo Digital
        </a>
      </footer>
    </div>
  );
}

const inputClass =
  'h-11 w-full rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-sm focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-(--color-text)">{label}</label>
      {children}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14} aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
