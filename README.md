# Finanças AO

Aplicação de gestão financeira pessoal com foco em organização por envelopes/subcontas, controle de gastos, renda e relatórios mensais.

## Visão geral

A aplicação permite:

- acompanhar o saldo total geral e por cartão bancário;
- criar e gerenciar subcontas/envelopes de orçamento;
- registrar entradas e saídas financeiras;
- distribuir renda por categorias;
- visualizar relatórios do mês atual;
- alternar entre temas claro e escuro;
- manter uma interface moderna inspirada em apps fintech.

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Recharts

## Estrutura principal

- `src/App.tsx` – composição principal da interface
- `src/components/` – componentes da UI
- `src/context/FinanceContext.tsx` – estado global da aplicação
- `src/data/initialData.ts` – dados iniciais de demonstração
- `src/types.ts` – tipos TypeScript
- `src/utils/formatters.ts` – utilitários de formatação

## Pré-requisitos

- Node.js 18+
- npm ou yarn

## Instalação

```bash
npm install
```

## Execução local

```bash
npm run dev
```

A aplicação será iniciada em:

- http://localhost:3000

## Build de produção

```bash
npm run build
```

## Scripts disponíveis

- `npm run dev` – inicia o ambiente de desenvolvimento
- `npm run build` – gera a build de produção
- `npm run preview` – visualiza a build localmente
- `npm run lint` – valida TypeScript sem emitir arquivos

## Observações

Os dados desta aplicação são carregados em memória com valores de demonstração, ideais para visualização e prototipação.

## Autor

Projeto pessoal para gerenciamento financeiro.
