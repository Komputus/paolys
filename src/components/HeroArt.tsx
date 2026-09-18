// Illustration d'accroche conforme au concept officiel du logo
// (project/README.md > "Le logo") : un astre masculin (azur) et un astre
// féminin (rose) qui se rencontrent, avec une étincelle mangue en écho —
// jamais de cœur littéral, jamais l'ancienne palette corail/or.
export function HeroArt({ size = "lg" }: { size?: "lg" | "sm" }) {
  return (
    <svg
      viewBox="0 0 240 200"
      aria-hidden="true"
      className={`mx-auto h-auto w-full ${
        size === "lg" ? "max-w-xs sm:max-w-sm" : "max-w-[140px]"
      }`}
    >
      <defs>
        <filter id="heroArtShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#241729" floodOpacity="0.18" />
        </filter>
      </defs>

      <g filter="url(#heroArtShadow)">
        <circle cx="94" cy="86" r="62" fill="var(--azur)" />
        <circle cx="156" cy="130" r="44" fill="var(--rose)" />
        <circle cx="178" cy="42" r="19" fill="var(--mangue)" />
      </g>
    </svg>
  );
}
