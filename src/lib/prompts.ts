export const PROMPTS_DISPONIBLES = {
  lieu_reve: "Un lieu que je rêve de visiter à deux...",
  rendezvous_parfait: "Ma définition d'un rendez-vous parfait...",
  ne_peux_pas_vivre_sans: "Je ne peux pas vivre sans...",
  compliment_prefere: "Le compliment que j'aime le plus recevoir...",
  plat_prefere: "Mon plat préféré...",
  a_savoir: "Une chose à savoir sur moi avant de me rencontrer...",
  dimanche_ideal: "Mon dimanche idéal ressemble à...",
  fait_rire: "Ce qui me fait rire à coup sûr...",
} as const;

export type PromptKey = keyof typeof PROMPTS_DISPONIBLES;
