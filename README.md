# Notre Dame de Lourdes

Site Next.js / React / TypeScript pour le lycée technique et le centre de formation de Dassa-Zoumè.

## Démarrer

```sh
npm install
npm run dev
```

Ouvrir http://localhost:3000. Pour la production : `npm run build`, puis `npm start`.

Les commandes utilisent Webpack. Sur Windows, `scripts/next.mjs` charge le compilateur WebAssembly si la politique système bloque le module natif. Le chemin WASM explicite utilise un mécanisme interne de Next.js : revérifier cette compatibilité lors des mises à jour. Sur les autres plateformes, Next.js utilise son compilateur habituel.

## Pages et interactions

- `/` : accueil responsive, formations filtrées par parcours, FAQ et liens WhatsApp.
- `/formations/[slug]` : onze fiches illustrées avec présentation, compétences du domaine, exemple de projet, perspectives et préinscription contextualisée. Les contenus sont dans `lib/course-details.ts`.
- `/inscription?formation=F4` : formulaire, validation, récapitulatif et passage explicite vers WhatsApp. Aucune inscription n’est enregistrée automatiquement : l’envoi et l’admission restent à confirmer par le secrétariat.
- `/bibliotheque` : recherche, filtres et téléchargement des vrais documents publiés. Aucun faux document préchargé.
- `/administration` : publication de PDF protégée par une clé côté serveur, contrôle du format et limite de 15 Mo.
- `/confidentialite` : fonctionnement des données et services externes.

## Activer les dépôts

Copier `.env.example` vers `.env.local`, générer une clé aléatoire d’au moins 32 caractères et renseigner `ADMIN_UPLOAD_TOKEN`. Ne jamais publier cette clé ni la préfixer par `NEXT_PUBLIC_`. La communiquer uniquement aux personnes autorisées. Aucun dépôt n’est permis tant que la clé n’est pas configurée.

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Le serveur stocke les PDF et leurs métadonnées dans `data/documents`, hors du dossier public. `DOCUMENTS_DIR` permet de choisir un volume persistant. Prévoir sauvegardes et contrôle de débit au niveau de l’hébergeur. Ce stockage convient à une instance Node.js avec disque persistant. Pour Vercel ou plusieurs instances, remplacer le stockage local par un stockage objet et une base de données avant la mise en production. Configurer la limite de requête du proxy à au moins 16 Mo et HTTPS. Les PDF sont publics : publier uniquement des supports autorisés sans données personnelles.

Pour retirer un document, supprimer son fichier `.json` puis le PDF du même identifiant dans le volume documentaire. Le site n’inclut pas encore de gestion des comptes administrateurs ni d’interface de suppression.

## Identité et contenu à valider

Le logo fourni dans `logo.jpeg` est intégré dans la navigation via `public/images/logo.webp`. Le prospectus `Prsospectus.jpeg` a été consulté. L’identité conserve le bleu et le blanc souhaités, avec des illustrations chaleureuses des métiers.

- Confirmer les intitulés officiels des filières (notamment MMV et HR).
- Les durées et diplômes du prospectus ne sont pas rattachés précisément à chaque filière : leur correspondance reste à confirmer avant publication sur les fiches.
- Les descriptions présentent les domaines et des exemples possibles, sans annoncer un programme officiel ni garantir un débouché.
- Compléter les conditions d’admission, frais, calendrier, adresse exacte et informations légales après validation par l’établissement.
- WhatsApp : `+229 01 95 61 62 44`, défini dans `lib/formations.ts`.
- Les polices DM Sans, Manrope et Instrument Serif viennent de Google Fonts ; des polices système prennent le relais si ce service est inaccessible.

## Vérifications

```sh
npm run build
npm run typecheck
npx playwright install chromium
npm test
```

Les quatre scénarios vérifient le parcours WhatsApp mobile, les onze fiches et leurs images, la navigation au clavier et avec réduction des mouvements, puis le dépôt et le téléchargement des PDF. Les tests utilisent un répertoire documentaire temporaire isolé et une clé de test. Ils ne contactent pas WhatsApp et ne transmettent aucune demande à l’établissement.

## Images et animations

Les onze illustrations ont été générées avec l’outil intégré `imagegen`. Les prompts complets et les fichiers finaux sont consignés dans `scripts/generated-assets.json`. Les images finales sont dans `public/images/formations/`, en WebP : une version de 1440 px par fiche et une vignette de 640 px pour les cartes. Les 22 fichiers totalisent environ 2,4 Mo. Les images sont servies localement et chargées paresseusement, sauf l’image principale d’une fiche.

Ce sont des illustrations des métiers, signalées comme telles, et non des photographies des locaux ou des élèves. Les originaux générés ont été conservés dans le répertoire de génération ; les assets nécessaires au site sont tous copiés dans le projet.

`components/Motion.tsx` gère les révélations au défilement et la progression de lecture. `app/experience.css` contient les animations d’entrée, de cartes, d’accordéons et de boutons. Les animations automatiques sont courtes, ne tournent pas indéfiniment et respectent `prefers-reduced-motion`. Le contenu reste disponible sans JavaScript.

Les documents enregistrés avec l’ancien niveau « Institut » sont présentés sous « Centre de formation » lors de la lecture, sans modifier les fichiers existants.
