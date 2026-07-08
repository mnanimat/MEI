import { NextResponse } from "next/server";

const PLUGGY_API = "https://api.pluggy.ai";

async function createApiKey() {
  const clientId = process.env.PLUGGY_CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Configure PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET no Vercel ou no .env.local.");
  }

  const response = await fetch(`${PLUGGY_API}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, clientSecret })
  });

  if (!response.ok) {
    throw new Error("Não foi possível autenticar na Pluggy. Confira as credenciais.");
  }

  const data = (await response.json()) as { apiKey?: string };
  if (!data.apiKey) throw new Error("A Pluggy não retornou apiKey.");
  return data.apiKey;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { itemId?: string; clientUserId?: string };
    const apiKey = await createApiKey();

    const response = await fetch(`${PLUGGY_API}/connect_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey
      },
      body: JSON.stringify({
        itemId: body.itemId || undefined,
        options: {
          clientUserId: body.clientUserId || "mei-financeiro-local",
          webhookUrl: process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/api/open-finance/pluggy/webhook`
            : undefined
        }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: "Erro ao gerar Connect Token", details: text }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado no Open Finance" },
      { status: 500 }
    );
  }
}
