"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  Gauge,
  Home,
  Import,
  LineChart,
  Plus,
  RefreshCcw,
  Save,
  Settings,
  Smartphone,
  Trash2,
  WalletCards
} from "lucide-react";
import { defaultData } from "../lib/sample-data";
import {
  balance,
  categorySummary,
  groupByMonth,
  invoiceProgress,
  money,
  parseMoney,
  scopeComparison,
  sumTransactions,
  todayISO,
  uid
} from "../lib/finance";
import { AppData, FinanceScope, InvoiceTask, PaymentStatus, Transaction, TransactionKind } from "../lib/types";

const STORAGE_KEY = "mei-financeiro-pro:v1";
const monthNow = todayISO().slice(0, 7);

const categories = {
  meiReceita: ["Serviços", "Produtos personalizados", "Consultoria", "Venda online", "Outras receitas"],
  meiDespesa: ["Material", "Impostos", "Ferramentas", "Marketing", "Transporte", "Internet", "Software", "Outras despesas"],
  pessoalReceita: ["Salário", "Renda extra", "Ajuda", "Venda pessoal", "Outras receitas"],
  pessoalDespesa: ["Casa", "Mercado", "Transporte", "Saúde", "Educação", "Lazer", "Dívidas", "Outras despesas"]
};

function loadData(): AppData {
  if (typeof window === "undefined") return defaultData;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultData;
  try {
    const parsed = JSON.parse(saved) as AppData;
    return {
      settings: { ...defaultData.settings, ...parsed.settings },
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : defaultData.transactions,
      invoices: Array.isArray(parsed.invoices) ? parsed.invoices : defaultData.invoices
    };
  } catch {
    return defaultData;
  }
}

function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function downloadFile(filename: string, content: string, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

const tooltipFormatter = (value: number | string) => money(Number(value));

function StatCard({ title, value, hint, icon, tone = "default" }: { title: string; value: string; hint: string; icon: ReactNode; tone?: "default" | "good" | "bad" | "warn" }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        <span>{hint}</span>
      </div>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <ClipboardCheck size={32} />
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function SegmentedTabs({ active, onChange }: { active: string; onChange: (tab: string) => void }) {
  const tabs = [
    ["dashboard", "Dashboard", <Gauge key="g" size={16} />],
    ["lancamentos", "Lançamentos", <WalletCards key="w" size={16} />],
    ["mei", "MEI", <Building2 key="b" size={16} />],
    ["pessoal", "Pessoal", <Home key="h" size={16} />],
    ["notas", "Notas fiscais", <FileText key="f" size={16} />],
    ["openfinance", "Open Finance", <Banknote key="o" size={16} />],
    ["config", "Config", <Settings key="s" size={16} />]
  ] as const;

  return (
    <nav className="tabs" aria-label="Seções do aplicativo">
      {tabs.map(([id, label, icon]) => (
        <button key={id} className={active === id ? "active" : ""} onClick={() => onChange(id)}>
          {icon}
          {label}
        </button>
      ))}
    </nav>
  );
}

function TransactionForm({ onAdd }: { onAdd: (transaction: Transaction) => void }) {
  const [scope, setScope] = useState<FinanceScope>("mei");
  const [kind, setKind] = useState<TransactionKind>("receita");
  const [form, setForm] = useState({
    date: todayISO(),
    category: "Serviços",
    account: "Conta PJ",
    description: "",
    amount: "",
    paymentStatus: "pago" as PaymentStatus,
    invoiceRelated: false,
    notes: ""
  });

  const categoryOptions =
    scope === "mei" && kind === "receita"
      ? categories.meiReceita
      : scope === "mei" && kind === "despesa"
        ? categories.meiDespesa
        : scope === "pessoal" && kind === "receita"
          ? categories.pessoalReceita
          : categories.pessoalDespesa;

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      category: categoryOptions[0],
      account: scope === "mei" ? "Conta PJ" : "Conta pessoal"
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, kind]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = parseMoney(form.amount);
    if (!form.description.trim() || amount <= 0) return;
    onAdd({
      id: uid("tx"),
      date: form.date,
      scope,
      kind,
      category: form.category,
      account: form.account,
      description: form.description.trim(),
      amount,
      paymentStatus: form.paymentStatus,
      invoiceRelated: form.invoiceRelated,
      notes: form.notes
    });
    setForm((prev) => ({ ...prev, description: "", amount: "", notes: "" }));
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <div className="section-title compact">
        <h2>Novo lançamento</h2>
        <p>Registre receitas e despesas do MEI ou pessoais.</p>
      </div>

      <div className="two-switches">
        <button type="button" className={scope === "mei" ? "selected" : ""} onClick={() => setScope("mei")}>MEI</button>
        <button type="button" className={scope === "pessoal" ? "selected" : ""} onClick={() => setScope("pessoal")}>Pessoal</button>
        <button type="button" className={kind === "receita" ? "selected" : ""} onClick={() => setKind("receita")}>Receita</button>
        <button type="button" className={kind === "despesa" ? "selected" : ""} onClick={() => setKind("despesa")}>Despesa</button>
      </div>

      <label>
        Data
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      </label>
      <label>
        Descrição
        <input value={form.description} placeholder="Ex.: venda, material, mercado..." onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <label>
        Valor
        <input inputMode="decimal" value={form.amount} placeholder="Ex.: 250,00" onChange={(e) => setForm({ ...form, amount: e.target.value })} />
      </label>
      <label>
        Categoria
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {categoryOptions.map((category) => <option key={category}>{category}</option>)}
        </select>
      </label>
      <label>
        Conta
        <input value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} />
      </label>
      <label>
        Status
        <select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as PaymentStatus })}>
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
          <option value="programado">Programado</option>
        </select>
      </label>
      {scope === "mei" && kind === "receita" && (
        <label className="check-line">
          <input type="checkbox" checked={form.invoiceRelated} onChange={(e) => setForm({ ...form, invoiceRelated: e.target.checked })} />
          Precisa/possui nota fiscal
        </label>
      )}
      <label>
        Observações
        <textarea value={form.notes} placeholder="Opcional" onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </label>
      <button className="primary" type="submit"><Plus size={18} /> Adicionar</button>
    </form>
  );
}

function TransactionTable({ transactions, onDelete }: { transactions: Transaction[]; onDelete: (id: string) => void }) {
  if (!transactions.length) return <EmptyState title="Nenhum lançamento" text="Adicione receitas e despesas para o dashboard ficar completo." />;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Área</th>
            <th>Categoria</th>
            <th>Status</th>
            <th>Valor</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.date.split("-").reverse().join("/")}</td>
              <td>
                <strong>{t.description}</strong>
                <span>{t.account}</span>
              </td>
              <td>{t.scope === "mei" ? "MEI" : "Pessoal"}</td>
              <td>{t.category}</td>
              <td><span className={`pill ${t.paymentStatus}`}>{t.paymentStatus}</span></td>
              <td className={t.kind === "receita" ? "positive" : "negative"}>{t.kind === "receita" ? "+" : "-"}{money(t.amount)}</td>
              <td><button className="ghost danger" onClick={() => onDelete(t.id)} aria-label="Excluir"><Trash2 size={16} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Dashboard({ data }: { data: AppData }) {
  const transactions = data.transactions;
  const current = monthNow;
  const meiIncome = sumTransactions(transactions, { scope: "mei", kind: "receita", month: current });
  const meiExpense = sumTransactions(transactions, { scope: "mei", kind: "despesa", month: current });
  const personalBalance = balance(transactions, "pessoal", current);
  const annualRevenue = sumTransactions(transactions, { scope: "mei", kind: "receita" });
  const annualPercent = Math.min(100, Math.round((annualRevenue / data.settings.meiAnnualLimit) * 100));
  const pendingInvoices = data.invoices.filter((nf) => !nf.issued || !nf.sentToClient || !nf.paid).length;
  const flow = groupByMonth(transactions);
  const expenses = categorySummary(transactions);
  const comparison = scopeComparison(transactions, current);

  return (
    <div className="stack">
      <section className="hero-card">
        <div>
          <span className="eyebrow"><Smartphone size={16} /> Responsivo para celular</span>
          <h1>Controle MEI + pessoal no mesmo lugar</h1>
          <p>Separe o dinheiro da empresa do dinheiro pessoal, acompanhe limite do MEI, receitas, despesas, notas fiscais e fluxo de caixa.</p>
        </div>
        <div className="hero-meter">
          <span>Uso do limite MEI</span>
          <strong>{annualPercent}%</strong>
          <div className="progress"><i style={{ width: `${annualPercent}%` }} /></div>
          <small>{money(annualRevenue)} de {money(data.settings.meiAnnualLimit)}</small>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard title="Receitas MEI" value={money(meiIncome)} hint="Neste mês" icon={<ArrowUpCircle />} tone="good" />
        <StatCard title="Despesas MEI" value={money(meiExpense)} hint="Neste mês" icon={<ArrowDownCircle />} tone="bad" />
        <StatCard title="Lucro MEI" value={money(meiIncome - meiExpense)} hint="Receita - despesa" icon={<BadgeCheck />} tone={meiIncome - meiExpense >= 0 ? "good" : "bad"} />
        <StatCard title="Saldo pessoal" value={money(personalBalance)} hint="Neste mês" icon={<Home />} tone={personalBalance >= 0 ? "good" : "warn"} />
        <StatCard title="Notas pendentes" value={`${pendingInvoices}`} hint="Emitir, enviar ou receber" icon={<FileText />} tone={pendingInvoices ? "warn" : "good"} />
        <StatCard title="DAS mensal" value={money(data.settings.dasMonthlyValue)} hint="Valor configurável" icon={<Banknote />} />
      </section>

      <section className="charts-grid">
        <div className="panel wide">
          <div className="section-title compact">
            <h2>Fluxo de caixa</h2>
            <p>Receitas, despesas e saldo por mês.</p>
          </div>
          <ResponsiveContainer width="100%" height={310}>
            <AreaChart data={flow.length ? flow : [{ month: "Atual", receitas: 0, despesas: 0, saldo: 0 }]} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="saldo" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopOpacity={0.35} /><stop offset="95%" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${Number(value) / 1000}k`} />
              <Tooltip formatter={tooltipFormatter} />
              <Area type="monotone" dataKey="receitas" name="Receitas" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="despesas" name="Despesas" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="saldo" name="Saldo" fill="url(#saldo)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="section-title compact">
            <h2>Despesas por categoria</h2>
            <p>Onde o dinheiro está saindo.</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={expenses.length ? expenses : [{ category: "Sem dados", value: 1 }]} dataKey="value" nameKey="category" innerRadius={55} outerRadius={95} paddingAngle={3}>
                {(expenses.length ? expenses : [{ category: "Sem dados", value: 1 }]).map((entry, index) => <Cell key={entry.category} opacity={expenses.length ? 0.9 : 0.25} />)}
              </Pie>
              <Tooltip formatter={tooltipFormatter} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend-list">
            {expenses.map((item) => <span key={item.category}>{item.category}: <strong>{money(item.value)}</strong></span>)}
          </div>
        </div>

        <div className="panel">
          <div className="section-title compact">
            <h2>MEI x Pessoal</h2>
            <p>Comparação do mês atual.</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparison} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scope" />
              <YAxis tickFormatter={(value) => `${Number(value) / 1000}k`} />
              <Tooltip formatter={tooltipFormatter} />
              <Bar dataKey="receitas" name="Receitas" radius={[8, 8, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function MeiPanel({ data }: { data: AppData }) {
  const annualRevenue = sumTransactions(data.transactions, { scope: "mei", kind: "receita" });
  const annualExpense = sumTransactions(data.transactions, { scope: "mei", kind: "despesa" });
  const result = annualRevenue - annualExpense;
  const limitPercent = Math.min(100, Math.round((annualRevenue / data.settings.meiAnnualLimit) * 100));
  const missing = Math.max(0, data.settings.meiAnnualLimit - annualRevenue);
  const meiTransactions = data.transactions.filter((t) => t.scope === "mei");

  return (
    <div className="stack">
      <section className="stats-grid">
        <StatCard title="Faturamento MEI" value={money(annualRevenue)} hint="Receita bruta registrada" icon={<Building2 />} tone="good" />
        <StatCard title="Despesas do MEI" value={money(annualExpense)} hint="Custos e impostos" icon={<ArrowDownCircle />} tone="bad" />
        <StatCard title="Resultado estimado" value={money(result)} hint="Antes de ajustes contábeis" icon={<LineChart />} tone={result >= 0 ? "good" : "bad"} />
        <StatCard title="Falta para o limite" value={money(missing)} hint={`${limitPercent}% usado`} icon={<Gauge />} tone={limitPercent >= 85 ? "warn" : "default"} />
      </section>
      <div className="panel">
        <div className="section-title compact">
          <h2>Controle do limite anual</h2>
          <p>O limite é configurável para adaptar se a lei mudar ou se o MEI tiver limite proporcional no ano de abertura.</p>
        </div>
        <div className="big-progress">
          <div className="progress"><i style={{ width: `${limitPercent}%` }} /></div>
          <div><strong>{limitPercent}%</strong><span>{money(annualRevenue)} / {money(data.settings.meiAnnualLimit)}</span></div>
        </div>
      </div>
      <TransactionTable transactions={meiTransactions} onDelete={() => undefined} />
    </div>
  );
}

function PersonalPanel({ data }: { data: AppData }) {
  const income = sumTransactions(data.transactions, { scope: "pessoal", kind: "receita" });
  const expense = sumTransactions(data.transactions, { scope: "pessoal", kind: "despesa" });
  const saved = Math.max(0, income - expense);
  const goalPercent = Math.min(100, Math.round((saved / data.settings.emergencyFundGoal) * 100));
  const personalTransactions = data.transactions.filter((t) => t.scope === "pessoal");

  return (
    <div className="stack">
      <section className="stats-grid">
        <StatCard title="Entradas pessoais" value={money(income)} hint="Total registrado" icon={<ArrowUpCircle />} tone="good" />
        <StatCard title="Saídas pessoais" value={money(expense)} hint="Total registrado" icon={<ArrowDownCircle />} tone="bad" />
        <StatCard title="Saldo acumulado" value={money(income - expense)} hint="Entradas - saídas" icon={<Home />} tone={income - expense >= 0 ? "good" : "bad"} />
        <StatCard title="Meta reserva" value={`${goalPercent}%`} hint={money(data.settings.emergencyFundGoal)} icon={<Gauge />} />
      </section>
      <div className="panel">
        <div className="section-title compact">
          <h2>Reserva de emergência</h2>
          <p>Acompanhe quanto do saldo pessoal já cobre sua meta.</p>
        </div>
        <div className="big-progress">
          <div className="progress"><i style={{ width: `${goalPercent}%` }} /></div>
          <div><strong>{goalPercent}%</strong><span>{money(saved)} guardado de {money(data.settings.emergencyFundGoal)}</span></div>
        </div>
      </div>
      <TransactionTable transactions={personalTransactions} onDelete={() => undefined} />
    </div>
  );
}

function InvoiceForm({ onAdd }: { onAdd: (invoice: InvoiceTask) => void }) {
  const [form, setForm] = useState({ client: "", service: "", value: "", dueDate: todayISO(), cityPortal: "", notes: "" });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.client.trim() || !form.service.trim()) return;
    onAdd({
      id: uid("nf"),
      client: form.client.trim(),
      service: form.service.trim(),
      value: parseMoney(form.value),
      dueDate: form.dueDate,
      issued: false,
      sentToClient: false,
      paid: false,
      cityPortal: form.cityPortal,
      notes: form.notes
    });
    setForm({ client: "", service: "", value: "", dueDate: todayISO(), cityPortal: "", notes: "" });
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <div className="section-title compact"><h2>Nova nota / cobrança</h2><p>Crie o checklist antes ou depois de emitir a NFS-e.</p></div>
      <label>Cliente<input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} /></label>
      <label>Serviço/produto<input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} /></label>
      <label>Valor<input inputMode="decimal" value={form.value} placeholder="Ex.: 300,00" onChange={(e) => setForm({ ...form, value: e.target.value })} /></label>
      <label>Vencimento<input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
      <label>Link do portal da prefeitura<input value={form.cityPortal} placeholder="Opcional" onChange={(e) => setForm({ ...form, cityPortal: e.target.value })} /></label>
      <label>Observação<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
      <button className="primary" type="submit"><Plus size={18} /> Adicionar checklist</button>
    </form>
  );
}

function InvoicePanel({ invoices, onAdd, onToggle, onDelete }: { invoices: InvoiceTask[]; onAdd: (invoice: InvoiceTask) => void; onToggle: (id: string, key: keyof Pick<InvoiceTask, "issued" | "sentToClient" | "paid">) => void; onDelete: (id: string) => void }) {
  const progress = invoiceProgress(invoices);

  return (
    <div className="grid-with-form">
      <InvoiceForm onAdd={onAdd} />
      <section className="panel">
        <div className="section-title compact"><h2>Checklist de notas fiscais</h2><p>{progress}% das etapas concluídas.</p></div>
        <div className="progress"><i style={{ width: `${progress}%` }} /></div>
        <div className="invoice-list">
          {invoices.length === 0 && <EmptyState title="Sem notas cadastradas" text="Adicione as notas que precisam ser emitidas, enviadas ou recebidas." />}
          {invoices.map((nf) => (
            <article className="invoice-card" key={nf.id}>
              <div>
                <h3>{nf.client}</h3>
                <p>{nf.service}</p>
                <strong>{money(nf.value)}</strong>
                <small>Venc.: {nf.dueDate.split("-").reverse().join("/")}</small>
                {nf.notes && <small>{nf.notes}</small>}
              </div>
              <div className="checklist">
                <label><input type="checkbox" checked={nf.issued} onChange={() => onToggle(nf.id, "issued")} /> Emitida</label>
                <label><input type="checkbox" checked={nf.sentToClient} onChange={() => onToggle(nf.id, "sentToClient")} /> Enviada</label>
                <label><input type="checkbox" checked={nf.paid} onChange={() => onToggle(nf.id, "paid")} /> Recebida</label>
                <button className="ghost danger" onClick={() => onDelete(nf.id)}><Trash2 size={16} /> Excluir</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ImportExport({ data, setData }: { data: AppData; setData: (data: AppData) => void }) {
  function exportJson() {
    downloadFile(`mei-financeiro-backup-${todayISO()}.json`, JSON.stringify(data, null, 2));
  }

  function exportCsv() {
    const header = "date,scope,kind,category,account,description,amount,paymentStatus,invoiceRelated\n";
    const rows = data.transactions.map((t) => [t.date, t.scope, t.kind, t.category, t.account, t.description, String(t.amount).replace(".", ","), t.paymentStatus, t.invoiceRelated ? "sim" : "nao"].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    downloadFile(`mei-financeiro-lancamentos-${todayISO()}.csv`, header + rows.join("\n"), "text/csv;charset=utf-8");
  }

  function importJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result)) as AppData;
        if (!imported.transactions || !imported.invoices || !imported.settings) throw new Error("Arquivo inválido");
        setData(imported);
      } catch {
        alert("Não foi possível importar. Use um backup JSON gerado por este aplicativo.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="actions-row">
      <button className="secondary" onClick={exportJson}><Download size={16} /> Backup JSON</button>
      <button className="secondary" onClick={exportCsv}><Download size={16} /> Exportar CSV</button>
      <label className="file-button"><Import size={16} /> Importar backup<input type="file" accept="application/json" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} /></label>
      <button className="ghost danger" onClick={() => { if (confirm("Restaurar dados de exemplo? Isso sobrescreve os dados atuais.")) setData(defaultData); }}><RefreshCcw size={16} /> Restaurar exemplo</button>
    </div>
  );
}

function OpenFinancePanel({ onImport }: { onImport: (transactions: Transaction[]) => void }) {
  const [status, setStatus] = useState("Pronto para testar com dados simulados.");
  const [loading, setLoading] = useState(false);

  async function importMock() {
    setLoading(true);
    setStatus("Sincronizando dados simulados...");
    try {
      const response = await fetch("/api/open-finance/mock");
      const data = await response.json();
      const converted: Transaction[] = data.transactions.map((item: { date: string; description: string; amount: number; category: string; account: string }) => ({
        id: uid("of"),
        date: item.date,
        scope: item.account.toLowerCase().includes("pj") ? "mei" : "pessoal",
        kind: item.amount >= 0 ? "receita" : "despesa",
        category: item.category,
        account: item.account,
        description: `[Open Finance] ${item.description}`,
        amount: Math.abs(item.amount),
        paymentStatus: "pago"
      }));
      onImport(converted);
      setStatus(`${converted.length} lançamentos simulados importados.`);
    } catch {
      setStatus("Falha ao importar dados simulados.");
    } finally {
      setLoading(false);
    }
  }

  async function testPluggyToken() {
    setLoading(true);
    setStatus("Tentando gerar Connect Token da Pluggy...");
    try {
      const response = await fetch("/api/open-finance/pluggy/connect-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientUserId: "usuario-local" })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro");
      setStatus("Connect Token gerado. Agora você pode adicionar o widget Pluggy Connect no front-end e salvar o itemId retornado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro ao testar Pluggy.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel open-finance-panel">
      <div className="section-title">
        <h2>Open Finance</h2>
        <p>Use a simulação agora e, quando tiver credenciais de provedor, habilite a conexão real pelo endpoint seguro do servidor.</p>
      </div>
      <div className="of-grid">
        <div className="of-card">
          <Banknote size={28} />
          <h3>Modo seguro para começar</h3>
          <p>Importa dados simulados no mesmo formato dos bancos para testar conciliação, gráficos e categorias sem expor dados reais.</p>
          <button className="primary" onClick={importMock} disabled={loading}><RefreshCcw size={16} /> Importar simulação</button>
        </div>
        <div className="of-card">
          <BadgeCheck size={28} />
          <h3>Preparado para Pluggy</h3>
          <p>O endpoint <code>/api/open-finance/pluggy/connect-token</code> gera token no servidor usando as variáveis do Vercel.</p>
          <button className="secondary" onClick={testPluggyToken} disabled={loading}>Testar credenciais</button>
        </div>
        <div className="of-card muted">
          <CheckCircle2 size={28} />
          <h3>Próximos passos reais</h3>
          <p>Depois de aprovado no provedor, adicione o widget de consentimento, salve o itemId e crie rotas para buscar contas e transações.</p>
        </div>
      </div>
      <div className="notice"><strong>Status:</strong> {status}</div>
    </section>
  );
}

function SettingsPanel({ data, setData }: { data: AppData; setData: (data: AppData) => void }) {
  const [settings, setSettings] = useState(data.settings);
  useEffect(() => setSettings(data.settings), [data.settings]);

  function update(key: keyof typeof settings, value: string) {
    setSettings((prev) => ({ ...prev, [key]: parseMoney(value) }));
  }

  function save() {
    setData({ ...data, settings });
  }

  return (
    <div className="stack">
      <section className="panel">
        <div className="section-title compact"><h2>Configurações financeiras</h2><p>Ajuste metas e valores conforme sua realidade.</p></div>
        <div className="settings-grid">
          <label>Limite anual MEI<input inputMode="decimal" value={settings.meiAnnualLimit} onChange={(e) => update("meiAnnualLimit", e.target.value)} /></label>
          <label>DAS mensal estimado<input inputMode="decimal" value={settings.dasMonthlyValue} onChange={(e) => update("dasMonthlyValue", e.target.value)} /></label>
          <label>Meta mensal de economia<input inputMode="decimal" value={settings.personalSavingGoal} onChange={(e) => update("personalSavingGoal", e.target.value)} /></label>
          <label>Meta reserva emergência<input inputMode="decimal" value={settings.emergencyFundGoal} onChange={(e) => update("emergencyFundGoal", e.target.value)} /></label>
          <label>Meta receita mensal MEI<input inputMode="decimal" value={settings.businessRevenueGoal} onChange={(e) => update("businessRevenueGoal", e.target.value)} /></label>
        </div>
        <button className="primary" onClick={save}><Save size={18} /> Salvar configurações</button>
      </section>
      <section className="panel">
        <div className="section-title compact"><h2>Backup e portabilidade</h2><p>Leve seus dados para outro navegador ou planilha.</p></div>
        <ImportExport data={data} setData={setData} />
      </section>
      <section className="panel warning-panel">
        <h3>Aviso importante</h3>
        <p>Este aplicativo organiza seus dados e gera estimativas. Ele não substitui contador, portal da prefeitura, PGMEI, DASN-SIMEI ou orientação fiscal profissional.</p>
      </section>
    </div>
  );
}

export default function Page() {
  const [data, setDataState] = useState<AppData>(defaultData);
  const [active, setActive] = useState("dashboard");
  const [filter, setFilter] = useState<"todos" | FinanceScope>("todos");

  useEffect(() => {
    setDataState(loadData());
  }, []);

  function setData(next: AppData) {
    setDataState(next);
    saveData(next);
  }

  function addTransaction(transaction: Transaction) {
    setData({ ...data, transactions: [transaction, ...data.transactions] });
  }

  function deleteTransaction(id: string) {
    setData({ ...data, transactions: data.transactions.filter((t) => t.id !== id) });
  }

  function addInvoice(invoice: InvoiceTask) {
    setData({ ...data, invoices: [invoice, ...data.invoices] });
  }

  function toggleInvoice(id: string, key: keyof Pick<InvoiceTask, "issued" | "sentToClient" | "paid">) {
    setData({ ...data, invoices: data.invoices.map((nf) => nf.id === id ? { ...nf, [key]: !nf[key] } : nf) });
  }

  function deleteInvoice(id: string) {
    setData({ ...data, invoices: data.invoices.filter((nf) => nf.id !== id) });
  }

  function importOpenFinance(transactions: Transaction[]) {
    setData({ ...data, transactions: [...transactions, ...data.transactions] });
  }

  const shownTransactions = useMemo(() => {
    const list = filter === "todos" ? data.transactions : data.transactions.filter((t) => t.scope === filter);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [data.transactions, filter]);

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <div className="logo">MF</div>
          <div>
            <strong>MEI Financeiro Pro</strong>
            <span>Empresa e pessoal separados</span>
          </div>
        </div>
        <div className="top-actions">
          <button className="secondary" onClick={() => setActive("openfinance")}><Banknote size={16} /> Open Finance</button>
          <button className="primary" onClick={() => setActive("lancamentos")}><Plus size={16} /> Lançar</button>
        </div>
      </header>

      <SegmentedTabs active={active} onChange={setActive} />

      {active === "dashboard" && <Dashboard data={data} />}

      {active === "lancamentos" && (
        <div className="grid-with-form">
          <TransactionForm onAdd={addTransaction} />
          <section className="panel">
            <div className="section-title compact"><h2>Lançamentos</h2><p>Filtre e acompanhe tudo que entrou e saiu.</p></div>
            <div className="filter-row">
              <button className={filter === "todos" ? "selected" : ""} onClick={() => setFilter("todos")}>Todos</button>
              <button className={filter === "mei" ? "selected" : ""} onClick={() => setFilter("mei")}>MEI</button>
              <button className={filter === "pessoal" ? "selected" : ""} onClick={() => setFilter("pessoal")}>Pessoal</button>
            </div>
            <TransactionTable transactions={shownTransactions} onDelete={deleteTransaction} />
          </section>
        </div>
      )}

      {active === "mei" && <MeiPanel data={data} />}
      {active === "pessoal" && <PersonalPanel data={data} />}
      {active === "notas" && <InvoicePanel invoices={data.invoices} onAdd={addInvoice} onToggle={toggleInvoice} onDelete={deleteInvoice} />}
      {active === "openfinance" && <OpenFinancePanel onImport={importOpenFinance} />}
      {active === "config" && <SettingsPanel data={data} setData={setData} />}
    </main>
  );
}
