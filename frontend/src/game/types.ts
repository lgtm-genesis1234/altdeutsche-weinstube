// ZERO TRACE — typed game models.
// Pure data, no engine/UI imports. Designed to be portable to typed GDScript
// (each interface maps to a small Godot Resource / class). IDs are stable
// strings; never persist direct object/node references.

// v2: contract board, op counter.
// v3: weekly wage accrual, bank holds (holdUntilDay), data deliveredTo (see save.ts migrate()).
export const SCHEMA_VERSION = 3;
export const CONTENT_VERSION = 4;
export const MAX_AP = 2;

export type OperationMode = "legal" | "illegal";
export type Tactic = "careful" | "fast" | "resource" | "contact";
export type RiskLevel = "clean" | "low" | "medium" | "high";

export type TxCategory =
  | "opening"
  | "salary"
  | "contract"
  | "advance"
  | "operation_cost"
  | "rent"
  | "internet"
  | "food"
  | "hardware"
  | "fine"
  | "lawyer"
  | "data_sale"
  | "correction";

// Immutable account book entry. amountCents is signed (credit +, debit -).
// Corrections are new entries with reversesId set; nothing is ever edited.
export interface Transaction {
  id: string;
  day: number;
  category: TxCategory;
  label: string;
  amountCents: number;
  origin: string; // human readable source
  risk: RiskLevel; // traceability of the money
  balanceAfterCents: number;
  pending: boolean;
  reversesId: string | null;
}

export type DataStatus = "held" | "sold" | "leaked" | "deleted" | "delivered";

export interface DataAsset {
  id: string;
  label: string;
  owner: string; // original owner organization
  ownerId: string;
  holder: string; // current holder (player alias or a client)
  sizeGb: number;
  credibility: number; // 0..100
  financialValueCents: number; // base value when fresh
  pressureValue: number; // 0..100 abstract pressure value (fictional)
  evidenceValue: number; // 0..100
  risk: RiskLevel;
  day: number;
  sourceIncidentId: string;
  used: boolean; // true once sold/leaked/deleted — no repeated payouts
  status: DataStatus;
  deliveredTo: string | null; // a client already received a copy (contract delivery)
}

export interface TargetDef {
  id: string;
  name: string;
  sector: string;
  blurb: string;
  security: number; // 0..100 starting security (world state may change it)
  payoutCents: number; // illegal contract fee base
  auditFeeCents: number; // legal contract fee base
  legalRepRequired: number; // professional reputation needed for an audit contract
  dataValueCents: number;
  dataLabel: string;
  dataOwner: string;
  retaliation: number; // 0..100 how hard the org pushes back after an incident
}

export interface PhaseRecord {
  phase: string;
  tactic: Tactic | null;
  success: boolean;
  note: string;
}

export interface OperationState {
  id: string;
  targetId: string;
  mode: OperationMode;
  contractId: string | null; // null = Eigeninitiative (no client)
  phaseIndex: number; // 0..5 (5 == complete)
  complications: number;
  traces: number; // accumulated for THIS operation
  spentCents: number;
  history: PhaseRecord[];
}

export type ContractKind = "legal" | "illegal";
export type ContractStatus = "open" | "active" | "done" | "failed" | "expired";

// A job offer on the contract board (Auftragsbörse).
export interface ContractOffer {
  id: string;
  kind: ContractKind;
  targetId: string;
  client: string;
  title: string;
  brief: string;
  feeCents: number; // total agreed fee
  upfrontCents: number; // paid on acceptance (illegal only)
  offeredDay: number;
  expiresDay: number; // last day the offer can be accepted
  workDays: number; // days available after acceptance
  deadlineDay: number | null; // set on acceptance
  repRequired: number;
  status: ContractStatus;
  acceptedDay: number | null;
  resolvedDay: number | null;
  outcome: string | null;
}

export interface JobDef {
  id: string;
  title: string;
  employer: string;
  payCents: number; // per shift
  stressPerShift: number;
}

export interface RecurringCost {
  id: string;
  label: string;
  category: TxCategory;
  amountCents: number;
  everyDays: number; // 1 = daily, 7 = weekly
}

export interface PlayerState {
  name: string;
  alias: string;
  age: number;
  backgroundId: string;
  skill: number; // 0..100
  stress: number; // 0..100
  heat: number; // 0..100 summary of attention (NOT guilt)
  traces: number; // 0..100 global exposure
  reputationLegal: number; // 0..100 professional reputation
  reputationCriminal: number; // 0..100
  reputationHacker: number; // 0..100 scene respect
  publicSympathy: number; // 0..100
  contacts: number; // available "Kontakt" plays
  hardware: number; // index into HARDWARE
}

export interface PendingPayment {
  id: string; // idempotency key -> becomes the transaction id when booked
  dueDay: number;
  category: TxCategory;
  label: string;
  amountCents: number;
  origin: string;
  risk: RiskLevel;
}

export interface LogEntry {
  id: string;
  day: number;
  kind: "info" | "money" | "ops" | "heat" | "news" | "warning";
  text: string;
}

// World truth: what actually happened. Police only sees discovered incidents.
export interface Incident {
  id: string;
  day: number;
  targetId: string;
  actor: "player" | "npc";
  actorName: string;
  traces: number;
  damageCents: number;
  discovered: boolean;
  discoveredDay: number | null;
}

export type PoliceStatus = "none" | "watch" | "case" | "raid";

// Police knowledge (actor knowledge, separate from world truth).
export interface PoliceKnowledge {
  interest: number; // 0..100
  identityConfidence: number; // 0..100 — "we think it is this person"
  knownIncidentIds: string[]; // only discovered player incidents linked to the alias
  bankReported: boolean; // one suspicious-activity report (counts once)
  status: PoliceStatus;
}

export type BankReviewStatus = "ok" | "flagged" | "review";

export interface BankState {
  status: BankReviewStatus;
  flaggedSinceDay: number | null;
  holdUntilDay: number | null; // held incoming money is released after this day
  heldTxIds: string[];
  overdraftDays: number;
}

export interface GameState {
  schemaVersion: number;
  contentVersion: number;
  seed: number;
  rngState: number;

  day: number;
  actionPoints: number;
  lastProcessedDay: number;

  player: PlayerState;
  job: JobDef;

  startingBalanceCents: number;
  ledger: Transaction[];
  pendingPayments: PendingPayment[]; // vorgemerkte Einnahmen
  bank: BankState;

  orgSecurity: Record<string, number>; // mutable world state per organization
  incidents: Incident[];
  police: PoliceKnowledge;

  dataAssets: DataAsset[];
  activeOperation: OperationState | null;
  lastOperationResult: string | null;

  contracts: ContractOffer[];
  contractCounter: number;
  opCounter: number;

  raidPending: boolean;
  gameOver: string | null;

  log: LogEntry[];
  txCounter: number;
  eventCounter: number;
}
