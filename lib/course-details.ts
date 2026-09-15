import { formations } from './formations';

type CourseDetail = {
  slug: string;
  tagline: string;
  introduction: string;
  profile: string;
  skills: { title: string; text: string }[];
  careers: string[];
  project: { title: string; text: string };
  imageAlt: string;
};

export const courseDetails: Record<string, CourseDetail> = {
  F4: {
    slug: 'genie-civil', tagline: 'Donnez des fondations à vos idées.',
    introduction: 'Derrière chaque bâtiment, il y a une idée, un plan et une méthode. Le génie civil relie le dessin technique, la connaissance des matériaux et la compréhension des ouvrages. Une voie pour celles et ceux qui veulent comprendre comment nos espaces prennent forme.',
    profile: 'Vous aimez le dessin, les mathématiques et les réalisations concrètes. Vous êtes curieux de comprendre comment se construisent les bâtiments et vous appréciez le travail précis.',
    skills: [{ title: 'Lire et représenter', text: 'Comprendre les plans, les échelles et les représentations d’un ouvrage.' }, { title: 'Connaître les matériaux', text: 'Découvrir le rôle du béton, des armatures, des briques et des matériaux de construction.' }, { title: 'Mesurer et organiser', text: 'Aborder les métrés, les quantités et les étapes d’un projet de construction.' }, { title: 'Observer un ouvrage', text: 'Relier les choix techniques à la stabilité, à l’usage et à la qualité d’une réalisation.' }],
    careers: ['Dessin et études du bâtiment', 'Travaux et suivi de chantier', 'Poursuite d’études en génie civil'],
    project: { title: 'De l’esquisse à la maquette', text: 'Imaginer un petit bâtiment, représenter son plan et expliquer le choix de ses matériaux : une façon concrète de découvrir la logique d’un projet.' },
    imageAlt: 'Illustration du génie civil : maquette architecturale, plans, casque bleu et briques.',
  },
  F3: {
    slug: 'electrotechnique', tagline: 'Comprenez l’énergie. Faites avancer le monde.',
    introduction: 'L’électrotechnique explore la manière dont l’énergie électrique est produite, distribuée et utilisée. Des circuits aux moteurs, elle associe raisonnement scientifique, lecture de schémas et compréhension des équipements.',
    profile: 'Vous aimez les sciences, les systèmes techniques et la recherche de solutions. La rigueur et le respect des consignes sont essentiels dans cette voie.',
    skills: [{ title: 'Comprendre les circuits', text: 'Relier les grandeurs électriques au fonctionnement d’un circuit.' }, { title: 'Lire les schémas', text: 'Reconnaître les composants et suivre la logique d’un montage électrique.' }, { title: 'Explorer les machines', text: 'Découvrir les moteurs, leurs usages et leurs principes de fonctionnement.' }, { title: 'Mesurer avec méthode', text: 'Comprendre le rôle des appareils de mesure et des règles de prévention.' }],
    careers: ['Équipements et maintenance électriques', 'Installations industrielles', 'Poursuite d’études en électrotechnique'],
    project: { title: 'Comprendre une commande de moteur', text: 'Étudier un schéma pédagogique pour identifier les organes de commande et de protection, puis expliquer leur rôle.' },
    imageAlt: 'Illustration de l’électrotechnique : moteur, bobines de cuivre et tableau pédagogique.',
  },
  DWEB: {
    slug: 'developpement-web', tagline: 'Vos idées méritent de prendre vie à l’écran.',
    introduction: 'Le développement web transforme une idée en un site ou une application que l’on peut utiliser. Cette filière associe logique, créativité et résolution de problèmes pour construire des expériences numériques utiles.',
    profile: 'Vous êtes curieux du numérique, vous aimez créer et vous avez envie de comprendre ce qui se cache derrière les sites que vous utilisez.',
    skills: [{ title: 'Structurer une page', text: 'Découvrir le rôle du HTML et organiser un contenu clair et accessible.' }, { title: 'Donner forme aux idées', text: 'Aborder les styles, la mise en page et l’adaptation aux écrans avec le CSS.' }, { title: 'Créer des interactions', text: 'Comprendre comment la programmation fait réagir une interface aux actions de son utilisateur.' }, { title: 'Construire avec méthode', text: 'Décomposer un problème, tester une réalisation et améliorer son fonctionnement.' }],
    careers: ['Intégration et développement web', 'Création de sites et services numériques', 'Poursuite d’études en informatique'],
    project: { title: 'Un premier site pour un vrai besoin', text: 'Imaginer le site d’une association ou d’un artisan : présenter son activité, organiser les informations et faciliter la prise de contact.' },
    imageAlt: 'Illustration du développement web : ordinateur avec une interface graphique et objets bleus.',
  },
  MMV: {
    slug: 'maintenance-vehicules', tagline: 'Comprendre la mécanique. Trouver la solution.',
    introduction: 'La maintenance des véhicules s’intéresse au fonctionnement, à l’entretien et au diagnostic des systèmes automobiles. Elle demande de l’observation, un raisonnement méthodique et le goût du travail technique.',
    profile: 'Vous aimez comprendre comment fonctionnent les machines. Vous êtes patient, attentif aux détails et intéressé par l’univers automobile.',
    skills: [{ title: 'Explorer les systèmes', text: 'Identifier les grands ensembles d’un véhicule et comprendre leurs fonctions.' }, { title: 'Observer et diagnostiquer', text: 'Relier un symptôme à des pistes de recherche et organiser les vérifications.' }, { title: 'Connaître les outils', text: 'Découvrir l’outillage, les instruments de contrôle et leur bon usage.' }, { title: 'Entretenir avec rigueur', text: 'Comprendre l’importance des procédures, de la traçabilité et de la sécurité.' }],
    careers: ['Entretien et réparation automobile', 'Diagnostic et assistance en atelier', 'Poursuite d’études en maintenance'],
    project: { title: 'Raconter le fonctionnement d’un moteur', text: 'À partir d’un modèle pédagogique, repérer les principales pièces et expliquer comment elles travaillent ensemble.' },
    imageAlt: 'Illustration de la maintenance automobile : coupe de moteur, outils et gants de mécanicien.',
  },
  HR: {
    slug: 'hotellerie-restauration', tagline: 'Faites de l’accueil un véritable savoir-faire.',
    introduction: 'Accueillir, servir et organiser : l’hôtellerie et la restauration réunissent des métiers où la qualité de l’expérience humaine compte autant que la précision du geste. Cette voie mêle sens du service, présentation et travail d’équipe.',
    profile: 'Vous aimez le contact, les environnements dynamiques et le travail bien fait. Vous avez envie de créer une expérience agréable pour les autres.',
    skills: [{ title: 'Accueillir et communiquer', text: 'Comprendre les attentes d’un client et adopter une communication professionnelle.' }, { title: 'Préparer le service', text: 'Découvrir la mise en place, le dressage et l’organisation des espaces.' }, { title: 'Travailler en équipe', text: 'Coordonner les tâches et comprendre les liens entre salle, cuisine et accueil.' }, { title: 'Prendre soin des détails', text: 'Relier hygiène, présentation et qualité de service à la satisfaction du client.' }],
    careers: ['Service en restauration', 'Accueil et activités hôtelières', 'Poursuite d’études en hôtellerie-restauration'],
    project: { title: 'Imaginer une expérience d’accueil', text: 'Préparer une table, réfléchir au parcours d’un client et expliquer les détails qui rendent un service attentionné.' },
    imageAlt: 'Illustration de l’hôtellerie-restauration : table dressée, serviette bleue et sonnette d’accueil.',
  },
  EB: {
    slug: 'electricite-batiment', tagline: 'Un métier concret au cœur de chaque bâtiment.',
    introduction: 'L’électricité bâtiment concerne les installations qui alimentent les lieux de vie et de travail. Comprendre un circuit, repérer ses composants et respecter les règles de sécurité sont au cœur de ce métier pratique.',
    profile: 'Vous recherchez un métier manuel et technique. Vous aimez travailler avec soin, suivre une méthode et comprendre les installations du quotidien.',
    skills: [{ title: 'Lire une installation', text: 'Reconnaître les symboles et comprendre la représentation d’un circuit domestique.' }, { title: 'Identifier le matériel', text: 'Distinguer les conducteurs, appareillages et dispositifs de protection.' }, { title: 'Organiser le travail', text: 'Préparer une intervention et comprendre les étapes de réalisation d’une installation.' }, { title: 'Prévenir les risques', text: 'Placer les règles de sécurité et les vérifications au centre de toute intervention.' }],
    careers: ['Installation électrique du bâtiment', 'Entretien des installations', 'Activité artisanale après expérience'],
    project: { title: 'Lire un circuit d’éclairage', text: 'Sur un support pédagogique, identifier le rôle de chaque composant et expliquer le trajet de l’alimentation.' },
    imageAlt: 'Illustration de l’électricité bâtiment : tableau hors tension, câbles et outils isolés.',
  },
  CP: {
    slug: 'cuisine-patisserie', tagline: 'Du geste juste au plaisir de partager.',
    introduction: 'La cuisine et la pâtisserie donnent une place à la créativité, mais aussi à la précision. Comprendre les produits, organiser les préparations et soigner la présentation permet de transformer des ingrédients en une réalisation aboutie.',
    profile: 'Vous aimez cuisiner, découvrir des saveurs et créer avec vos mains. Vous êtes prêt à travailler avec méthode, propreté et régularité.',
    skills: [{ title: 'Connaître les produits', text: 'Découvrir les ingrédients, leurs usages et les principes de conservation.' }, { title: 'Préparer avec méthode', text: 'Comprendre la mise en place, les pesées et l’organisation du poste de travail.' }, { title: 'Explorer les techniques', text: 'Aborder les familles de préparations culinaires, les pâtes et les cuissons.' }, { title: 'Présenter et partager', text: 'Associer goût, dressage et règles d’hygiène à chaque réalisation.' }],
    careers: ['Cuisine en restauration', 'Production en pâtisserie', 'Projet de restauration ou de traiteur après expérience'],
    project: { title: 'Imaginer une tarte de saison', text: 'Choisir des ingrédients, organiser les étapes d’une recette et réfléchir à une présentation simple et soignée.' },
    imageAlt: 'Illustration de la cuisine et pâtisserie : tarte dorée, fouet, ingrédients et tablier bleu.',
  },
  IMPS: {
    slug: 'panneaux-solaires', tagline: 'Faites une place au soleil dans votre avenir.',
    introduction: 'Une installation solaire réunit plusieurs équipements qui convertissent et gèrent l’énergie du soleil. Ce métier demande de comprendre leur rôle, les contraintes du site et l’importance d’une installation bien réalisée et entretenue.',
    profile: 'Vous vous intéressez aux énergies renouvelables et aux équipements techniques. Vous aimez les réalisations concrètes et les démarches méthodiques.',
    skills: [{ title: 'Comprendre le photovoltaïque', text: 'Découvrir comment les cellules solaires transforment la lumière en électricité.' }, { title: 'Identifier les équipements', text: 'Reconnaître les panneaux, régulateurs, onduleurs et éléments de stockage.' }, { title: 'Penser une installation', text: 'Comprendre les besoins, l’orientation et les contraintes d’un projet solaire.' }, { title: 'Suivre et entretenir', text: 'Découvrir le rôle des contrôles, de l’entretien et des règles de prévention.' }],
    careers: ['Installation de systèmes solaires', 'Entretien d’équipements photovoltaïques', 'Services techniques dans les énergies renouvelables'],
    project: { title: 'Comprendre un petit système solaire', text: 'Associer chaque équipement à sa fonction et expliquer le chemin de l’énergie, du panneau à l’appareil alimenté.' },
    imageAlt: 'Illustration du solaire : panneau photovoltaïque, régulateur et équipements de protection.',
  },
  MAC: {
    slug: 'maconnerie', tagline: 'Construisez de vos mains, avec précision.',
    introduction: 'La maçonnerie donne forme aux éléments essentiels d’un bâtiment. Elle associe connaissance des matériaux, maîtrise des outils, lecture des repères et attention à la qualité d’exécution.',
    profile: 'Vous aimez les activités manuelles et les résultats visibles. Vous avez envie de développer un geste précis et de participer à des réalisations durables.',
    skills: [{ title: 'Reconnaître les matériaux', text: 'Découvrir les blocs, les briques, les liants et leurs usages dans la construction.' }, { title: 'Mesurer et repérer', text: 'Comprendre les niveaux, les alignements et les dimensions d’un ouvrage.' }, { title: 'Préparer et assembler', text: 'Aborder l’organisation du poste et les principes de mise en œuvre.' }, { title: 'Contrôler la qualité', text: 'Observer la régularité d’un ouvrage et respecter les règles de sécurité du chantier.' }],
    careers: ['Maçonnerie et gros œuvre', 'Travaux de construction et de rénovation', 'Activité artisanale après expérience'],
    project: { title: 'Un angle de mur bien réalisé', text: 'Observer une maquette de mur pour comprendre l’assemblage, l’alignement et le rôle des joints.' },
    imageAlt: 'Illustration de la maçonnerie : angle de mur en briques, truelle et niveau bleu.',
  },
  SER: {
    slug: 'serigraphie', tagline: 'Faites passer vos idées à l’impression.',
    introduction: 'La sérigraphie permet de reproduire un motif sur un support à travers un écran. À la rencontre de la création et de la technique, elle demande de préparer un visuel, choisir ses couleurs et maîtriser la régularité du geste.',
    profile: 'Vous aimez le dessin, les couleurs et les objets personnalisés. Vous avez le sens du détail et l’envie de transformer une création en un produit concret.',
    skills: [{ title: 'Préparer un visuel', text: 'Penser un motif adapté au support et aux contraintes de l’impression.' }, { title: 'Comprendre l’écran', text: 'Découvrir le cadre, la maille et le rôle du pochoir dans la reproduction.' }, { title: 'Travailler la couleur', text: 'Identifier les encres et comprendre leur interaction avec le support.' }, { title: 'Soigner le résultat', text: 'Observer le repérage, la netteté et la régularité d’une série imprimée.' }],
    careers: ['Impression textile', 'Personnalisation d’objets et de supports', 'Atelier de création et d’impression'],
    project: { title: 'Un motif, une identité', text: 'Créer un motif simple pour un textile et réfléchir à son placement, sa couleur et sa répétition.' },
    imageAlt: 'Illustration de la sérigraphie : cadre, raclette, encre bleue et textile imprimé.',
  },
  REV: {
    slug: 'revetement-finitions', tagline: 'Le détail qui transforme un espace.',
    introduction: 'Carrelage, peinture et staff donnent leur aspect final aux espaces. Les métiers du revêtement combinent préparation des supports, maîtrise des matériaux et sens de la finition pour réaliser un ensemble harmonieux.',
    profile: 'Vous aimez les travaux manuels, les couleurs et les belles finitions. Vous êtes patient et attentif à la précision des gestes comme à la qualité du résultat.',
    skills: [{ title: 'Préparer un support', text: 'Comprendre pourquoi l’état d’une surface détermine la qualité de la finition.' }, { title: 'Découvrir le carrelage', text: 'Aborder les formats, le calepinage, les alignements et les joints.' }, { title: 'Explorer la peinture', text: 'Distinguer les produits, les outils et les effets de finition.' }, { title: 'Comprendre le staff', text: 'Découvrir les éléments décoratifs en plâtre et leur place dans un aménagement.' }],
    careers: ['Pose de revêtements et carrelage', 'Peinture du bâtiment', 'Décoration en staff et finitions'],
    project: { title: 'Composer une palette de matières', text: 'Associer une teinte, un carreau et un élément de staff pour imaginer la finition cohérente d’un espace.' },
    imageAlt: 'Illustration des finitions : carreaux, corniche en staff, rouleau et peinture bleue.',
  },
};

export function getCourseBySlug(slug: string) {
  const formation = formations.find(item => courseDetails[item.code]?.slug === slug);
  return formation ? { ...formation, ...courseDetails[formation.code] } : undefined;
}
export function courseHref(code: string) { return `/formations/${courseDetails[code].slug}`; }
export function courseImage(code: string, thumbnail = false) { return `/images/formations/${code.toLowerCase()}${thumbnail ? '-card' : ''}.webp`; }
