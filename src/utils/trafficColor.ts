/** États masqués sur la carte (trafic fluide / circulation normale) */
const HIDDEN_ETATS = new Set(['G', 'V']);

export function isTrafficEtatVisible(etat?: string): boolean {
  if (!etat) return true;
  return !HIDDEN_ETATS.has(etat);
}

/** Couleurs par code « etat » CRITER (pvotrafic Grand Lyon) */
const ETAT_COLORS: Record<string, string> = {
  G: '#16a34a', // fluide (vitesse réglementaire)
  V: '#84cc16', // circulation mesurée
  O: '#f97316', // dense / ralenti
  R: '#dc2626', // congestion
  N: '#64748b', // neutre
  '*': '#94a3b8', // pas de mesure
};

const ETAT_LABELS: Record<string, string> = {
  G: 'Fluide',
  V: 'Circulation normale',
  O: 'Trafic dense',
  R: 'Trafic congestionné',
  N: 'Non renseigné',
  '*': 'Sans mesure',
};

export function getTrafficEtatColor(etat?: string): string {
  if (!etat) return ETAT_COLORS['*'];
  return ETAT_COLORS[etat] ?? ETAT_COLORS['*'];
}

export function getTrafficEtatLabel(etat?: string): string {
  if (!etat) return ETAT_LABELS['*'];
  return ETAT_LABELS[etat] ?? `État ${etat}`;
}
