# MEI Financeiro Pro

Aplicativo web responsivo para organizar finanças do MEI e finanças pessoais separadamente, com dashboard, gráficos, checklist de emissão de nota fiscal, importação/exportação e base para integração Open Finance.

## Recursos

- Dashboard com cartões de receita, despesa, lucro, saldo pessoal, DAS e notas pendentes.
- Gráficos de fluxo de caixa, despesas por categoria e comparação MEI x pessoal.
- Lançamentos separados por MEI e pessoal.
- Cadastro de receitas, despesas, status pago/pendente/programado e categorias.
- Controle de limite anual do MEI com valor configurável.
- Checklist de nota fiscal: emitir, enviar ao cliente e receber pagamento.
- Backup JSON, exportação CSV e restauração de dados de exemplo.
- Modo Open Finance simulado para testar importação.
- Endpoint seguro preparado para gerar Connect Token da Pluggy pelo servidor.
- Layout adaptável para celular, tablet e computador.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Como publicar no GitHub

```bash
git init
git add .
git commit -m "primeira versão do MEI Financeiro Pro"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/mei-financeiro-pro.git
git push -u origin main
```

## Como publicar na Vercel

1. Entre em https://vercel.com.
2. Clique em **Add New Project**.
3. Importe o repositório do GitHub.
4. Framework: **Next.js**.
5. Build Command: `npm run build`.
6. Output: padrão da Vercel.
7. Deploy.

## Variáveis de ambiente opcionais

Crie `.env.local` no desenvolvimento ou adicione na Vercel:

```env
PLUGGY_CLIENT_ID="sua_chave"
PLUGGY_CLIENT_SECRET="seu_secret"
NEXT_PUBLIC_APP_URL="https://seu-app.vercel.app"
```

Sem essas variáveis, o app continua funcionando com dados manuais e simulação Open Finance.

## Open Finance real

Este projeto não coloca credenciais bancárias no navegador. A rota `/api/open-finance/pluggy/connect-token` autentica no servidor, gera um Connect Token e pode ser usada com o Pluggy Connect Widget. Para produção, você ainda precisa:

1. Ter conta/contrato com um provedor como Pluggy ou Belvo.
2. Adicionar o widget de consentimento no front-end.
3. Salvar o `itemId` retornado pelo provedor em um banco de dados, como Supabase, Neon, PlanetScale ou Postgres.
4. Criar rotas server-side para buscar contas e transações.
5. Implementar política de privacidade, LGPD, consentimento, exclusão de dados e segurança.

## Observação fiscal

O app ajuda a organizar dados, mas não substitui contador, sistema da prefeitura, PGMEI, DASN-SIMEI ou orientação fiscal profissional.
