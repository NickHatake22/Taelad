// src/components/TaeTeDaMas/utils.ts
export const toNumber = (x: any) =>
  typeof x === "string" ? parseFloat(x || "0") : (x ?? 0);

export function currency(n: string | number | null | undefined) {
  const v =
    typeof n === "string" ? parseFloat(n || "0") : (n as number | 0) ?? 0;
  return Number.isFinite(v)
    ? v.toLocaleString("es-MX", { style: "currency", currency: "MXN" })
    : "$0.00";
}

export function pct(n: string | number | null | undefined) {
  const v =
    typeof n === "string" ? parseFloat(n || "0") : (n as number | 0) ?? 0;
  return `${(Number.isFinite(v) ? v : 0).toFixed(2)}%`;
}

export function fmtDate(d?: string | null) {
  return d ? d.slice(0, 10) : "—";
}

export function yyyymm(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthKeyFromStr(s?: string | null) {
  if (!s) return "";
  const date = new Date(s);
  if (isNaN(+date)) return (s || "").slice(0, 7);
  return yyyymm(date);
}

export function daysBetween(from?: string | null) {
  if (!from) return Infinity;
  const d1 = new Date(from);
  if (isNaN(+d1)) return Infinity;
  const now = new Date();
  const ms = now.getTime() - d1.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export const STATUS_OK = new Set([
  "pagada",
  "pagado",
  "confirmada",
  "confirmado",
  "aprobada",
  "aprobado",
]);

export const STATUS_BAD = new Set([
  "rechazada",
  "rechazado",
  "cancelada",
  "cancelado",
]);

export const isOk = (s?: string | null) =>
  STATUS_OK.has(String(s || "").toLowerCase().trim());

export const isBad = (s?: string | null) =>
  STATUS_BAD.has(String(s || "").toLowerCase().trim());

export function colorForStatus(
  s?: string | null
): "success" | "error" | "warning" {
  const st = String(s || "").toLowerCase().trim();
  if (STATUS_OK.has(st)) return "success";
  if (STATUS_BAD.has(st)) return "error";
  return "warning";
}

// estilos base para celdas de tabla
export const cellSx = {
  fontSize: { xs: 11, md: 13 },
  p: { xs: 0.5, md: 1 },
  whiteSpace: { xs: "nowrap", md: "normal" },
} as const;
