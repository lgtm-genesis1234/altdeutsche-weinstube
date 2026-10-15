// Content definitions for the current epoch (fictional organizations only).
// Data-driven catalogs so more targets/jobs are added without engine changes.

import { JobDef, RecurringCost, TargetDef, Tactic } from "./types";

// First fully developed epoch. Hardware, prices and wording must fit it.
export const EPOCH = { year: 2011, label: "Frühe 2010er", startDateIso: "2011-03-07" };

export const PHASES = [
  "Recon",
  "Access",
  "Persistence",
  "Extraction",
  "Escape",
] as const;

export const PHASE_LABELS_DE: Record<string, string> = {
  Recon: "Aufklärung",
  Access: "Zugang",
  Persistence: "Verankerung",
  Extraction: "Extraktion",
  Escape: "Rückzug",
};

// Per-phase inherent difficulty (0..100 subtracted from success base).
export const PHASE_DIFFICULTY: number[] = [5, 12, 10, 14, 8];
export const PHASE_BASE_TRACE: number[] = [4, 8, 7, 10, 6];

export interface TacticDef {
  id: Tactic;
  label: string;
  desc: string;
  apCost: number;
  successMod: number;
  traceMod: number;
  stress: number;
  moneyCostCents: number;
  usesContact?: boolean;
}

export const TACTICS: TacticDef[] = [
  {
    id: "careful",
    label: "Vorsichtig",
    desc: "Langsam und leise. Kostet den ganzen Tag, hinterlässt kaum Spuren.",
    apCost: 2,
    successMod: -6,
    traceMod: -7,
    stress: 4,
    moneyCostCents: 0,
  },
  {
    id: "fast",
    label: "Schnell",
    desc: "Riskant und laut. Mehr Spuren, leicht höhere Chance.",
    apCost: 1,
    successMod: 6,
    traceMod: 12,
    stress: 7,
    moneyCostCents: 0,
  },
  {
    id: "resource",
    label: "Ressourcenintensiv",
    desc: "Teure Werkzeuge und Rechenzeit einkaufen. Deutlich höhere Chance.",
    apCost: 1,
    successMod: 18,
    traceMod: 1,
    stress: 3,
    moneyCostCents: 15000,
  },
  {
    id: "contact",
    label: "Kontakt nutzen",
    desc: "Insider einsetzen. Großer Vorteil, verbraucht einen Kontakt.",
    apCost: 1,
    successMod: 25,
    traceMod: -4,
    stress: 2,
    moneyCostCents: 0,
    usesContact: true,
  },
];

export const TARGETS: TargetDef[] = [
  {
    id: "lindqvist_bank",
    name: "Lindqvist Regionalbank",
    sector: "Bank",
    blurb:
      "Kleine Regionalbank mit veralteten Systemen. Hohe Auszahlung, aber Geldspuren.",
    security: 38,
    payoutCents: 480000,
    auditFeeCents: 90000,
    legalRepRequired: 0,
    dataValueCents: 120000,
    dataLabel: "Finanzunterlagen",
    dataOwner: "Lindqvist Regionalbank",
    retaliation: 30,
  },
  {
    id: "novacore",
    name: "NovaCore Systems",
    sector: "Tech",
    blurb:
      "Techkonzern mit starker Abwehr. Wertvolle Forschungsdaten, hohes Risiko.",
    security: 72,
    payoutCents: 650000,
    auditFeeCents: 160000,
    legalRepRequired: 25,
    dataValueCents: 420000,
    dataLabel: "Forschungsdaten",
    dataOwner: "NovaCore Systems",
    retaliation: 75,
  },
  {
    id: "helms_pharma",
    name: "Helms Pharma",
    sector: "Pharma",
    blurb:
      "Mittelständischer Pharmazulieferer. Ausgewogenes Risiko und Ertrag.",
    security: 52,
    payoutCents: 540000,
    auditFeeCents: 120000,
    legalRepRequired: 10,
    dataValueCents: 260000,
    dataLabel: "Interne Kommunikation",
    dataOwner: "Helms Pharma",
    retaliation: 50,
  },
];

export function getTarget(id: string): TargetDef {
  const t = TARGETS.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown target ${id}`);
  return t;
}

// Fictional client for illegal contracts.
export const FIXER_NAME = "KESTREL";
// Fictional NPC hacker group acting on its own.
export const NPC_GROUP = "Grauzone";

export const DEFAULT_JOB: JobDef = {
  id: "it_support",
  title: "IT-Support (Nebenjob)",
  employer: "Hansen IT-Service",
  payCents: 8500,
  stressPerShift: 9,
};

export interface BackgroundDef {
  id: string;
  label: string;
  desc: string;
  age: number;
  startBalanceCents: number;
  skill: number;
  contacts: number;
  reputationLegal: number;
  reputationCriminal: number;
  job: JobDef;
}

export const BACKGROUNDS: BackgroundDef[] = [
  {
    id: "student",
    label: "Schüler mit Nebenjob",
    desc: "17, wohnt bei den Eltern, jobbt im IT-Support. Ein Kontakt aus dem Forum.",
    age: 17,
    startBalanceCents: 35000,
    skill: 24,
    contacts: 1,
    reputationLegal: 4,
    reputationCriminal: 0,
    job: DEFAULT_JOB,
  },
  {
    id: "trainee",
    label: "Azubi Fachinformatiker",
    desc: "19, Ausbildung in Systemintegration. Mehr Startgeld, sauberer Ruf, keine Kontakte.",
    age: 19,
    startBalanceCents: 60000,
    skill: 30,
    contacts: 0,
    reputationLegal: 12,
    reputationCriminal: 0,
    job: {
      id: "trainee_sysint",
      title: "Azubi Systemintegration",
      employer: "Stadtwerke Nordheim",
      payCents: 7000,
      stressPerShift: 6,
    },
  },
  {
    id: "dropout",
    label: "Studienabbrecher",
    desc: "21, Informatik abgebrochen, Lagerjob. Hohe Kompetenz, zwei Szenekontakte, knapp bei Kasse.",
    age: 21,
    startBalanceCents: 15000,
    skill: 38,
    contacts: 2,
    reputationLegal: 0,
    reputationCriminal: 8,
    job: {
      id: "warehouse",
      title: "Lagerhilfe (Minijob)",
      employer: "Kröger Logistik",
      payCents: 7500,
      stressPerShift: 12,
    },
  },
];

export const RECURRING_COSTS: RecurringCost[] = [
  { id: "food", label: "Lebensmittel", category: "food", amountCents: 1200, everyDays: 1 },
  { id: "rent", label: "Kostgeld (Zimmer bei Eltern)", category: "rent", amountCents: 25000, everyDays: 7 },
  { id: "internet", label: "DSL & Prepaid-Handy", category: "internet", amountCents: 4500, everyDays: 7 },
];

export interface HardwareDef {
  level: number;
  label: string;
  desc: string;
  priceCents: number;
  successBonus: number;
  traceReduction: number;
}

// Era-appropriate (2011) equipment.
export const HARDWARE: HardwareDef[] = [
  { level: 0, label: "Gebrauchter Laptop", desc: "Dual-Core, 2 GB RAM. Reicht für den Anfang.", priceCents: 0, successBonus: 0, traceReduction: 0 },
  { level: 1, label: "Eigenbau-Workstation", desc: "Quad-Core, 8 GB RAM, SSD. Schnellere Analyse.", priceCents: 90000, successBonus: 8, traceReduction: 1 },
  { level: 2, label: "Workstation + Zweitmonitor & USV", desc: "Stabile Umgebung, getrennte Arbeitsprofile.", priceCents: 180000, successBonus: 14, traceReduction: 2 },
];

export const LAWYER_FEE_CENTS = 80000;
export const OVERDRAFT_LIMIT_CENTS = 20000;

// ---------- contract board (Auftragsbörse) ----------
// Two content variants: authorized security audit (legal) and a data job for
// the fictional fixer KESTREL (illegal). Both drive the same 5-phase system.
export interface ContractRule {
  upfrontShare: number; // paid on acceptance
  offerValidDays: number; // days the offer stays on the board
  workDays: number; // days to finish after acceptance
  failRepPenalty: number;
}

export const CONTRACT_RULES: Record<"legal" | "illegal", ContractRule> = {
  legal: { upfrontShare: 0, offerValidDays: 3, workDays: 4, failRepPenalty: 6 },
  illegal: { upfrontShare: 0.25, offerValidDays: 2, workDays: 3, failRepPenalty: 5 },
};

export const MAX_OPEN_OFFERS = 3;

// Bank review: sum of non-clean incoming money within 7 days above this
// threshold (+ clean income of the last 14 days as plausibility cover).
export const BANK_REVIEW_THRESHOLD_CENTS = 250000;
export const BANK_HOLD_DAYS = 3;

// Data loses market value with age (Aktualität): 4 % per day, floor 40 %.
export const DATA_DECAY_PER_DAY = 0.04;
export const DATA_MIN_FRESHNESS = 0.4;

export const OVERTIME_BONUS = 1.15; // Doppelschicht pays 2 × shift × bonus
export const WAGE_PAY_INTERVAL_DAYS = 7;
