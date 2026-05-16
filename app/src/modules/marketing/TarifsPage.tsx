import { Link } from 'react-router-dom';

export default function TarifsPage() {
  return (
    <>
      <section className="border-b border-(--color-border) bg-gradient-to-b from-(--color-bg) to-(--color-surface)/40 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-(--radius-pill) bg-(--color-primary)/10 px-3 py-1 text-xs font-semibold tracking-wider text-(--color-primary) uppercase">
            Tarifs
          </span>
          <h1 className="m-0 mt-4 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
            Un tarif adapté à votre exploitation
          </h1>
          <p className="m-0 mt-4 text-lg text-(--color-muted)">
            Chaque exploitation est différente. On vous propose un tarif sur mesure selon votre
            surface, le nombre d'utilisateurs et ce dont vous avez besoin.
          </p>
          <p className="m-0 mt-3 text-base text-(--color-muted)">
            La démo est <strong className="text-(--color-text)">gratuite à vie</strong>, sans
            inscription.
          </p>
        </div>
      </section>

      <section className="border-t border-(--color-border) bg-gradient-to-b from-(--color-surface)/40 to-(--color-bg) px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-(--radius-lg) border border-(--color-primary)/20 bg-(--color-primary)/5 p-8 text-center sm:p-10">
          <h2 className="m-0 text-3xl font-bold tracking-tight sm:text-4xl">
            Discutons de votre projet
          </h2>
          <p className="m-0 mt-3 text-base text-(--color-muted) sm:text-lg">
            Un appel rapide ou un email, on prend le temps de comprendre votre besoin et on vous
            fait une proposition claire.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex h-11 items-center gap-2 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-5 text-sm font-semibold text-white hover:bg-(--color-primary-hover)"
            >
              Nous contacter
            </Link>
            <Link
              to="/login"
              className="inline-flex h-11 items-center gap-2 rounded-(--radius) border border-(--color-border) bg-(--color-bg) px-5 text-sm font-semibold text-(--color-text) hover:bg-(--color-surface)"
            >
              Essayer la démo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
