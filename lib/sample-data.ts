import { AppData } from "./types";

export const defaultData: AppData = {
  settings: {
    meiAnnualLimit: 81000,
    dasMonthlyValue: 81.9,
    personalSavingGoal: 500,
    emergencyFundGoal: 6000,
    businessRevenueGoal: 6750
  },
  transactions: [
    {
      id: "t-1",
      date: "2026-07-01",
      scope: "mei",
      kind: "receita",
      category: "Serviços",
      account: "Conta PJ",
      description: "Criação de arte e identidade visual",
      amount: 1250,
      paymentStatus: "pago",
      invoiceRelated: true
    },
    {
      id: "t-2",
      date: "2026-07-02",
      scope: "mei",
      kind: "despesa",
      category: "Material",
      account: "Conta PJ",
      description: "MDF, cola e insumos",
      amount: 320,
      paymentStatus: "pago"
    },
    {
      id: "t-3",
      date: "2026-07-04",
      scope: "pessoal",
      kind: "despesa",
      category: "Casa",
      account: "Carteira pessoal",
      description: "Mercado e itens de casa",
      amount: 215.5,
      paymentStatus: "pago"
    },
    {
      id: "t-4",
      date: "2026-07-05",
      scope: "pessoal",
      kind: "receita",
      category: "Renda extra",
      account: "Conta pessoal",
      description: "Serviço particular recebido",
      amount: 450,
      paymentStatus: "pago"
    },
    {
      id: "t-5",
      date: "2026-07-08",
      scope: "mei",
      kind: "despesa",
      category: "Impostos",
      account: "Conta PJ",
      description: "DAS MEI",
      amount: 81.9,
      paymentStatus: "programado"
    },
    {
      id: "t-6",
      date: "2026-07-10",
      scope: "mei",
      kind: "receita",
      category: "Produtos personalizados",
      account: "Conta PJ",
      description: "Venda de placa personalizada",
      amount: 780,
      paymentStatus: "pendente",
      invoiceRelated: true
    }
  ],
  invoices: [
    {
      id: "nf-1",
      client: "Cliente exemplo",
      service: "Logo em MDF personalizada",
      value: 780,
      dueDate: "2026-07-10",
      issued: false,
      sentToClient: false,
      paid: false,
      cityPortal: "",
      notes: "Emitir quando o cliente confirmar os dados."
    },
    {
      id: "nf-2",
      client: "Empresa exemplo",
      service: "Serviço de design",
      value: 1250,
      dueDate: "2026-07-01",
      issued: true,
      sentToClient: true,
      paid: true,
      cityPortal: "",
      notes: "Nota enviada junto com recibo."
    }
  ]
};
