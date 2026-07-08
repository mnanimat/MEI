import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transaction, TransactionKind, FinanceScope, InvoiceTask } from "./types";

export const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

export function money(value: number) {
  return BRL.format(Number.isFinite(value) ? value : 0);
}

export function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function monthLabel(date: string) {
  try {
    return format(parseISO(date), "MMM/yy", { locale: ptBR });
  } catch {
    return date.slice(0, 7);
  }
}

export function sameMonth(date: string, month: string) {
  return date.startsWith(month);
}

export function sumTransactions(
  transactions: Transaction[],
  opts: { scope?: FinanceScope; kind?: TransactionKind; month?: string; paidOnly?: boolean } = {}
) {
  return transactions
    .filter((t) => (opts.scope ? t.scope === opts.scope : true))
    .filter((t) => (opts.kind ? t.kind === opts.kind : true))
    .filter((t) => (opts.month ? sameMonth(t.date, opts.month) : true))
    .filter((t) => (opts.paidOnly ? t.paymentStatus === "pago" : true))
    .reduce((acc, t) => acc + t.amount, 0);
}

export function balance(transactions: Transaction[], scope?: FinanceScope, month?: string) {
  const receitas = sumTransactions(transactions, { scope, kind: "receita", month });
  const despesas = sumTransactions(transactions, { scope, kind: "despesa", month });
  return receitas - despesas;
}

export function groupByMonth(transactions: Transaction[]) {
  const months = Array.from(new Set(transactions.map((t) => t.date.slice(0, 7)))).sort();
  return months.map((month) => {
    const receitas = sumTransactions(transactions, { month, kind: "receita" });
    const despesas = sumTransactions(transactions, { month, kind: "despesa" });
    return {
      month: monthLabel(`${month}-01`),
      receitas,
      despesas,
      saldo: receitas - despesas
    };
  });
}

export function categorySummary(transactions: Transaction[], scope?: FinanceScope) {
  const map = new Map<string, number>();
  transactions
    .filter((t) => t.kind === "despesa")
    .filter((t) => (scope ? t.scope === scope : true))
    .forEach((t) => map.set(t.category || "Sem categoria", (map.get(t.category || "Sem categoria") || 0) + t.amount));
  return Array.from(map.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

export function scopeComparison(transactions: Transaction[], month?: string) {
  return ["mei", "pessoal"].map((scope) => ({
    scope: scope === "mei" ? "MEI" : "Pessoal",
    receitas: sumTransactions(transactions, { scope: scope as FinanceScope, kind: "receita", month }),
    despesas: sumTransactions(transactions, { scope: scope as FinanceScope, kind: "despesa", month }),
    saldo: balance(transactions, scope as FinanceScope, month)
  }));
}

export function invoiceProgress(invoices: InvoiceTask[]) {
  if (!invoices.length) return 0;
  const steps = invoices.length * 3;
  const done = invoices.reduce((acc, nf) => acc + Number(nf.issued) + Number(nf.sentToClient) + Number(nf.paid), 0);
  return Math.round((done / steps) * 100);
}

export function parseMoney(input: string | number) {
  if (typeof input === "number") return input;
  const normalized = input.replace(/\./g, "").replace(",", ".").replace(/[^0-9.-]/g, "");
  return Number(normalized) || 0;
}
