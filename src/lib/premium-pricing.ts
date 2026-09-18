export const FORMULES = {
  semaine: { montantFcfa: 1000, dureeJours: 7, libelle: "1 semaine" },
  mois: { montantFcfa: 3000, dureeJours: 30, libelle: "1 mois" },
} as const;

export type Formule = keyof typeof FORMULES;
