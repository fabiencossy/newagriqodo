import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { updatePassword } from './auth.store';

/**
 * Page cible du lien de réinitialisation envoyé par Supabase.
 * L'utilisateur arrive avec une session de récupération active dans l'URL
 * (Supabase la détecte automatiquement via `detectSessionInUrl: true`).
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(() => !supabase);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (!data.session) {
        setError(
          'Lien de réinitialisation invalide ou expiré. Demandez-en un nouveau depuis la page de connexion.',
        );
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setSubmitting(true);
    const res = await updatePassword(password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? 'Échec de la mise à jour du mot de passe.');
      return;
    }
    navigate('/parcellaire', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-(--color-bg)">
      <header className="flex items-center border-b border-(--color-border) bg-(--color-surface) px-4 py-3 sm:px-6">
        <img src="/qodo-logo.svg" alt="Qodo Digital" className="h-7" />
      </header>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          <h1 className="m-0 text-2xl font-semibold">Nouveau mot de passe</h1>
          <p className="m-0 mt-1 text-sm text-(--color-muted)">
            Choisissez un mot de passe d'au moins 8 caractères.
          </p>

          {!isSupabaseConfigured && (
            <p className="m-0 mt-4 rounded-(--radius) border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Auth non configurée.
            </p>
          )}

          {ready && (
            <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
              <Field label="Nouveau mot de passe">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className={inputClass}
                />
              </Field>
              <Field label="Confirmation">
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className={inputClass}
                />
              </Field>

              {error && (
                <div
                  role="alert"
                  className="rounded-(--radius) border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !password || !confirm}
                className="inline-flex h-11 w-full items-center justify-center rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-5 text-sm font-semibold text-white hover:bg-(--color-primary-hover) disabled:opacity-50"
              >
                {submitting ? '…' : 'Mettre à jour'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="m-0 block w-full text-center text-xs text-(--color-muted) hover:text-(--color-text) hover:underline"
              >
                Retour à la connexion
              </button>
            </form>
          )}
        </div>
      </main>
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
