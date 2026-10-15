// ZERO TRACE — pure simulation engine.
// Every function takes a GameState and returns a NEW GameState (deep-cloned).
// No UI / storage / engine-node imports here. Designed to be portable to typed
// GDScript (each function maps to a method on a simulation service).
//
// Determinism: all randomness goes through state.rngState via `roll()`, so a
// reload with the same (seed, rngState) continues identically.

import {
  BACKGROUNDS,
  DEFAULT_JOB,
  HARDWARE,
  LAWYER_FEE_CENTS,
  OVERDRAFT_LIMIT_CENTS,
  PHASE_BASE_TRACE,
  PHASE_DIFFICULTY,
  PHASES,
  RECURRING_COSTS,
  TACTICS,
  getTarget,
  NPC_GROUP,
  FIXER_NAME,
  CONTRACT_RULES,
  MAX_OPEN_OFFERS,
  TARGETS,
} from "./content";
import { nextFloat } from "./rng";
import {
  CONTENT_VERSION,
  ContractKind,
  ContractOffer,
  DataAsset,
  GameState,
  MAX_AP,
  OperationMode,
  RiskLevel,
  SCHEMA_VERSION,
  Tactic,
  Transaction,
  TxCategory,
} from "./types";

// ---------- small helpers ----------

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

// Advance the rng and return a float in [0,1). Mutates the draft's rngState.
function roll(s: GameState): number {
  const r = nextFloat(s.rngState);
  s.rngState = r.state;
  return r.value;
}

function log(
  s: GameState,
  kind: GameState["log"][number]["kind"],
  text: string,
): void {
  s.eventCounter += 1;
  s.log.unshift({ id: `ev_${s.eventCounter}`, day: s.day, kind, text });
  if (s.log.length > 120) s.log.length = 120;
}

// ---------- money / ledger ----------

export function currentBalanceCents(s: GameState): number {
  if (s.ledger.length === 0) return s.startingBalanceCents;
  return s.ledger[s.ledger.length - 1].balanceAfterCents;
}

// Available = booked balance minus any incoming amounts the bank is holding.
export function availableBalanceCents(s: GameState): number {
  const held = s.ledger
    .filter((t) => s.bank.heldTxIds.includes(t.id) && t.amountCents > 0)
    .reduce((a, t) => a + t.amountCents, 0);
  return currentBalanceCents(s) - held;
}

export function pendingIncomeCents(s: GameState): number {
  return s.pendingPayments
    .filter((p) => p.amountCents > 0)
    .reduce((a, p) => a + p.amountCents, 0);
}

export function netWorthCents(s: GameState): number {
  const hw = HARDWARE[s.player.hardware]?.priceCents ?? 0;
  const data = s.dataAssets
    .filter((d) => d.status === "held")
    .reduce((a, d) => a + d.financialValueCents, 0);
  return currentBalanceCents(s) + hw + data;
}

interface BookArgs {
  id?: string;
  category: TxCategory;
  label: string;
  amountCents: number; // signed
  origin: string;
  risk: RiskLevel;
  held?: boolean;
}

// Immutable booking. Idempotent via id — a second booking with the same id is
// ignored, which protects reloads and animation retries from double-booking.
function book(s: GameState, a: BookArgs): Transaction {
  const id = a.id ?? `tx_${(s.txCounter += 1)}`;
  const existing = s.ledger.find((t) => t.id === id);
  if (existing) return existing;
  const prev = currentBalanceCents(s);
  const tx: Transaction = {
    id,
    day: s.day,
    category: a.category,
    label: a.label,
    amountCents: a.amountCents,
    origin: a.origin,
    risk: a.risk,
    balanceAfterCents: prev + a.amountCents,
    pending: false,
    reversesId: null,
  };
  s.ledger.push(tx);
  if (a.held) s.bank.heldTxIds.push(id);
  return tx;
}

// ---------- new game ----------

export function newGame(backgroundId: string, name: string, alias: string): GameState {
  const bg = BACKGROUNDS.find((b) => b.id === backgroundId) ?? BACKGROUNDS[0];
  const seed = (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;
  const s: GameState = {
    schemaVersion: SCHEMA_VERSION,
    contentVersion: CONTENT_VERSION,
    seed,
    rngState: seed,
    day: 1,
    actionPoints: MAX_AP,
    lastProcessedDay: 0,
    player: {
      name: name.trim() || "Mika Brandt",
      alias: alias.trim() || "nullspur",
      age: bg.age,
      backgroundId: bg.id,
      skill: bg.skill,
      stress: 10,
      heat: 0,
      traces: 0,
      reputationLegal: bg.reputationLegal,
      reputationCriminal: bg.reputationCriminal,
      reputationHacker: bg.reputationCriminal,
      publicSympathy: 0,
      contacts: bg.contacts,
      hardware: 0,
    },
    job: bg.job ?? DEFAULT_JOB,
    startingBalanceCents: bg.startBalanceCents,
    ledger: [],
    pendingPayments: [],
    bank: { status: "ok", flaggedSinceDay: null, heldTxIds: [], overdraftDays: 0 },
    orgSecurity: {},
    incidents: [],
    police: {
      interest: 0,
      identityConfidence: 0,
      knownIncidentIds: [],
      bankReported: false,
      status: "none",
    },
    dataAssets: [],
    activeOperation: null,
    lastOperationResult: null,
    contracts: [],
    contractCounter: 0,
    opCounter: 0,
    raidPending: false,
    gameOver: null,
    log: [],
    txCounter: 0,
    eventCounter: 0,
  };
  book(s, {
    category: "opening",
    label: "Startguthaben",
    amountCents: bg.startBalanceCents,
    origin: "Ersparnisse",
    risk: "clean",
  });
  log(s, "info", `${s.player.name} beginnt als ${bg.label}.`);
  refreshOffers(s);
  return s;
}

// ---------- daily actions (cost AP) ----------

export function work(state: GameState): GameState {
  const s = clone(state);
  if (s.gameOver || s.actionPoints < 1) return state;
  s.actionPoints -= 1;
  s.player.stress = clamp(s.player.stress + s.job.stressPerShift);
  book(s, {
    category: "salary",
    label: `Schicht: ${s.job.title}`,
    amountCents: s.job.payCents,
    origin: s.job.employer,
    risk: "clean",
  });
  log(s, "money", `Nebenjob-Schicht bei ${s.job.employer}: +${(s.job.payCents / 100).toFixed(2)} €`);
  return s;
}

export function rest(state: GameState): GameState {
  const s = clone(state);
  if (s.gameOver || s.actionPoints < 1) return state;
  s.actionPoints -= 1;
  s.player.stress = clamp(s.player.stress - 22);
  log(s, "info", "Erholung: Stress gesenkt.");
  return s;
}

export function study(state: GameState): GameState {
  const s = clone(state);
  if (s.gameOver || s.actionPoints < 1) return state;
  s.actionPoints -= 1;
  s.player.skill = clamp(s.player.skill + 3);
  s.player.stress = clamp(s.player.stress + 4);
  log(s, "info", "Gelernt: Kompetenz +3.");
  return s;
}

export function buyHardware(state: GameState, level: number): GameState {
  const s = clone(state);
  const hw = HARDWARE[level];
  if (s.gameOver || !hw || level <= s.player.hardware) return state;
  if (currentBalanceCents(s) - hw.priceCents < -OVERDRAFT_LIMIT_CENTS) return state;
  book(s, {
    category: "hardware",
    label: hw.label,
    amountCents: -hw.priceCents,
    origin: "Hardware-Händler",
    risk: "clean",
  });
  s.player.hardware = level;
  log(s, "money", `Hardware gekauft: ${hw.label}.`);
  return s;
}

// ---------- contract board (Auftragsbörse) ----------

function makeOffer(s: GameState, kind: ContractKind): ContractOffer {
  const t = TARGETS[Math.floor(roll(s) * TARGETS.length)];
  const rule = CONTRACT_RULES[kind];
  s.contractCounter += 1;
  // ±15 % price variance so offers differ.
  const base = kind === "legal" ? t.auditFeeCents : t.payoutCents;
  const fee = Math.round((base * (0.85 + roll(s) * 0.3)) / 100) * 100;
  return {
    id: `ct_${s.contractCounter}`,
    kind,
    targetId: t.id,
    client: kind === "legal" ? t.name : FIXER_NAME,
    title: kind === "legal" ? `Sicherheitsaudit: ${t.name}` : `Datenauftrag: ${t.name}`,
    brief:
      kind === "legal"
        ? `${t.name} beauftragt eine autorisierte Sicherheitsprüfung. Ergebnis: Bericht, höhere Sicherheit, sauberes Honorar.`
        : `${FIXER_NAME} will "${t.dataLabel}" von ${t.name}. 25 % Anzahlung, Rest bei Lieferung. Spuren mindern die Zahlung.`,
    feeCents: fee,
    upfrontCents: Math.round(fee * rule.upfrontShare),
    offeredDay: s.day,
    expiresDay: s.day + rule.offerValidDays,
    workDays: rule.workDays,
    deadlineDay: null,
    repRequired: kind === "legal" ? t.legalRepRequired : 0,
    status: "open",
    acceptedDay: null,
    resolvedDay: null,
    outcome: null,
  };
}

// Keep the board filled with up to MAX_OPEN_OFFERS, at least one of each kind.
function refreshOffers(s: GameState): void {
  const open = () => s.contracts.filter((c) => c.status === "open");
  for (const kind of ["legal", "illegal"] as ContractKind[]) {
    if (!open().some((c) => c.kind === kind)) s.contracts.push(makeOffer(s, kind));
  }
  while (open().length < MAX_OPEN_OFFERS) {
    s.contracts.push(makeOffer(s, roll(s) < 0.5 ? "legal" : "illegal"));
  }
  if (s.contracts.length > 40) s.contracts = s.contracts.slice(-40);
}

export function acceptContract(state: GameState, id: string): GameState {
  const s = clone(state);
  const c = s.contracts.find((x) => x.id === id);
  if (s.gameOver || !c || c.status !== "open" || c.expiresDay < s.day) return state;
  if (c.kind === "legal" && s.player.reputationLegal < c.repRequired) return state;
  c.status = "active";
  c.acceptedDay = s.day;
  c.deadlineDay = s.day + c.workDays;
  if (c.upfrontCents > 0) {
    book(s, {
      id: `adv_${c.id}`,
      category: "advance",
      label: `Anzahlung: ${c.title}`,
      amountCents: c.upfrontCents,
      origin: c.client,
      risk: "medium",
    });
  }
  log(s, "info", `Auftrag angenommen: ${c.title}. Frist bis Tag ${c.deadlineDay}.`);
  return s;
}

function processContracts(s: GameState): void {
  for (const c of s.contracts) {
    if (c.status === "open" && c.expiresDay < s.day) {
      c.status = "expired";
      c.resolvedDay = s.day;
    }
    const runningOp = s.activeOperation?.contractId === c.id;
    if (c.status === "active" && c.deadlineDay !== null && c.deadlineDay < s.day && !runningOp) {
      c.status = "failed";
      c.resolvedDay = s.day;
      c.outcome = "Frist verstrichen";
      const pen = CONTRACT_RULES[c.kind].failRepPenalty;
      if (c.kind === "legal") s.player.reputationLegal = clamp(s.player.reputationLegal - pen);
      else s.player.reputationCriminal = clamp(s.player.reputationCriminal - pen);
      log(s, "warning", `Auftrag "${c.title}" verfallen – Ruf -${pen}.`);
    }
  }
  refreshOffers(s);
}

// ---------- operations ----------

export function canStartLegal(s: GameState, targetId: string): boolean {
  const t = getTarget(targetId);
  return s.player.reputationLegal >= t.legalRepRequired;
}

export function startOperation(
  state: GameState,
  targetId: string,
  mode: OperationMode,
  contractId: string | null = null,
): GameState {
  const s = clone(state);
  if (s.gameOver || s.activeOperation) return state;
  let tId = targetId;
  let m = mode;
  if (contractId) {
    const c = s.contracts.find((x) => x.id === contractId);
    if (!c || c.status !== "active") return state;
    tId = c.targetId;
    m = c.kind;
  }
  if (m === "legal" && !contractId) return state; // audits need an authorized contract
  const t = getTarget(tId);
  s.opCounter += 1;
  const targetIdFinal = tId;
  const modeFinal = m;
  s.activeOperation = {
    id: `op_${s.opCounter}`,
    targetId: targetIdFinal,
    mode: modeFinal,
    contractId,
    phaseIndex: 0,
    complications: 0,
    traces: 0,
    spentCents: 0,
    history: [],
  };
  log(
    s,
    "ops",
    modeFinal === "legal"
      ? `Autorisierter Sicherheitsauftrag für ${t.name} gestartet.`
      : `Operation gegen ${t.name} gestartet.`,
  );
  return s;
}

export function applyTactic(state: GameState, tactic: Tactic): GameState {
  const s = clone(state);
  const op = s.activeOperation;
  if (s.gameOver || !op) return state;
  const def = TACTICS.find((x) => x.id === tactic);
  if (!def) return state;
  if (s.actionPoints < def.apCost) return state;
  if (currentBalanceCents(s) - def.moneyCostCents < -OVERDRAFT_LIMIT_CENTS) return state;
  if (def.usesContact && s.player.contacts < 1) return state;

  const t = getTarget(op.targetId);
  const security = s.orgSecurity[op.targetId] ?? t.security;
  const i = op.phaseIndex;
  const phase = PHASES[i];
  const hw = HARDWARE[s.player.hardware];

  // Spend resources (booking happens before any result animation in UI).
  s.actionPoints -= def.apCost;
  if (def.moneyCostCents > 0) {
    book(s, {
      category: "operation_cost",
      label: `Operationskosten (${phase})`,
      amountCents: -def.moneyCostCents,
      origin: op.mode === "legal" ? "Auftragsmaterial" : "Beschaffung",
      risk: op.mode === "legal" ? "clean" : "medium",
    });
    op.spentCents += def.moneyCostCents;
  }
  if (def.usesContact) s.player.contacts -= 1;
  s.player.stress = clamp(s.player.stress + def.stress);

  // Success chance.
  const base = 52;
  const chance =
    base +
    s.player.skill * 0.45 +
    (hw?.successBonus ?? 0) +
    def.successMod -
    PHASE_DIFFICULTY[i] -
    security * 0.32;
  const success = roll(s) * 100 < clamp(chance, 5, 95);

  // Trace (only meaningful for illegal ops; authorized audits barely leak).
  const rawTrace =
    PHASE_BASE_TRACE[i] + def.traceMod - (hw?.traceReduction ?? 0);
  const trace = op.mode === "legal" ? Math.max(0, Math.round(rawTrace * 0.15)) : Math.max(0, rawTrace);
  op.traces += trace;

  op.history.push({
    phase,
    tactic,
    success,
    note: success ? "Phase abgeschlossen" : "Komplikation",
  });

  if (success) {
    op.phaseIndex += 1;
    log(s, "ops", `${phase}: erfolgreich.`);
    if (op.phaseIndex >= 5) return completeOperation(s);
  } else {
    op.complications += 1;
    log(s, "warning", `${phase}: Komplikation (${op.complications}/2).`);
    if (op.complications >= 2) return abortOperation(s, true);
  }
  return s;
}

function completeOperation(s: GameState): GameState {
  const op = s.activeOperation!;
  const t = getTarget(op.targetId);
  const tracePenalty = clamp(op.traces, 0, 100) / 100;

  if (op.mode === "legal") {
    const fee = t.auditFeeCents;
    // Paid on next business day (pending/vorgemerkt).
    s.pendingPayments.push({
      id: `pay_${op.id}`,
      dueDay: s.day + 1,
      category: "contract",
      label: `Sicherheitsaudit: ${t.name}`,
      amountCents: fee,
      origin: t.name,
      risk: "clean",
    });
    s.orgSecurity[op.targetId] = clamp((s.orgSecurity[op.targetId] ?? t.security) + 6);
    s.player.reputationLegal = clamp(s.player.reputationLegal + 7);
    s.player.heat = clamp(s.player.heat - 1);
    s.lastOperationResult = `Audit abgeschlossen. Honorar ${(fee / 100).toFixed(0)} € vorgemerkt, Ruf gestiegen.`;
    log(s, "ops", `Audit bei ${t.name} abgeschlossen. Bericht geliefert.`);
  } else {
    const payout = Math.round(t.payoutCents * (1 - tracePenalty * 0.4));
    book(s, {
      category: "contract",
      label: `Auftrag: ${t.name}`,
      amountCents: payout,
      origin: FIXER_NAME,
      risk: op.traces > 40 ? "high" : "medium",
    });
    s.orgSecurity[op.targetId] = clamp((s.orgSecurity[op.targetId] ?? t.security) - 4);
    s.player.reputationCriminal = clamp(s.player.reputationCriminal + 6);
    s.player.reputationHacker = clamp(s.player.reputationHacker + 8);
    s.player.traces = clamp(s.player.traces + Math.round(op.traces * 0.5));

    const data: DataAsset = {
      id: `data_${op.id}`,
      label: t.dataLabel,
      owner: t.dataOwner,
      ownerId: t.id,
      sizeGb: Math.round(2 + roll(s) * 40),
      credibility: clamp(55 + Math.round(roll(s) * 40)),
      financialValueCents: t.dataValueCents,
      pressureValue: clamp(30 + Math.round(roll(s) * 50)),
      evidenceValue: clamp(20 + Math.round(roll(s) * 40)),
      risk: op.traces > 40 ? "high" : "medium",
      day: s.day,
      sourceIncidentId: `inc_${op.id}`,
      used: false,
      status: "held",
    };
    s.dataAssets.push(data);

    s.incidents.push({
      id: `inc_${op.id}`,
      day: s.day,
      targetId: op.targetId,
      actor: "player",
      actorName: s.player.alias,
      traces: op.traces,
      damageCents: payout + t.dataValueCents,
      discovered: false,
      discoveredDay: null,
    });
    s.lastOperationResult = `Erfolg. Auszahlung ${(payout / 100).toFixed(0)} €, Datensatz "${t.dataLabel}" gesichert. Spuren: ${op.traces}.`;
    log(s, "ops", `Operation gegen ${t.name} erfolgreich. Spuren: ${op.traces}.`);
  }
  s.activeOperation = null;
  return s;
}

export function abortOperation(state: GameState, fromFailure = false): GameState {
  const s = fromFailure ? state : clone(state);
  const op = s.activeOperation;
  if (!op) return state;
  // Aborting does NOT remove consequences already produced.
  if (op.mode === "illegal" && op.traces > 0) {
    s.player.traces = clamp(s.player.traces + Math.round(op.traces * 0.6));
    s.player.heat = clamp(s.player.heat + Math.round(op.traces * 0.2));
    // A partial, discoverable incident is left behind.
    s.incidents.push({
      id: `inc_${op.id}`,
      day: s.day,
      targetId: op.targetId,
      actor: "player",
      actorName: s.player.alias,
      traces: op.traces,
      damageCents: 0,
      discovered: false,
      discoveredDay: null,
    });
  }
  s.lastOperationResult = fromFailure
    ? `Operation nach zwei Komplikationen abgebrochen. Spuren bleiben: ${op.traces}.`
    : `Operation abgebrochen. Bereits entstandene Spuren bleiben: ${op.traces}.`;
  log(s, "warning", s.lastOperationResult);
  s.activeOperation = null;
  return s;
}

// ---------- data usage ----------

export type DataAction = "sell" | "leak" | "journalist" | "delete";

export function useData(state: GameState, id: string, action: DataAction): GameState {
  const s = clone(state);
  const d = s.dataAssets.find((x) => x.id === id);
  if (s.gameOver || !d || d.used || d.status !== "held") return state;

  if (action === "sell") {
    const payout = d.financialValueCents;
    book(s, {
      category: "data_sale",
      label: `Datenverkauf: ${d.label}`,
      amountCents: payout,
      origin: "Marktplatz",
      risk: d.risk === "high" ? "high" : "medium",
    });
    s.player.heat = clamp(s.player.heat + 8);
    s.player.reputationCriminal = clamp(s.player.reputationCriminal + 3);
    d.status = "sold";
    log(s, "money", `${d.label} verkauft: +${(payout / 100).toFixed(0)} €.`);
  } else if (action === "leak") {
    s.player.publicSympathy = clamp(s.player.publicSympathy + 14);
    s.player.reputationHacker = clamp(s.player.reputationHacker + 6);
    s.player.heat = clamp(s.player.heat + 12);
    d.status = "leaked";
    log(s, "news", `${d.label} veröffentlicht. Öffentliche Sympathie steigt, Aufmerksamkeit auch.`);
  } else if (action === "journalist") {
    s.player.publicSympathy = clamp(s.player.publicSympathy + 8);
    s.player.heat = clamp(s.player.heat + 4);
    d.status = "leaked";
    log(s, "news", `${d.label} an Journalisten übergeben. Diskretere Wirkung.`);
  } else {
    d.status = "deleted";
    s.player.traces = clamp(s.player.traces - 5);
    log(s, "info", `${d.label} gelöscht. Spuren leicht reduziert.`);
  }
  d.used = true;
  return s;
}

// ---------- end of day: recurring costs, pending income, world + police AI ----------

export function endDay(state: GameState): GameState {
  const s = clone(state);
  if (s.gameOver) return state;

  // If a raid is pending it must be resolved before the day can end.
  if (s.raidPending) return state;

  s.day += 1;
  s.actionPoints = MAX_AP;
  s.player.stress = clamp(s.player.stress - 3);

  // 1) Pending (vorgemerkte) incomes that are now due.
  const due = s.pendingPayments.filter((p) => p.dueDay <= s.day);
  for (const p of due) {
    book(s, {
      id: p.id,
      category: p.category,
      label: p.label,
      amountCents: p.amountCents,
      origin: p.origin,
      risk: p.risk,
    });
    log(s, "money", `Gutschrift: ${p.label} (+${(p.amountCents / 100).toFixed(0)} €).`);
  }
  s.pendingPayments = s.pendingPayments.filter((p) => p.dueDay > s.day);

  // 2) Recurring living costs.
  for (const c of RECURRING_COSTS) {
    if (s.day % c.everyDays === 0) {
      book(s, {
        category: c.category,
        label: c.label,
        amountCents: -c.amountCents,
        origin: "Lebenshaltung",
        risk: "clean",
      });
    }
  }

  // 3) NPC incident in the living world (acts without the player).
  if (roll(s) < 0.22) {
    const t = getTarget(["lindqvist_bank", "novacore", "helms_pharma"][Math.floor(roll(s) * 3)]);
    s.incidents.push({
      id: `inc_npc_${s.day}_${Math.floor(roll(s) * 1000)}`,
      day: s.day,
      targetId: t.id,
      actor: "npc",
      actorName: NPC_GROUP,
      traces: 10 + Math.round(roll(s) * 30),
      damageCents: 100000 + Math.round(roll(s) * 400000),
      discovered: false,
      discoveredDay: null,
    });
    log(s, "news", `Vorfall gemeldet: ${NPC_GROUP} soll ${t.name} angegriffen haben.`);
  }

  // 4) Bank review: a large, high-risk incoming payment can be flagged once.
  if (!s.police.bankReported) {
    const suspicious = s.ledger.find(
      (tx) => tx.amountCents > 300000 && tx.risk === "high" && tx.day >= s.day - 2,
    );
    if (suspicious) {
      s.bank.status = "review";
      s.bank.flaggedSinceDay = s.day;
      s.police.bankReported = true;
      s.police.interest = clamp(s.police.interest + 12);
      log(s, "warning", "Bank prüft eine ungewöhnliche Gutschrift (Geldwäsche-Verdacht).");
    }
  }

  // 5) Police AI: discovery, identity confidence, status, raid.
  runPolice(s);

  // 6) Overdraft / insolvency check.
  if (currentBalanceCents(s) < -OVERDRAFT_LIMIT_CENTS) {
    s.bank.overdraftDays += 1;
    if (s.bank.overdraftDays >= 3) {
      s.gameOver = "Zahlungsunfähig. Das Leben ist aus dem Gleichgewicht geraten.";
      log(s, "warning", "Game Over: zahlungsunfähig.");
    }
  } else {
    s.bank.overdraftDays = 0;
  }

  // Recompute summarised heat (attention, NOT guilt).
  s.player.heat = clamp(Math.round(s.player.traces * 0.4 + s.police.interest * 0.6));
  s.lastProcessedDay = s.day;
  return s;
}

function runPolice(s: GameState): void {
  // Discover player incidents probabilistically.
  for (const inc of s.incidents) {
    if (inc.actor !== "player" || inc.discovered) continue;
    const p = inc.traces / 100 * 0.3 + s.police.interest * 0.004;
    if (roll(s) < p) {
      inc.discovered = true;
      inc.discoveredDay = s.day;
      if (!s.police.knownIncidentIds.includes(inc.id)) {
        s.police.knownIncidentIds.push(inc.id);
      }
      s.police.interest = clamp(s.police.interest + Math.round(inc.traces * 0.4) + 6);
      log(s, "heat", "Ermittler ordnen einen Vorfall deinem Alias zu.");
    }
  }

  // Identity confidence grows with global traces + number of known incidents.
  const known = s.police.knownIncidentIds.length;
  if (known > 0) {
    s.police.identityConfidence = clamp(
      s.police.identityConfidence + s.player.traces * 0.04 + known * 2,
    );
  }

  // Status ladder.
  const interest = s.police.interest;
  if (interest < 20) s.police.status = "none";
  else if (interest < 45) s.police.status = "watch";
  else if (interest < 78) s.police.status = "case";
  else s.police.status = "raid";

  // Trigger a raid when a case escalates and identity is reasonably confident.
  if (s.police.status === "raid" && s.police.identityConfidence >= 45 && !s.raidPending) {
    s.raidPending = true;
    log(s, "warning", "RAZZIA steht bevor. Entscheide, wie du reagierst.");
  }
}

// ---------- raid resolution (abstract narrative choice) ----------

export type RaidChoice = "lawyer" | "contact" | "surrender";

export function resolveRaid(state: GameState, choice: RaidChoice): GameState {
  const s = clone(state);
  if (!s.raidPending) return state;
  s.raidPending = false;
  const evidence = s.police.knownIncidentIds.length;
  const conf = s.police.identityConfidence;

  if (choice === "lawyer") {
    if (currentBalanceCents(s) - LAWYER_FEE_CENTS < -OVERDRAFT_LIMIT_CENTS) {
      // Cannot afford a lawyer -> worse footing.
      s.gameOver = "Festnahme ohne Rechtsbeistand. Untersuchungshaft.";
      log(s, "warning", "Kein Geld für einen Anwalt. Festnahme.");
      return s;
    }
    book(s, {
      category: "lawyer",
      label: "Anwaltshonorar",
      amountCents: -LAWYER_FEE_CENTS,
      origin: "Kanzlei Vogt",
      risk: "clean",
    });
    if (evidence <= 1 && conf < 65) {
      s.police.interest = clamp(s.police.interest - 25);
      s.police.identityConfidence = clamp(s.police.identityConfidence - 15);
      s.lastOperationResult = "Anwalt erfolgreich: Beweise zu dünn, du kommst frei.";
      log(s, "info", "Durchsuchung ergebnislos. Du kommst vorerst frei.");
    } else {
      s.gameOver = "Trotz Anwalt: belastbare Beweise führen zur Verurteilung.";
      log(s, "warning", "Game Over: verurteilt.");
    }
  } else if (choice === "contact") {
    if (s.player.contacts < 1) {
      s.gameOver = "Kein Kontakt verfügbar. Festnahme.";
      log(s, "warning", "Kein Kontakt zur Verfügung. Festnahme.");
      return s;
    }
    s.player.contacts -= 1;
    // A contact buys time but attention stays high.
    s.police.identityConfidence = clamp(s.police.identityConfidence - 20);
    s.police.status = "case";
    s.lastOperationResult = "Ein Kontakt verschafft dir Zeit. Die Aufmerksamkeit bleibt hoch.";
    log(s, "info", "Kontakt eingesetzt: Razzia abgewendet, Ermittlung läuft weiter.");
  } else {
    // Surrender / cooperation deal.
    s.gameOver = "Du hast dich gestellt und kooperierst. Ein neues Kapitel beginnt.";
    log(s, "warning", "Game Over: Kooperationsvereinbarung.");
  }
  return s;
}
