# Prado SaaS Trocas - Especificação Técnica

## 1. Visão Geral do Projeto

**Prado SaaS Trocas** é um sistema SaaS de gestão de trocas (vendas) diárias por setor/departamento. Permite que gestores acompanhem o desempenho de cada departamento em relação às metas diárias设定的, e compradores visualizem apenas seus próprios setores.

**Tech Stack:**
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes (Server Actions), Drizzle ORM
- **Banco de Dados:** PostgreSQL (Neon Serverless Postgres)
- **Autenticação:** JWT via jose, bcrypt para senhas
- **Query Management:** TanStack React Query
- **Deploy:** Vercel

---

## 2. Modelo de Dados (Schema do Banco)

### 2.1 Tabela `users`

Armazena os usuários do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | serial (PK) | Identificador único |
| `nome` | text | Nome de usuário (único, case-insensitive na busca) |
| `password_hash` | text | Hash bcrypt da senha |
| `role` | text | Cargo: `admin`, `gerente` ou `comprador` |
| `setores` | text | IDs dos setores separados por vírgula (ex: "1,2,3"). Vazio = todos |
| `created_at` | timestamp | Data de criação |

### 2.2 Tabela `sectors`

Armazena os departamentos/setores.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | serial (PK) | Identificador único |
| `nome` | text | Nome do setor (ex: "Açougue", "Bebidas") |
| `meta` | real | Meta diária padrão do setor (em R$) |
| `comprador_id` | integer (FK) | Referência ao usuário comprador responsável (opcional) |
| `created_at` | timestamp | Data de criação |

### 2.3 Tabela `daily_reports`

Armazena os lançamentos diários de cada setor.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | serial (PK) | Identificador único |
| `date` | text | Data do lançamento (formato: YYYY-MM-DD) |
| `valor_realizado` | real | Valor realizado/vendido naquele dia (em R$) |
| `valor_meta` | real | Meta do dia para o setor (em R$) |
| `sector_id` | integer (FK) | Referência ao setor |
| `created_at` | timestamp | Data de criação |

---

## 3. Sistema de Papéis e Permissões

### 3.1 Papéis (Roles)

| Papel | Descrição |
|-------|-----------|
| `admin` | Gestor de Operações - acesso completo |
| `gerente` | Gerente Comercial |
| `comprador` | Comprador - acesso restrito aos seus setores |

### 3.2 Permissões por Rota

| Rota | admin | gerente | comprador |
|------|-------|---------|-----------|
| `/` (Dashboard) | Sim | Não | Não |
| `/relatorios` | Sim | Sim | Não |
| `/lancamentos` | Sim | Não | Não |
| `/departamentos` | Sim | Não | Não |
| `/usuarios` | Sim | Não | Não |
| `/meus-setores` | Sim | Sim | Sim |
| `/configuracoes` | Sim | Sim | Sim |

### 3.3 Regras de Negócio

- Usuários com papel `comprador` só veem setores atribuídos a eles
- O campo `setores` em `users` define quais setores o comprador pode acessar (vazio = todos)
- O `comprador_id` em `sectors` vincula um comprador responsável ao setor

---

## 4. Autenticação

### 4.1 Fluxo de Login

1. Usuário informa **nome de usuário** e **senha**
2. Busca no banco com `ILIKE` (case-insensitive)
3. Valida senha com bcrypt
4. Gera JWT com payload: `{ sub, nome, roles, setores }`
5. Define cookie `auth_token` (httpOnly, 1 dia de expiração)

### 4.2 JWT Payload

```json
{
  "sub": "1",
  "nome": "Comercial.Cadastro",
  "roles": ["admin"],
  "setores": []
}
```

### 4.3 Rate Limiting

- Limite de 5 tentativas de login por minuto por IP
- Após 5 tentativas, retorna erro "Muitas tentativas. Tente novamente em alguns minutos."

---

## 5. API Actions (Server Actions)

### 5.1 Auth Actions (`src/app/actions/auth.ts`)

#### `loginAction(formData: FormData)`
- **Input:** FormData com `username` e `password`
- **Validação:** Zod schema (nome: 1-100 chars, senha: 1-100 chars)
- **Output:** `{ success: true, roles }` ou `{ error: string }`
- **Efeitos:** Define cookie `auth_token`

#### `logoutAction()`
- **Output:** `{ success: true }`
- **Efeitos:** Remove cookie `auth_token`

### 5.2 Users Actions (`src/app/actions/users.actions.ts`)

#### `createUserAction(formData: FormData)`
- **Input:** FormData com `nome`, `password`, `role`, `setores`
- **Validação:** nome: 1-100 chars, password: 6-100 chars, role: obrigatório
- **Output:** `{ success: true, user }` ou `{ error: string }`
- **Restrições:** Nome único no banco

#### `listUsersAction()`
- **Output:** `{ success: true, users }` ou `{ error: string }`

#### `updateUserAction(id: number, data: Record<string, unknown>)`
- **Input:** Dados parciais com `nome`, `role`, `setores` (opcionais)
- **Output:** `{ success: true }` ou `{ error: string }`

#### `deleteUserAction(id: number)`
- **Output:** `{ success: true }` ou `{ error: string }`

#### `updatePasswordAction(id: number, oldPassword: string, newPassword: string)`
- **Validação:** oldPassword: obrigatório, newPassword: 6-100 chars
- **Output:** `{ success: true }` ou `{ error: string }`

### 5.3 Sectors Actions (`src/app/actions/sectors.actions.ts`)

#### `createSectorAction(formData: FormData)`
- **Input:** FormData com `nome`, `meta`, `comprador_id`
- **Validação:** nome: 1-100 chars, meta: >= 0
- **Output:** `{ success: true, sector }` ou `{ error: string }`

#### `listSectorsAction()`
- **Output:** `{ success: true, sectors }` ou `{ error: string }`

#### `listSectorsWithCompradorAction()`
- **Output:** `{ success: true, sectors }` com dados do comprador via JOIN

#### `updateSectorAction(id: number, data: Record<string, unknown>)`
- **Input:** Dados parciais com `nome`, `meta`, `comprador_id` (opcionais)
- **Output:** `{ success: true }` ou `{ error: string }`

#### `deleteSectorAction(id: number)`
- **Output:** `{ success: true }` ou `{ error: string }`

### 5.4 Reports Actions (`src/app/actions/reports.actions.ts`)

#### `saveDailyReportAction(date: string, sectorsData: SectorReport[])`
- **Input:** Data (YYYY-MM-DD) e array de `{ sector_id, valor_realizado, valor_meta }`
- **Validação:** Date no formato YYYY-MM-DD, valores >= 0
- **Comportamento:** DELETE + INSERT (substitui lançamentos do dia)
- **Output:** `{ success: true }` ou `{ error: string }`

#### `getReportsByDateAction(date: string)`
- **Input:** Data no formato YYYY-MM-DD
- **Output:** `{ success: true, reports }` com dados do setor via JOIN

#### `getReportsHistoryAction(startDate?: string, endDate?: string)`
- **Input:** Datas opcionais para filtragem
- **Output:** `{ success: true, reports }` ordenado por data

#### `getTodayReportsAction()`
- **Output:** `{ success: true, reports }` do dia atual

### 5.5 Dashboard Actions (`src/app/actions/dashboard.actions.ts`)

#### `getDashboardData()`
- **Output:** `{ sectors, date }` com setores do dia atual e seus relatórios

---

## 6. Estrutura de Pastas e Arquivos

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Página de login
│   ├── (dashboard)/
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── layout.tsx            # Layout com Sidebar
│   │   ├── configuracoes/
│   │   │   ├── page.tsx         # Configurações (Server)
│   │   │   └── ConfiguracoesClient.tsx
│   │   ├── departamentos/
│   │   │   └── page.tsx         # Departamentos
│   │   ├── lancamentos/
│   │   │   ├── page.tsx         # Lançamentos (Server)
│   │   │   └── LancamentosClient.tsx
│   │   ├── meus-setores/
│   │   │   └── page.tsx         # Meus Setores
│   │   ├── relatorios/
│   │   │   ├── page.tsx         # Relatórios (Server)
│   │   │   └── RelatoriosClient.tsx
│   │   └── usuarios/
│   │       └── page.tsx         # Gestão de Usuários
│   ├── actions/
│   │   ├── auth.ts              # Login/Logout
│   │   ├── users.actions.ts      # CRUD Usuários
│   │   ├── sectors.actions.ts   # CRUD Setores
│   │   ├── reports.actions.ts    # Relatórios
│   │   └── dashboard.actions.ts # Dados do Dashboard
│   ├── api/
│   │   └── auth/
│   │       └── verify/
│   │           └── route.ts      # API para verificar JWT
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── Sidebar.tsx
│   ├── SectorsTable.tsx
│   ├── KPICards.tsx
│   ├── ui/                      # Componentes UI
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   └── icons/
│       └── index.tsx
├── hooks/
│   ├── useAuth.ts               # Hook para dados do usuário
│   ├── useSectors.ts           # Hook para setores (React Query)
│   ├── useUsers.ts             # Hook para usuários (React Query)
│   ├── useReports.ts           # Hook para relatórios (React Query)
│   └── useFormatter.ts
├── lib/
│   ├── env.ts                  # Validação de env vars
│   ├── format.ts               # Funções de formatação
│   └── permissions.ts           # Controle de permissões
└── db/
    ├── schema.ts               # Schema Drizzle
    └── index.ts                # Instância do banco
```

---

## 7. Páginas e Funcionalidades

### 7.1 Login (`/login`)

- Formulário com campos: Usuário, Senha
- Login case-insensitive
- Rate limiting (5 tentativas/minuto)
- Redirecionamento baseado no role após login

### 7.2 Dashboard (`/`)

- Mostra data atual formatada em português
- KPIs: Total Meta, Total Realizado, Diferença
- Tabela com detalhamento por setor (meta vs realizado)
- Badge "Ao vivo" (indicador visual)

### 7.3 Lançamentos (`/lancamentos`)

- Lista setores com campos editáveis: Realizado (R$), Meta (R$)
- Salvamento automático ao sair do campo (onBlur)
- Indicadores visuais: spinner ao salvar, check quando salvo
- Botão "Zerar Realizados"
- Meta pré-preenchida com valor padrão do setor

### 7.4 Relatórios (`/relatorios`)

- Selector de data para filtrar relatórios
- Mostra todas as datas com lançamentos
- Tabela com: Setor, Realizado, Meta, Diferença
- Barra de progresso visual
- Totais no rodapé

### 7.5 Departamentos (`/departamentos`)

- CRUD completo de departamentos
- Campos: Nome, Meta Diária
- Lista com total de departamentos e meta global
- Validação no formulário

### 7.6 Usuários (`/usuarios`)

- CRUD completo de usuários
- Campos: Nome, Senha (só na criação), Cargo, Setores
- Busca por nome
- Ativação/Inativação de usuários
- Confirmação antes de excluir

### 7.7 Configurações (`/configuracoes`)

- **Perfil:** Visualização e edição do nome
- **Segurança:** Alteração de senha (senha atual + nova + confirmação)
- Validações: senhas devem coincidir, mínimo 6 caracteres

### 7.8 Meus Setores (`/meus-setores`)

- Lista apenas setores do comprador logado
- Visualização simples para compradores

---

## 8. Middleware/Proxy

O arquivo `src/proxy.ts` (Next.js 16) controla autenticação e autorização:

- Verifica token JWT no cookie `auth_token`
- Redireciona para `/login` se não autenticado
- Redireciona para home correta se já autenticado (evita loop)
- Verifica se usuário tem permissão para acessar a rota

---

## 9. Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require
JWT_SECRET=your-secret-key-min-32-chars-here
NODE_ENV=development|production
```

---

## 10. Fluxo de Dados Típico

### 10.1 Login
```
Usuário → /login → loginAction() → JWT → Cookie → Redirect
```

### 10.2 Cadastro de Lançamento
```
Lançamentos → blur campo → saveDailyReportAction() → INSERT daily_reports → Query invalidation → Refresh
```

### 10.3 Acesso à Dashboard
```
/ → proxy.ts verifica JWT → layout.tsx extrai roles → Sidebar mostra rotas permitidas → page.tsx busca dados → Render
```

### 10.4 Alteração de Senha
```
Configurações → SenhasContent → updatePasswordAction() → bcrypt hash → UPDATE users → Sucesso
```

---

## 11. Regras de Negócio Importantes

1. **Metas por Setor:** Cada setor tem uma meta padrão (`meta` em `sectors`). Ao criar lançamentos, essa meta é pré-preenchida mas pode ser alterada diariamente.

2. **Relatórios Diários:** A tabela `daily_reports` armazena um registro por setor por dia. Se um lançamento já existe para aquele dia/setor, é substituído (DELETE + INSERT).

3. **Setores do Comprador:** O campo `setores` em `users` é uma string com IDs separados por vírgula. Se vazio, o comprador tem acesso a todos os setores.

4. **Comprador Responsável:** O campo `comprador_id` em `sectors` vincula um comprador ao setor, mas não é usado para filtrar permissões (a filtragem é feita pelo campo `setores` do usuário).

5. **Case-Insensitive Login:** A busca por nome de usuário usa `ILIKE` no PostgreSQL para permitir login case-insensitive.

---

## 12. Seed Inicial

Ao configurar o projeto, executar script para criar:

**Setores padrão:**
- Açougue
- Bebidas
- Petshop
- Higiene
- Mercearia
- Padaria
- Hortifruti

**Usuário admin:**
- Nome: `Comercial.Cadastro`
- Senha: `160922`
- Role: `admin`

---

## 13. Migrações Drizzle

| Migration | Descrição |
|----------|-----------|
| `0000_nappy_tarot` | Criação inicial das tabelas (users, sectors, daily_reports) |
| `0001_drop_email` | Remoção do campo email (autenticação só por usuário) |
| `0002_lame_dragon_man` | Migration gerada após refatoração |
| `0003_spotty_emma_frost` | Adição do campo `meta` na tabela `sectors` |

---

## 14. Deploy

- **Plataforma:** Vercel
- **Banco:** Neon PostgreSQL Serverless
- **Variáveis de Ambiente Necessárias:**
  - `DATABASE_URL` (requer sslmode=require)
  - `JWT_SECRET` (mínimo 32 caracteres)

---

*Documento gerado em: 14/05/2026*
*Última atualização: Após implementação do campo meta em departamentos*