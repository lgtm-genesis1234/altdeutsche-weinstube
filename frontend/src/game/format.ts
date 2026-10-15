// Formatting helpers. Money is always stored as integer cents.

export function formatEuro(cents: number, withSign = false): string {
  const sign = cents < 0 ? "-" : withSign ? "+" : "";
  const abs = Math.abs(cents);
  const euros = Math.floor(abs / 100);
  const rest = abs % 100;
  const eurosStr = euros.toLocaleString("de-DE");
  return `${sign}${eurosStr},${rest.toString().padStart(2, "0")} €`;
}

export function riskLabel(risk: string): string {
  switch (risk) {
    case "clean":
      return "Sauber";
    case "low":
      return "Gering";
    case "medium":
      return "Mittel";
    case "high":
      return "Hoch";
    default:
      return risk;
  }
}

export function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    opening: "Startguthaben",
    salary: "Gehalt",
    contract: "Auftrag",
    advance: "Anzahlung",
    lawyer: "Anwalt",
    operation_cost: "Operationskosten",
    rent: "Miete",
    internet: "Internet",
    food: "Lebensmittel",
    hardware: "Hardware",
    fine: "Strafe",
    data_sale: "Datenverkauf",
    correction: "Korrektur",
  };
  return map[cat] ?? cat;
}
