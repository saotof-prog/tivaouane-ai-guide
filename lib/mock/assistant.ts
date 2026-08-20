export type AssistantRole = "user" | "assistant";

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  content: string;
};

export type SuggestedQuestion = {
  id: string;
  label: string;
};

export const mockSuggestedQuestions: SuggestedQuestion[] = [
  {
    id: "horaires",
    label: "Quels sont les horaires de la Grande Mosquée ?",
  },
  {
    id: "restaurants",
    label: "Où manger du bon thieboudienne à Tivaouane ?",
  },
  {
    id: "zawiya",
    label: "Raconte-moi l’histoire de la zawiya de Tivaouane",
  },
  {
    id: "gourmets",
    label: "Que rapporter comme gourmandises en souvenir ?",
  },
];

const mockReplies = {
  horaires: `En tant que démonstration, voici la réponse que le futur assistant intelligent pourra vous donner :

La Grande Mosquée de Tivaouane est généralement ouverte de l’aube jusqu’à la fin de la nuit, notamment lors des visites des pèlerins. Pour les horaires exacts selon la saison, l’assistant s’appuiera sur les informations officielles publiées par le comité de la zawiya.`,
  restaurants: `Démonstration — réponse en attente de la base de connaissances :

Tivaouane est réputée pour sa cuisine sénégalaise. Le futur assistant vous orientera vers les restaurants et tables locales les mieux notés, avec adresses, horaires et avis des visiteurs.`,
  zawiya: `Démonstration — réponse en attente de la base de connaissances :

La zawiya de Tivaouane, berceau de la confrérie tidjane au Sénégal, sera présentée en détail par l’assistant : histoire, figures marquantes et patrimoine spirituel.`,
  gourmets: `Démonstration — réponse en attente de la base de connaissances :

Le futur assistant vous conseillera les gourmandises typiques de Tivaouane à rapporter en souvenir, ainsi que les meilleures adresses pour les trouver.`,
};

const genericReplies = [
  `Bonne question ! En attendant la connexion à la base de connaissances, voici une réponse de démonstration. Le projet Tivaouane AI Guide prévoit un assistant capable de répondre précisément sur la ville, ses lieux, son histoire et ses traditions.`,
  `Merci pour votre message. Cette démonstration simule une réponse : la version finale s’appuiera sur une base documentaire sur Tivaouane pour vous donner des informations vérifiées.`,
];

export function getMockReply(query: string): string {
  const normalized = query.toLowerCase();
  for (const [key, reply] of Object.entries(mockReplies)) {
    const keyword =
      {
        horaires: ["horaire", "ouvert", "ouvrir", "mosquée", "grande mosquée"],
        restaurants: ["manger", "restaurant", "thiéboudienne", "thieboudienne", "manger"],
        zawiya: ["zawiya", "histoire", "tidjane", "confrérie"],
        gourmets: ["rapporter", "souvenir", "gourmandise", "achat"],
      }[key] ?? [];
    if (keyword.some((word) => normalized.includes(word))) {
      return reply;
    }
  }
  return genericReplies[Math.floor(Math.random() * genericReplies.length)];
}