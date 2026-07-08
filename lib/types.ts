export type FinanceScope = "mei" | "pessoal";
export type TransactionKind = "receita" | "despesa";
export type PaymentStatus = "pago" | "pendente" | "programado";

export type Transaction = {
  id: string;
  date: string;
  scope: FinanceScope;
  kind: TransactionKind;
  category: string;
  account: string;
  description: string;
  amount: number;
  paymentStatus: PaymentStatus;
  invoiceRelated?: boolean;
  notes?: string;
};

export type InvoiceTask = {
  id: string;
  client: string;
  service: string;
  value: number;
  dueDate: string;
  issued: boolean;
  sentToClient: boolean;
  paid: boolean;
  cityPortal?: string;
  notes?: string;
};

export type FinanceSettings = {
  meiAnnualLimit: number;
  dasMonthlyValue: number;
  personalSavingGoal: number;
  emergencyFundGoal: number;
  businessRevenueGoal: number;
};

export type AppData = {
  transactions: Transaction[];
  invoices: InvoiceTask[];
  settings: FinanceSettings;
};

export type OpenFinanceTransaction = {
  date: string;
  description: string;
  amount: number;
  category: string;
  account: string;
};
