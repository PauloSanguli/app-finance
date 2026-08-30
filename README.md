# Finanças AO

Aplicação fintech pessoal para gerir contas, envelopes, rendimentos e despesas com foco em organização financeira e visualização por banco e subcontas.

## Visão geral

A aplicação permite:

- acompanhar o saldo total geral e por cartão bancário;
- criar e gerir subcontas/envelopes por categoria;
- registrar gastos e entradas financeiras;
- distribuir rendimentos por subcontas;
- acompanhar o histórico de movimentos;
- visualizar relatórios mensais;
- alternar entre temas claro e escuro;
- persistir os dados no Supabase em vez de depender de dados locais.

## Stack tecnológica

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Supabase JS
- Recharts
- Lucide React

## Estrutura principal

- `src/App.tsx` – layout principal da aplicação
- `src/context/FinanceContext.tsx` – estado global e sincronização com Supabase
- `src/components/` – UI principal do app
- `src/types.ts` – tipos TypeScript do domínio financeiro
- `src/utils/formatters.ts` – funções de formatação
- `src/utils/supabase.ts` – cliente do Supabase
- `supabase/schema.sql` – estrutura SQL das tabelas do projeto
- `.env` – variáveis de ambiente locais

## Pré-requisitos

- Node.js 20+
- npm
- projeto Supabase criado e configurado

## Configuração do Supabase

Crie um ficheiro `.env` na raiz do projeto com as variáveis:

```env
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sua_chave_publica"
VITE_SUPABASE_ANON_KEY="sua_chave_publica"
```

Depois, execute o SQL em [supabase/schema.sql](supabase/schema.sql) no SQL Editor do Supabase para criar as tabelas:

- `cards`
- `subaccounts`
- `transactions`
- `income_sources`

## Instalação

```bash
npm install
```

## Execução local

```bash
npm run dev
```

A aplicação será servida em:

- http://localhost:3000

## Build de produção

```bash
npm run build
```

## Scripts disponíveis

- `npm run dev` – inicia o ambiente de desenvolvimento
- `npm run build` – gera a build de produção
- `npm run preview` – visualiza a aplicação compilada
- `npm run lint` – valida TypeScript

## Observações

- O projeto foi adaptado para usar o Supabase como fonte principal de dados.
- Não existem dados fake persistidos no código para uso em produção.
- O frontend lê e escreve diretamente os dados financeiros no banco quando as tabelas estão disponíveis.

## Autor

Projeto pessoal de gestão financeira para uso local e desenvolvimento contínuo.
