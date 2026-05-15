Você está trabalhando no projeto Prado SaaS Trocas.

Existe apenas a especificação técnica no projeto. Sua tarefa é executar a Sprint 1: criar a fundação funcional do sistema.

Stack obrigatória:
- Next.js 16 com App Router
- React 19
- TypeScript
- TailwindCSS
- Drizzle ORM
- PostgreSQL Neon
- JWT com jose
- bcrypt para senhas

Objetivo da Sprint 1:
Criar estrutura base do projeto, banco de dados, autenticação, layout principal, sidebar, permissões iniciais e páginas protegidas.

Não implemente ainda todos os CRUDs completos. Esta sprint é apenas a fundação.

Tarefas:

1. Criar estrutura de pastas:

src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/layout.tsx
│   ├── (dashboard)/page.tsx
│   ├── (dashboard)/meus-setores/page.tsx
│   ├── (dashboard)/relatorios/page.tsx
│   ├── (dashboard)/lancamentos/page.tsx
│   ├── (dashboard)/departamentos/page.tsx
│   ├── (dashboard)/usuarios/page.tsx
│   ├── (dashboard)/configuracoes/page.tsx
│   ├── actions/
│   ├── api/
│   ├── layout.tsx
│   └── providers.tsx
├── components/
├── db/
├── hooks/
└── lib/

2. Configurar variáveis de ambiente:

DATABASE_URL=
JWT_SECRET=
NODE_ENV=

Criar src/lib/env.ts validando:
- DATABASE_URL obrigatória
- JWT_SECRET obrigatória
- JWT_SECRET com mínimo de 32 caracteres

3. Configurar Drizzle + Neon.

Criar:
- src/db/schema.ts
- src/db/index.ts
- drizzle.config.ts

Tabelas:

users:
- id serial primary key
- nome text not null unique
- password_hash text not null
- role text not null
- setores text default ''
- created_at timestamp default now

sectors:
- id serial primary key
- nome text not null
- meta real not null default 0
- comprador_id integer nullable references users.id
- created_at timestamp default now

daily_reports:
- id serial primary key
- date text not null
- valor_realizado real not null default 0
- valor_meta real not null default 0
- sector_id integer references sectors.id
- created_at timestamp default now

4. Criar seed inicial.

Usuário admin:
- nome: Comercial.Cadastro
- senha: 160922
- role: admin
- setores: ""

Setores iniciais:
- Açougue, meta 3000
- Bebidas, meta 7000
- Petshop, meta 2000
- Higiene, meta 3500
- Mercearia, meta 10000
- Padaria, meta 2500
- Hortifruti, meta 4000

A senha deve ser salva com bcrypt.

5. Criar autenticação em src/app/actions/auth.ts.

Implementar:
- loginAction(formData: FormData)
- logoutAction()

loginAction deve:
- Receber username e password
- Buscar usuário pelo nome com comparação case-insensitive
- Validar senha com bcrypt
- Gerar JWT com jose
- Payload: sub, nome, roles, setores
- Salvar cookie auth_token httpOnly com expiração de 1 dia
- Retornar { success: true, roles } ou { error: string }

logoutAction deve:
- Remover cookie auth_token
- Retornar { success: true }

6. Criar tela de login.

Arquivo:
src/app/(auth)/login/page.tsx

Campos:
- Usuário
- Senha
- Botão Entrar
- Loading ao enviar
- Mensagem de erro

Após login:
- admin vai para /
- gerente vai para /relatorios
- comprador vai para /meus-setores

7. Criar controle de permissões.

Arquivo:
src/lib/permissions.ts

Permissões:
- "/" somente admin
- "/relatorios" admin e gerente
- "/lancamentos" somente admin
- "/departamentos" somente admin
- "/usuarios" somente admin
- "/meus-setores" admin, gerente e comprador
- "/configuracoes" admin, gerente e comprador

8. Criar src/proxy.ts.

O proxy deve:
- Verificar cookie auth_token
- Redirecionar não logado para /login
- Evitar usuário logado acessar /login
- Validar permissão por rota
- Redirecionar comprador para /meus-setores
- Redirecionar gerente para /relatorios
- Redirecionar admin para /

9. Criar layout principal.

Arquivos:
- src/app/(dashboard)/layout.tsx
- src/components/Sidebar.tsx

Sidebar:
- Dashboard
- Meus Setores
- Relatórios
- Lançamentos
- Departamentos
- Usuários
- Configurações
- Sair

Mostrar apenas links permitidos pelo cargo do usuário.

Visual:
- Sidebar azul forte
- Item ativo amarelo
- Layout lateral fixo
- Estilo limpo e moderno
- Não gastar tempo com redesign avançado

10. Criar componentes UI base:

- src/components/ui/Button.tsx
- src/components/ui/Card.tsx
- src/components/ui/Input.tsx
- src/components/ui/Badge.tsx
- src/components/ui/Modal.tsx

11. Criar páginas protegidas placeholder:

/ -> título "Relatório de Trocas Diário"
/meus-setores -> título "Meus Setores"
/relatorios -> título "Histórico"
/lancamentos -> título "Lançamentos do Dia"
/departamentos -> título "Departamentos"
/usuarios -> título "Gestão de Usuários"
/configuracoes -> título "Configurações"

Cada página deve ter um subtítulo e estrutura visual simples.

12. Criar helpers de formatação em src/lib/format.ts:

- formatCurrency(value: number)
- formatDateBR(date: Date | string)
- formatPercent(value: number)

Critérios de aceite:
- Projeto inicia sem erro
- Banco conecta no Neon
- Tabelas são criadas
- Seed cria admin e setores
- Login Comercial.Cadastro / 160922 funciona
- Cookie auth_token é criado
- Rotas privadas exigem login
- Sidebar aparece após login
- Links respeitam permissões
- Logout funciona
- Todas as páginas principais existem
- npm run build passa
- TypeScript passa sem erros

Importante:
Não implemente CRUDs completos nesta sprint.
Não invente funcionalidades fora da spec.
Não mude a stack.
Faça apenas a fundação sólida para as próximas sprints.