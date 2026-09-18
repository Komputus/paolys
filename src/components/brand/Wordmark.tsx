// Mot-symbole officiel "paolys" — règle n°1 de la charte (project/README.md) :
// jamais en `ink` ni en une seule teinte sombre, toujours en bas de casse,
// toujours lettre par lettre en couleur (p azur, a rose, o mangue, l lagune,
// y rose, s azur). Ne jamais passer de className qui force une seule couleur
// sur l'ensemble : ça viole la charte.
const LETTRES = "paolys".split("");

export function Wordmark({ size = "lg" }: { size?: "lg" | "md" | "sm" | "nav" }) {
  const classeTaille =
    size === "lg"
      ? "text-display-lg"
      : size === "md"
        ? "text-display-md"
        : size === "nav"
          ? "font-display text-[22px] font-semibold"
          : "text-heading";

  return (
    <span
      className={`paolys-wordmark ${classeTaille}`}
      aria-label="paolys"
    >
      {LETTRES.map((lettre, i) => (
        <span key={i} data-letter={lettre}>
          {lettre}
        </span>
      ))}
    </span>
  );
}
