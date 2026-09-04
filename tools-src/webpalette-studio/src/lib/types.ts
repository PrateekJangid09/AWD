export type Role = 'primary' | 'secondary' | 'light' | 'dark' | 'accent';

export const ROLE_ORDER: Role[] = ['primary', 'secondary', 'light', 'dark', 'accent'];

export const ROLE_LABEL: Record<Role, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  light: 'Light Neutral',
  dark: 'Dark Neutral',
  accent: 'Accent',
};

export const ROLE_PURPOSE: Record<Role, string> = {
  primary: 'Main brand color',
  secondary: 'Supporting brand color',
  light: 'Page & card background',
  dark: 'Text & dark surfaces',
  accent: 'CTA / action / highlight',
};

export interface DerivationTransform {
  deltaHue?: number;
  deltaLightness?: number;
  chromaScale?: number;
  targetLightness?: number;
  targetChroma?: number;
  undertoneHue?: number;
}

export interface DerivationEvidence {
  roleFit: number;
  bestTextContrast?: number;
  uiContrast?: number;
  nearestSourceDeltaE?: number;
  nearestSourceHue?: number;
  candidateScore?: number;
  objectiveDelta?: number;
}

export interface ColorDerivation {
  kind: 'source' | 'generated';
  strategy: string;
  summary: string;
  roleWhy: string;
  basedOn: string[];
  transform?: DerivationTransform;
  evidence: DerivationEvidence;
  alternatives?: Array<{ hex: string; model: string; score: number }>;
}

export type SwatchOrigin = 'user' | 'suggestion' | 'solver' | 'role-swap';

export interface Swatch {
  hex: string;
  role: Role;
  /**
   * `source` means this swatch is a protected user decision for subsequent solves.
   * That includes manually entered colors AND suggestion candidates the user accepted.
   */
  source: boolean;
  name: string;
  group: string;
  /** Where the current exact hex came from. */
  origin?: SwatchOrigin;
  /** When true, Complete palette must preserve both the exact hex AND its semantic role. */
  roleLocked?: boolean;
  /** Stable protected-decision order. Sorting/reordering the UI never changes intent. */
  sourceOrder?: number;
  /** Explainability payload from the solver or accepted suggestion. */
  derivation?: ColorDerivation;
}

export interface RoleColor {
  hex: string;
  source: boolean;
  sourceIndex?: number;
}
export type Roles = Record<Role, RoleColor | null>;

export type RelationshipKey =
  | 'neutral'
  | 'single'
  | 'monochrome'
  | 'analogous'
  | 'related'
  | 'split'
  | 'complementary'
  | 'triadic'
  | 'multi';

export interface HarmonyOption {
  hex: string;
  model: string;
  reason: string;
  fidelity: number;
  role: Role;
  score?: number;
  basedOn?: string[];
  transform?: DerivationTransform;
}

export interface HealthReport {
  complete: boolean;
  light: boolean;
  dark: boolean;
  coverage: boolean;
  pairings: boolean;
  accent: boolean;
  tonal: boolean;
  coveragePct: number;
  pairingsPassed: number;
  pairingsTotal: number;
  accentQuality: number;
  separation: number;
  tonalRange: number;
  lightFit: number;
  darkFit: number;
}
