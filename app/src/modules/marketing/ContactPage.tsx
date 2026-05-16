export default function ContactPage() {
  return (
    <>
      <section className="border-b border-(--color-border) bg-gradient-to-b from-(--color-bg) to-(--color-surface)/40 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-(--radius-pill) bg-(--color-primary)/10 px-3 py-1 text-xs font-semibold tracking-wider text-(--color-primary) uppercase">
            Contact
          </span>
          <h1 className="m-0 mt-4 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
            Discutons de votre exploitation
          </h1>
          <p className="m-0 mt-4 text-lg text-(--color-muted)">
            Une question, une démo personnalisée, un devis : on vous répond sous 1 jour ouvré.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
            <h3 className="m-0 text-base font-semibold">Email</h3>
            <a
              href="mailto:info@qodo.ch"
              className="m-0 mt-2 block text-lg text-(--color-primary) hover:underline"
            >
              info@qodo.ch
            </a>
            <p className="m-0 mt-1 text-sm text-(--color-muted)">Réponse sous 1 jour ouvré</p>
          </div>
          <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
            <h3 className="m-0 text-base font-semibold">Téléphone</h3>
            <a
              href="tel:+41219000479"
              className="m-0 mt-2 block text-lg text-(--color-primary) hover:underline"
            >
              +41 21 900 04 79
            </a>
            <p className="m-0 mt-1 text-sm text-(--color-muted)">Du lundi au vendredi, 9h–18h</p>
          </div>
          <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card) sm:col-span-2">
            <h3 className="m-0 text-base font-semibold">Adresse</h3>
            <p className="m-0 mt-2 text-base">
              Qodo Digital Sàrl
              <br />
              Ch. des Halles 3<br />
              1510 Moudon (VD)
              <br />
              Suisse
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
