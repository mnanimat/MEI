import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    provider: "mock-open-finance",
    status: "ok",
    accounts: [
      { id: "mock-pj", name: "Conta PJ simulada", balance: 2490.75, type: "BUSINESS" },
      { id: "mock-pf", name: "Conta pessoal simulada", balance: 1260.4, type: "PERSONAL" }
    ],
    transactions: [
      {
        date: "2026-07-06",
        description: "PIX recebido - cliente",
        amount: 980,
        category: "Serviços",
        account: "Conta PJ simulada"
      },
      {
        date: "2026-07-06",
        description: "Compra material - fornecedor",
        amount: -168.9,
        category: "Material",
        account: "Conta PJ simulada"
      },
      {
        date: "2026-07-07",
        description: "Mercado",
        amount: -142.37,
        category: "Casa",
        account: "Conta pessoal simulada"
      }
    ]
  });
}
