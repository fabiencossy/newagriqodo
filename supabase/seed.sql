-- ========================================================================
-- Seed catalogue cultures Agridéa (42 entrées, 9 catégories)
-- Référentiel partagé entre toutes les exploitations.
-- ========================================================================
-- Source : app/src/modules/assolement/cultures.ts (à garder synchronisé).
-- Idempotent via ON CONFLICT — safe à rejouer.

insert into public.cultures (key, label, color, category) values
  -- Céréales
  ('wheat-winter',     'Blé d''automne',          '#f97316', 'cereal'),
  ('wheat-spring',     'Blé de printemps',        '#fb923c', 'cereal'),
  ('durum-wheat',      'Blé dur',                 '#c2410c', 'cereal'),
  ('barley-winter',    'Orge d''automne',         '#fbbf24', 'cereal'),
  ('barley-spring',    'Orge de printemps',       '#fde047', 'cereal'),
  ('oats',             'Avoine',                  '#facc15', 'cereal'),
  ('rye',              'Seigle',                  '#eab308', 'cereal'),
  ('triticale',        'Triticale',               '#d97706', 'cereal'),
  ('spelt',            'Épeautre',                '#92400e', 'cereal'),

  -- Oléagineux
  ('rapeseed-winter',  'Colza d''automne',        '#fef08a', 'oilseed'),
  ('rapeseed-spring',  'Colza de printemps',      '#fde68a', 'oilseed'),
  ('sunflower',        'Tournesol',               '#f59e0b', 'oilseed'),
  ('soybean',          'Soja',                    '#a3e635', 'oilseed'),
  ('linseed',          'Lin oléagineux',          '#0ea5e9', 'oilseed'),

  -- Protéagineux
  ('pea',              'Pois protéagineux',       '#22c55e', 'protein'),
  ('faba-bean',        'Féverole',                '#14b8a6', 'protein'),
  ('lupin',            'Lupin',                   '#06b6d4', 'protein'),

  -- Sarclées
  ('corn-grain',       'Maïs grain',              '#ea580c', 'root'),
  ('corn-silage',      'Maïs ensilage',           '#dc2626', 'root'),
  ('sugar-beet',       'Betterave sucrière',      '#ec4899', 'root'),
  ('fodder-beet',      'Betterave fourragère',    '#f472b6', 'root'),
  ('potato',           'Pomme de terre',          '#a855f7', 'root'),

  -- Prairies / fourrages
  ('natural-meadow',   'Prairie naturelle',       '#4ade80', 'forage'),
  ('temporary-meadow', 'Prairie temporaire',      '#34d399', 'forage'),
  ('artificial-meadow','Prairie artificielle',    '#10b981', 'forage'),
  ('grass-mix',        'Mélange fourrager (M)',   '#059669', 'forage'),
  ('lucerne',          'Luzerne',                 '#6366f1', 'forage'),
  ('clover',           'Trèfle',                  '#8b5cf6', 'forage'),
  ('pasture',          'Pâturage',                '#65a30d', 'forage'),

  -- Biodiversité
  ('flower-fallow',    'Jachère florale',         '#e879f9', 'biodiversity'),
  ('rotational-fallow','Jachère tournante',       '#d946ef', 'biodiversity'),
  ('flower-strip',     'Bande fleurie',           '#f0abfc', 'biodiversity'),
  ('litter-area',      'Surface à litière',       '#a3a380', 'biodiversity'),
  ('extensive-meadow', 'Prairie extensive',       '#bef264', 'biodiversity'),

  -- Cultures spéciales
  ('vineyard',         'Vigne',                   '#7c3aed', 'special'),
  ('orchard',          'Verger',                  '#db2777', 'special'),
  ('field-vegetables', 'Légumes plein champ',     '#0891b2', 'special'),
  ('market-garden',    'Maraîchage',              '#0284c7', 'special'),
  ('aromatic-plants',  'Plantes aromatiques',     '#5eead4', 'special'),
  ('tobacco',          'Tabac',                   '#78350f', 'special'),

  -- Couverts / engrais verts
  ('green-manure',     'Engrais vert',            '#16a34a', 'cover'),
  ('cover-crop',       'Couvert végétal',         '#15803d', 'cover'),

  -- Jachère / improductif
  ('fallow',           'Jachère',                 '#a3a380', 'fallow'),
  ('bare-soil',        'Sol nu / Labour',         '#a8a29e', 'fallow'),
  ('forest',           'Forêt',                   '#064e3b', 'fallow'),
  ('unproductive',     'Surface improductive',    '#525252', 'fallow'),

  -- Autre
  ('archived',         'Archivé',                 '#9ca3af', 'other')
on conflict (key) do update set
  label = excluded.label,
  color = excluded.color,
  category = excluded.category;
