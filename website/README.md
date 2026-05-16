# NewagriQodo — Site marketing

Site statique de présentation de l'application NewagriQodo. Astro 5 + Tailwind 4.

## Démarrage

```bash
cd website
npm install
npm run dev         # http://localhost:4321
npm run build       # build statique → dist/
npm run preview     # preview du build
```

## Structure

```
website/
├── src/
│   ├── pages/              ← une page = une route
│   │   ├── index.astro
│   │   ├── fonctionnalites.astro
│   │   ├── tarifs.astro
│   │   └── contact.astro
│   ├── layouts/
│   │   └── BaseLayout.astro  ← layout commun (Header + Footer + meta SEO)
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── FeatureSection.astro      ← section alternée texte + screenshot
│   │   ├── FeatureGrid.astro         ← grille de cartes "bénéfices"
│   │   ├── ScreenshotDuo.astro       ← desktop + mobile en overlay
│   │   └── CTASection.astro          ← bloc call-to-action vert
│   └── styles/
│       └── global.css        ← design tokens (cohérents avec app/)
└── public/
    ├── favicon.svg
    └── screenshots/          ← 33 captures (copiées depuis ../screenshots/)
```

## Liens

- Démo de l'app : <https://newagri.qodo.ch/login> (CTA principal du site)
- Repo principal de l'app : `../app/`
- Screenshots source : `../screenshots/`

## Mise à jour des screenshots

Si tu reprends de nouveaux screenshots dans `../screenshots/`, copie-les dans `public/screenshots/` :

```bash
cp -r ../screenshots/* public/screenshots/
find public/screenshots -name ".DS_Store" -delete
```

## Déploiement

Le site est 100% statique (SSG). Le `dist/` peut être hébergé partout :
- Nginx sur ton VPS (sous-domaine `www.qodo.ch` ou `qodo.ch`)
- Cloudflare Pages, Netlify, Vercel (zero config)
- GitHub Pages

Build pesait ~37 MB au scaffold (essentiellement les screenshots PNG haute déf — penser à optimiser en WebP si besoin).
