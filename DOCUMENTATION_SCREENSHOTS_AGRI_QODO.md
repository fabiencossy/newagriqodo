# 📸 Documentation des Screenshots - Agri Qodo

## 🎯 Objectif
Présentation visuelle de l'application Agri Qodo pour site web de marketing/présentation produit. Screenshots documentées pour CloudCode.

---

## 📱 Screenshots Prises - Mode Desktop (11 au total)

### **Screenshot 1 : Vue Parcellaire - Carte Interactive**
- **URL** : http://localhost:5173/parcellaire
- **Description** : Page d'accueil avec vue cartographique des parcelles
- **Contenu** :
  - Carte satellite/terrain des propriétés agricoles
  - Parcelles colorées (orange, vert) avec identifiants et superficies
  - Menu latéral avec navigation principale (Parcellaire, Carnet, Travaux, Troupeau, RH, Paramètres)
  - Boutons de vue : Carte, Table, Dashboard
  - Barre de recherche pour filtrer les parcelles
  - Info utilisateur "Fabien Cossy - Domaine Darval"
- **Cas d'usage** : Vue d'ensemble des terrains gérés, navigation spatiale

---

### **Screenshot 2 : Vue Table - Listing des Parcelles**
- **URL** : http://localhost:5173/parcellaire (onglet Table)
- **Description** : Tableau complet des 25 parcelles
- **Contenu** :
  - Colonnes : Code, Nom, Surface (ha), Culture, Variété, Statut, Année
  - 25 parcelles listées avec données structurées
  - Statuts visuels : "ACTIF" (vert), "ARCHIVÉ" (gris)
  - Cultures variées : Prairie, Pâturage, Forêt, Maïs, Blé, etc.
  - Surface totale : 34.1 ha
- **Cas d'usage** : Consultation et recherche rapide, vue analytique des données

---

### **Screenshot 3 : Dashboard - KPIs Agricoles**
- **URL** : http://localhost:5173/parcellaire (onglet Dashboard)
- **Description** : Tableau de bord synthétique
- **Contenu** :
  - KPI 1 : Surface totale = 34.1 ha
  - KPI 2 : Nombre de parcelles = 25
  - Graphique en barres "Par culture" avec répartition en ha et %
  - Cultures : Pâturage (35%), Prairie temporaire (28%), Prairie extensive (13%), Forêt (12%), etc.
  - Vue analytique et insight pour décisions stratégiques
- **Cas d'usage** : Résumé exécutif, gestion de la ressource foncière

---

### **Screenshot 4 : Carnet des Champs - Interventions Agricoles**
- **URL** : http://localhost:5173/carnet
- **Description** : Cahier de traçabilité des 22 interventions en 2026
- **Contenu** :
  - Colonnes : Date, Catégorie, Parcelle, Produit/Opération, Dose, Opérateur
  - 22 interventions enregistrées par année
  - Catégories : Fertilisation, Traitement phyto, Observation, Récolte, Semis
  - Opérateur : F. Cossy
  - Doses précises : kg/ha, L/ha, ms/ha, etc.
  - Détail des produits : Urée 46%, Adexar, Moddus Evo, etc.
- **Cas d'usage** : Conformité réglementaire (BDTA, IGD), traçabilité complète des pratiques

---

### **Screenshot 5 : Travaux - Module en Construction**
- **URL** : http://localhost:5173/travaux
- **Description** : Section gestion des tâches (en développement)
- **Contenu** :
  - Titre : "Travaux - Gestion des tâches pour tiers"
  - État : "Module en construction"
  - Description : "Création, assignation et suivi des travaux. Liaison Odoo obligatoire (employés + analytics)."
  - Feuille de route visible au utilisateur
- **Cas d'usage** : Futur management des heures et travaux sous-traités

---

### **Screenshot 6 : Troupeau - Module Bétail (Construction)**
- **URL** : http://localhost:5173/troupeau
- **Description** : Section gestion du bétail (en développement)
- **Contenu** :
  - Titre : "Troupeau - Animaux, événements, historique"
  - État : "Module en construction"
  - Description : "Module troupeau fonctionnant hors ligne (Odoo optionnel pour sync registre)"
  - Prévu pour gestion du cheptel et suivi sanitaire
- **Cas d'usage** : Gestion intégrée culture + élevage

---

### **Screenshot 7 : RH - Gestion des Heures**
- **URL** : http://localhost:5173/rh/heures
- **Description** : Bilan horaire des employés
- **Contenu** :
  - Onglets : "Mes heures", "Mes congés"
  - Tableau "Bilan heures" par mois (Janvier à Mai 2026)
  - Colonnes : Mois, Heures travaillées, Heures dues, Solde, Congés
  - YTD TOTAL : 737h travaillées vs 722h dues, solde +15h (vert)
  - Code couleur : heures supplémentaires (vert), heures manquantes (rouge), équilibré (gris)
  - Gestion des congés et heures supplémentaires
- **Cas d'usage** : Paie, conformité temps de travail

---

### **Screenshot 8 : Parcellaire - Vue Carte Satellite Détaillée**
- **URL** : http://localhost:5173/parcellaire (vue Carte)
- **Description** : Carte satellite haute résolution avec labels
- **Contenu** :
  - Zoom sur les parcelles avec noms et superficies
  - Imagery swisstopo (données officielles suisses)
  - Parcelles colorées et délimitées avec précision GPS
  - Outils cartographiques : zoom, pan, sélection
  - Fond de carte personnalisable
- **Cas d'usage** : Vérification terrain, contrôle d'identité parcellaire

---

### **Screenshot 9 : Fiche Parcelle - Panneau Détail Latéral**
- **Description** : Vue d'information latérale d'une parcelle (panel droit)
- **Contenu** :
  - En-tête : Code + Nom parcelle + Superficie + Culture
  - **Plan d'assolement** : calendrier visuel de rotation des cultures
  - **Segments** : détail des variétés par sous-zone
  - **Dernières interventions** : liste du Carnet avec dates
  - Lien direct vers Carnet complet
  - Bouton "Ouvrir la fiche complète"
- **Cas d'usage** : Consultation rapide au clic sur la carte

---

### **Screenshot 10 : Fiche Parcelle Complète - Onglet Aperçu**
- **URL** : http://localhost:5173/parcellaire/[CODE_PARCELLE]
- **Description** : Page complète de détail parcelle, onglet Aperçu
- **Contenu** :
  - **IDENTIFICATION** : Code, Nom, Surface (ha), Année, Statut (dropdown Actif/Archivé)
  - **LOCALISATION** : Carte satellite avec surbrillance parcelle
  - **ASSOLEMENT** : Culture actuelle, dates de culture, variété
  - **CARNET** : Nombre interventions, dernière opération, date
  - **PLAN DE FUMURE** : % couverture N, détail kg/ha
  - **NOTES** : Zone texte libre pour observations
  - Onglets supérieurs : Aperçu, Carnet, Assolement, Fumure, Statistiques, Localisation
- **Cas d'usage** : Vue d'ensemble complète d'une parcelle

---

### **Screenshot 11 : Carnet des Champs - Historique Parcelle**
- **URL** : http://localhost:5173/parcellaire/[CODE_PARCELLE] (onglet Carnet)
- **Description** : Historique complet des 9 interventions sur une parcelle
- **Contenu** :
  - Tableau "CARNET DES CHAMPS - 9 INTERVENTIONS"
  - Colonnes : Date, Catégorie, Produit/Opération, Dose, Opérateur
  - Catégories avec icônes colorées :
    - 🟡 Fertilisation (Urée 46%, Ammonitrate 27%)
    - 🟢 Semis (Limagrain LG31.330)
    - 🟡 Récolte (Moisson)
    - 🔴 Traitement phyto (Adexar, Moddus Evo, Axial One)
  - Dates : 2024-2026, historique complet
  - Dose précises : kg/ha, grains/ha, L/ha, q/ha
  - Opérateur : Fabien Cossy
- **Cas d'usage** : Traçabilité réglementaire (BDTA, IGD, bio), audit trail complet

---

## 🎨 Design & UX Observations

### Couleurs & Icônes
- **Menu latéral** : Gris clair avec icônes minimalistes
- **Statuts** : Vert (Actif), Gris (Archivé), Orange (Attention)
- **Cultures** : Codes couleur (vert=prairie, orange=champs, marron=forêt)
- **Catégories Carnet** : Icônes distinctes pour chaque type d'opération

### Responsive Design
- Interface desktop-first avec 1500px+ width
- Menu latéral fixe, contenu principal scrollable
- Panneaux latéraux supplémentaires pour détails

### Navigation
- Menu latéral persistent
- Navigation par onglets
- Breadcrumbs et back buttons
- Lien directs entre sections (ex: Parcellaire → Carnet)

---

## 🎯 Points Clés pour Site Web

### Valeurs Uniques
1. **Traçabilité complète** : Chaque opération enregistrée avec date, produit, dose
2. **Vue cartographique** : Localisation précise GPS des parcelles
3. **Intégration Odoo** : Connexion native aux données métier
4. **Conformité réglementaire** : Respect normes suisses (BDTA, IGD)
5. **Dashboard analytique** : Vue synthétique resources foncières

### Modules Actuels
✅ Parcellaire (Cartes + Tables + Dashboard)
✅ Carnet des champs (Traçabilité)
✅ RH (Heures + Congés)
🚧 Travaux (En construction)
🚧 Troupeau (En construction)

### Public Cible
- **Agriculteurs suisses** (exploitations moyennes/grandes)
- **Groupements d'agriculteurs**
- **Conseillers agricoles**
- **Coopératives** (pour membres)

---

## 📊 Statistiques Affichées

- **Surface totale** : 34.1 hectares
- **Nombre de parcelles** : 25
- **Interventions 2026** : 22
- **Cultures principales** : Pâturage (35%), Prairie (28%), Forêt (12%), Maïs (5%)
- **Heures travaillées YTD** : 737h vs 722h dues (+15h surplus)

---

## 🔐 Données de Démo

- **Utilisateur** : Fabien Cossy
- **Domaine** : Domaine Darval (Vaud/Vevey)
- **Année focus** : 2026
- **Exemple parcelle** : VD_2026_167572 "LA GRANGE À JAUNIN sur pierraz 39" (1.63 ha, Maïs ensilage)

---

## 💡 Suggestions pour Site Web

### Screenshots à Utiliser
1. **Hero** : Screenshot 1 ou 8 (carte satellite impressionnante)
2. **Features** : Screenshots 2, 3, 4 (Table, Dashboard, Carnet)
3. **Deep Dive** : Screenshots 9, 10, 11 (détails parcelle)
4. **Roadmap** : Screenshots 5, 6 (modules en construction)

### Textes Proposés
- **Titre** : "Agri Qodo : Gestion agricole intégrée pour la Suisse"
- **Subtitle** : "Parcelles, carnet de traçabilité, RH - tout en un"
- **CTA** : "Demander une démo" ou "Démarrer gratuitement"

---

**Généré le** : 16 mai 2026
**Format** : 11 screenshots desktop, prêts pour site web
**Prochaine étape** : Captures en mode mobile (responsive)

---

## 📎 IDs des Screenshots (pour référence)

| Screenshot | ID | URL |
|-----------|----|----|
| 1. Carte Interactive | ss_3186c545r | /parcellaire |
| 2. Table Parcelles | ss_5695me0yf | /parcellaire (Table) |
| 3. Dashboard | ss_2595qttd7 | /parcellaire (Dashboard) |
| 4. Carnet | ss_4070ey95m | /carnet |
| 5. Travaux | ss_19088bi0w | /travaux |
| 6. Troupeau | ss_96613izpo | /troupeau |
| 7. RH Heures | ss_8047iwrn7 | /rh/heures |
| 8. Carte Détaillée | ss_19505klwf | /parcellaire (Carte) |
| 9. Panneau Détail | ss_8631qsa7g | /parcellaire (detail panel) |
| 10. Fiche Aperçu | ss_64665wicd | /parcellaire/VD_2026_167572 |
| 11. Carnet Détail | ss_8663tmt0e | /parcellaire/VD_2026_167572 (Carnet) |
