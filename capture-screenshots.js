#!/usr/bin/env node

/**
 * Script de capture automatique - 33 screenshots Agri Qodo
 * Usage: node capture-screenshots.js
 *
 * Installe d'abord les dépendances:
 * npm install puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// Structure des captures
const captures = {
  '01_Hero': [
    { id: 'H1', viewport: { width: 1440, height: 900 }, route: '/parcellaire', label: 'Hero Desktop - Carte dézoomée' },
    { id: 'H2', viewport: { width: 430, height: 932 }, route: '/parcellaire', label: 'Hero Mobile - Carte' },
    { id: 'H3', viewport: { width: 1440, height: 900 }, route: '/parcellaire', label: 'Hero Desktop - Panel à droite', waitFor: '.ParcelleSummaryPanel' },
    { id: 'H4', viewport: { width: 430, height: 932 }, route: '/parcellaire', label: 'Hero Mobile - Bottom sheet' },
  ],

  '02_Parcellaire': [
    { id: 'P1', viewport: { width: 1440, height: 900 }, route: '/parcellaire?view=table', label: 'Parcellaire - Table avec checkbox', waitFor: 'table' },
    { id: 'P2', viewport: { width: 430, height: 932 }, route: '/parcellaire?view=table', label: 'Parcellaire Mobile - Cards' },
    { id: 'P3', viewport: { width: 1440, height: 900 }, route: '/parcellaire?view=timeline', label: 'Parcellaire - Timeline Gantt' },
    { id: 'P4', viewport: { width: 1440, height: 900 }, route: '/parcellaire?view=dashboard', label: 'Parcellaire - Dashboard KPIs' },
  ],

  '03_DetailParcelle': [
    { id: 'D1', viewport: { width: 1440, height: 900 }, route: '/parcellaire/VD_2026_167572', label: 'Detail - Aperçu' },
    { id: 'D2', viewport: { width: 430, height: 932 }, route: '/parcellaire/VD_2026_167572', label: 'Detail Mobile - Aperçu' },
    { id: 'D3', viewport: { width: 1440, height: 900 }, route: '/parcellaire/VD_2026_167572?tab=carnet', label: 'Detail - Carnet', waitFor: '[role="tabpanel"]' },
    { id: 'D4', viewport: { width: 1440, height: 900 }, route: '/parcellaire/VD_2026_167572?tab=assolement', label: 'Detail - Assolement' },
    { id: 'D5', viewport: { width: 1440, height: 900 }, route: '/parcellaire/VD_2026_167572?tab=fumure', label: 'Detail - Fumure' },
    { id: 'D6', viewport: { width: 1440, height: 900 }, route: '/parcellaire/VD_2026_167572?tab=statistiques', label: 'Detail - Statistiques' },
  ],

  '04_Carnet': [
    { id: 'C1', viewport: { width: 1440, height: 900 }, route: '/carnet?view=table', label: 'Carnet - Table interventions', waitFor: 'table' },
    { id: 'C2', viewport: { width: 430, height: 932 }, route: '/carnet?view=table', label: 'Carnet Mobile - Cards' },
    { id: 'C3', viewport: { width: 1440, height: 900 }, route: '/carnet?view=timeline', label: 'Carnet - Timeline par mois' },
    { id: 'C4', viewport: { width: 430, height: 932 }, route: '/carnet/new?category=fertilisation', label: 'Carnet Mobile - InterventionForm Phyto' },
  ],

  '05_Formulaires': [
    { id: 'F1', viewport: { width: 1440, height: 900 }, route: '/carnet/new?category=traitement-phyto', label: 'Form - Phyto avec ProductPicker' },
    { id: 'F2', viewport: { width: 1440, height: 900 }, route: '/carnet/new', label: 'Form - Multi-sélection parcelles' },
    { id: 'F3', viewport: { width: 1440, height: 900 }, route: '/carnet/new?category=semis', label: 'Form - Calcul auto dose Semis' },
    { id: 'F4', viewport: { width: 430, height: 932 }, route: '/carnet/new?category=traitement-phyto', label: 'Form Mobile - ProductPicker fullscreen' },
  ],

  '06_Fumure': [
    { id: 'FU1', viewport: { width: 1440, height: 900 }, route: '/parcellaire/VD_2026_167572?tab=fumure', label: 'Fumure - Panel complet' },
    { id: 'FU2', viewport: { width: 1440, height: 900 }, route: '/parcellaire/VD_2026_167572?tab=fumure&openFumure=N', label: 'Fumure - Drawer N ouvert' },
  ],

  '07_Auth': [
    { id: 'A1', viewport: { width: 1440, height: 900 }, route: '/login', label: 'Login Desktop avec "Essayer démo"' },
    { id: 'A2', viewport: { width: 430, height: 932 }, route: '/login', label: 'Login Mobile' },
  ],

  '08_MultiTenancy': [
    { id: 'M1', viewport: { width: 1440, height: 900 }, route: '/parcellaire', label: 'FarmSwitcher dropdown dans footer' },
  ],

  '09_Bonus': [
    { id: 'B1', viewport: { width: 430, height: 932 }, route: '/parcellaire?tool=draw', label: 'Bonus Mobile - Draw en cours' },
    { id: 'B2', viewport: { width: 430, height: 932 }, route: '/parcellaire?tool=draw', label: 'Bonus Mobile - NewParcelDialog' },
    { id: 'B3', viewport: { width: 1440, height: 900 }, route: '/parametres/produits?filter=phyto', label: 'Bonus Desktop - Catalogue Produits' },
    { id: 'B4', viewport: { width: 1440, height: 900 }, route: '/parametres/utilisateurs', label: 'Bonus Desktop - Liste Utilisateurs' },
    { id: 'B5', viewport: { width: 430, height: 932 }, route: '/parcellaire', label: 'Bonus Mobile - FAB ouvert' },
    { id: 'B6', viewport: { width: 430, height: 932 }, route: '/rh/heures', label: 'Bonus Mobile - RH Heures' },
    { id: 'B7', viewport: { width: 1440, height: 900 }, route: '/carnet?parcel=VD_2026_167572', label: 'Bonus Desktop - Carnet filtrée parcelle' },
    { id: 'B8', viewport: { width: 1440, height: 900 }, route: '/parcellaire?fullscreen=map', label: 'Bonus Desktop - Carte fullscreen' },
  ],
};

// Créer les dossiers
function createDirectories() {
  Object.keys(captures).forEach(dir => {
    const dirPath = path.join(SCREENSHOTS_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✓ Dossier créé: ${dir}`);
    }
  });
}

// Capturer une screenshot
async function captureScreenshot(browser, capture, category) {
  try {
    const page = await browser.newPage();

    // Définir le viewport
    await page.setViewport(capture.viewport);

    // Naviguer vers l'URL
    const fullUrl = `${BASE_URL}${capture.route}`;
    await page.goto(fullUrl, { waitUntil: 'networkidle2' });

    // Attendre un élément spécifique si nécessaire
    if (capture.waitFor) {
      try {
        await page.waitForSelector(capture.waitFor, { timeout: 5000 });
      } catch (e) {
        console.warn(`  ⚠ Élément non trouvé: ${capture.waitFor}`);
      }
    }

    // Attendre un peu pour que tout se charge
    await new Promise(r => setTimeout(r, 500));

    // Créer le nom du fichier
    const filename = `${capture.id}_${capture.label.replace(/\s+/g, '_').replace(/[^\w-]/g, '')}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, category, filename);

    // Capturer
    await page.screenshot({ path: filepath, fullPage: false });

    console.log(`  ✓ ${capture.id}: ${filename}`);

    await page.close();
  } catch (error) {
    console.error(`  ✗ ${capture.id}: ${error.message}`);
  }
}

// Fonction d'authentification démo
async function authenticateDemo(browser) {
  const page = await browser.newPage();

  try {
    console.log('🔐 Authentification avec le bouton Démo...');

    // Aller sur la page de login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });

    // Attendre et cliquer sur le bouton "Essayer démo"
    // Chercher avec plusieurs stratégies
    try {
      // Stratégie 1 : Recherche par texte du bouton
      const buttons = await page.$$('button, a[role="button"]');
      let clicked = false;

      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent?.toLowerCase() || '', button);
        if (text.includes('démo') || text.includes('demo') || text.includes('essayer')) {
          console.log(`  ✓ Bouton trouvé: "${text.trim()}"`);
          await button.click();
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        console.warn('  ⚠ Bouton démo non trouvé, tentative de navigation directe...');
        // Essayer une route directe
        await page.goto(`${BASE_URL}/parcellaire`, { waitUntil: 'networkidle2' });
      } else {
        // Attendre le chargement après clic
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      }

      await new Promise(r => setTimeout(r, 1000));
      console.log('  ✓ Authentification réussie !');
    } catch (error) {
      console.warn(`  ⚠ Erreur lors du clic: ${error.message}`);
      // Continuer quand même
    }
  } catch (error) {
    console.warn(`  ⚠ Erreur lors de l'authentification: ${error.message}`);
  } finally {
    await page.close();
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage de la capture des 33 screenshots...\n');

  // Créer les dossiers
  createDirectories();

  // Lancer Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Authentifier avec le bouton démo d'abord
  await authenticateDemo(browser);

  // Capturer par catégorie
  for (const [category, captureList] of Object.entries(captures)) {
    console.log(`\n📁 ${category}:`);

    for (const capture of captureList) {
      await captureScreenshot(browser, capture, category);
    }
  }

  await browser.close();

  console.log('\n✅ Capture terminée !');
  console.log(`📍 Screenshots sauvegardés dans: ${SCREENSHOTS_DIR}`);
  console.log('\nStructure créée:');
  Object.keys(captures).forEach(dir => {
    console.log(`  - ${dir}/ (${captures[dir].length} images)`);
  });
}

// Vérifier que localhost:5173 est accessible
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/parcellaire`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ Erreur: Impossible de joindre ${BASE_URL}`);
    console.error('   Assurez-vous que l\'application tourne sur localhost:5173');
    process.exit(1);
  }
}

// Exécuter
(async () => {
  await checkServer();
  await main();
})();
