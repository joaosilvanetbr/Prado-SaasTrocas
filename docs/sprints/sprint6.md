Você está trabalhando no projeto Prado SaaS Trocas.

As sprints anteriores implementaram:
- Sprint 1: Fundação, banco, autenticação, layout e permissões
- Sprint 2: Dashboard e Lançamentos
- Sprint 3: Relatórios e Meus Setores
- Sprint 4: Departamentos
- Sprint 5: Usuários e Configurações

Agora execute a Sprint 6.

Objetivo da Sprint 6:
Fazer polimento final, QA, correções de bugs, validação de permissões, segurança básica, responsividade e preparação para deploy na Vercel.

Regras obrigatórias:
- Não alterar arquivos dentro da pasta docs/.
- Não alterar nenhum arquivo .md.
- Não alterar README.md.
- Não alterar SPEC.md.
- Não alterar SPRINT.md.
- Não alterar CHANGELOG.md.
- A IA pode ler documentação, mas não pode modificá-la.
- Alterar apenas arquivos de código, configuração ou banco necessários para correções.
- Não criar módulos grandes novos.
- Não redesenhar a interface.
- Preservar visual atual.
- Não trocar a stack.
- Não substituir Drizzle por Prisma.
- Não substituir Neon por Supabase.
- Não usar dados mockados quando o banco já tiver dados reais.
- Não implementar funcionalidades fora desta sprint.

Stack:
- Next.js 16 App Router
- React 19
- TypeScript
- TailwindCSS
- Drizzle ORM
- Neon PostgreSQL
- JWT com jose
- bcrypt para senhas
- Deploy na Vercel

Regra principal do negócio:
Meta é limite.
Realizado acima da meta é ruim.
Realizado abaixo ou igual à meta é bom ou aceitável.
Diferença positiva significa estouro do limite.
Diferença negativa significa dentro do limite.
Sem lançamento deve aparecer neutro/cinza.

Tarefas:

1. Auditar regra de performance

Revisar:
- Dashboard
- Lançamentos
- Relatórios
- Meus Setores
- KPIs
- Tabelas
- Badges
- Barras de progresso

Garantir:
- Todas usam src/lib/performance.ts
- Nenhuma tela duplica cálculo de status manualmente
- Realizado acima da meta aparece vermelho
- Realizado abaixo ou igual à meta aparece verde/amarelo
- Sem lançamento aparece neutro/cinza

2. Validar permissões

Testar e corrigir permissões:

Admin pode acessar:
- /
- /relatorios
- /lancamentos
- /departamentos
- /usuarios
- /meus-setores
- /configuracoes

Gerente pode acessar:
- /relatorios
- /meus-setores
- /configuracoes

Gerente não pode acessar:
- /
- /lancamentos
- /departamentos
- /usuarios

Comprador pode acessar:
- /meus-setores
- /configuracoes

Comprador não pode acessar:
- /
- /relatorios
- /lancamentos
- /departamentos
- /usuarios

3. Revisar autenticação

Validar:
- Login com usuário correto
- Erro com senha errada
- Erro com usuário inexistente
- Logout remove auth_token
- Usuário sem token vai para /login
- Token inválido vai para /login
- Usuário logado não fica preso em /login
- Redirecionamento correto por papel

JWT deve conter:
- sub
- nome
- roles
- setores

4. Revisar Dashboard

Garantir:
- Carrega dados reais
- KPIs batem com a tabela
- Total Realizado correto
- Meta (Limite) correta
- Diferença correta
- Status correto
- Setor sem lançamento aparece neutro
- Sem dados mockados

5. Revisar Lançamentos

Garantir:
- Carrega setores reais
- Edita realizado
- Salva ao sair do campo
- Mantém valores após refresh
- Botão Zerar Realizados funciona
- Meta padrão vem de sectors.meta quando não existe lançamento
- Meta histórica vem de daily_reports.valor_meta quando existe lançamento
- Erros são amigáveis

6. Revisar Relatórios

Garantir:
- Filtro por data inicial funciona
- Filtro por data final funciona
- Limpar filtro funciona
- Tabela carrega dados reais
- Totais batem com os registros
- Estado vazio aparece corretamente
- Datas estão em pt-BR
- Valores estão em BRL

7. Revisar Meus Setores

Garantir:
- Comprador vê apenas setores permitidos em users.setores
- Admin/gerente visualizam conforme regra atual
- Status usa a mesma lógica do Dashboard
- Realizado acima da meta fica vermelho
- Realizado abaixo da meta fica verde/amarelo
- Setor sem lançamento aparece neutro

8. Revisar Departamentos

Garantir:
- Criar departamento funciona
- Editar departamento funciona
- Excluir departamento sem lançamentos funciona
- Excluir departamento com lançamentos vinculados é bloqueado
- Comprador responsável opcional funciona
- Cards administrativos estão corretos
- Alterar sectors.meta não altera daily_reports.valor_meta antigo

9. Revisar Usuários

Garantir:
- Criar usuário funciona
- Editar usuário funciona sem exigir senha
- Excluir usuário pede confirmação
- Não é possível excluir o próprio usuário logado
- Não é possível excluir usuário vinculado a departamentos
- Setores permitidos são salvos em users.setores
- Cargo só aceita admin, gerente ou comprador
- password_hash nunca é enviado para o cliente

10. Revisar Configurações

Garantir:
- Mostra dados do usuário logado
- Permite alterar nome
- Permite alterar senha
- Valida senha atual
- Valida confirmação de senha
- Limpa campos após alterar senha
- Atualiza sessão/JWT quando necessário ou pede novo login de forma clara

11. Padronizar mensagens de erro

Evitar erros técnicos crus para o usuário.

Usar mensagens como:
- "Não foi possível carregar os dados."
- "Não foi possível salvar as alterações."
- "Senha atual incorreta."
- "As senhas não coincidem."
- "Usuário não encontrado."
- "Você não tem permissão para acessar esta página."
- "Não é possível excluir este registro porque existem dados vinculados."

12. Revisar loading, erro e estado vazio

Cada tela principal deve ter:
- Estado de carregamento
- Estado de erro
- Estado vazio
- Feedback de sucesso quando aplicável

Telas:
- Dashboard
- Lançamentos
- Relatórios
- Meus Setores
- Departamentos
- Usuários
- Configurações

13. Revisar responsividade básica

Sem redesign.

Garantir:
- Sidebar não quebra layout
- Tabelas têm overflow horizontal quando necessário
- Cards se reorganizam em telas pequenas
- Modais cabem na tela
- Inputs não estouram largura
- Botões continuam acessíveis

14. Revisar segurança básica

Garantir:
- JWT_SECRET não aparece no cliente
- DATABASE_URL não aparece no cliente
- password_hash nunca é retornado ao client
- Senhas nunca são logadas
- Roles são validadas no servidor
- Permissões são validadas no servidor
- Actions críticas validam dados no servidor
- Inputs são validados antes de gravar no banco

Actions críticas:
- createUserAction
- updateUserAction
- deleteUserAction
- createSectorAction
- updateSectorAction
- deleteSectorAction
- saveDailyReportAction
- updatePasswordAction

15. Revisar banco e migrations

Garantir:
- Schema Drizzle está consistente
- Migrations rodam sem erro
- Seed funciona em ambiente limpo
- daily_reports mantém histórico correto
- sectors.meta é meta padrão futura
- daily_reports.valor_meta é meta histórica do lançamento

Não apagar migrations antigas sem pedido explícito.

16. Preparar deploy

Verificar:
- .env.local
- drizzle.config.ts
- package.json
- next.config
- src/lib/env.ts

Variáveis obrigatórias na Vercel:
DATABASE_URL=
JWT_SECRET=
NODE_ENV=production

Regras:
- DATABASE_URL deve conter sslmode=require
- JWT_SECRET deve ter no mínimo 32 caracteres
- Não logar secrets
- Não expor env privada no client

17. Rodar validações finais

Executar os scripts disponíveis:

- npm run build

Se existirem, rodar também:
- npm run lint
- npm run typecheck

Se algum script não existir, não criar stack nova só para isso. Apenas informar no resumo final.

Corrigir todos os erros encontrados.

18. Resumo final

Ao terminar, informar no chat:
- Arquivos alterados
- Correções feitas
- Bugs encontrados e corrigidos
- Pendências, se houver
- Resultado do build
- Se o projeto está pronto para deploy

Não criar ou alterar arquivos .md para esse resumo.

Critérios de aceite:
- Todas as rotas protegidas respeitam permissões
- Login funciona
- Logout funciona
- Redirecionamento por papel funciona
- Dashboard mostra dados corretos
- Lançamentos salvam corretamente
- Relatórios filtram corretamente
- Meus Setores respeita setores permitidos
- Departamentos funcionam corretamente
- Usuários funcionam corretamente
- Configurações funcionam corretamente
- Meta é sempre tratada como limite
- Status visual é consistente em todas as telas
- Estados de loading, erro e vazio estão tratados
- Mensagens de erro são amigáveis
- Sistema não expõe password_hash
- Sistema não expõe secrets
- Responsividade básica está aceitável
- Nenhum arquivo .md foi alterado
- Pasta docs/ não foi alterada
- npm run build passa
- TypeScript passa sem erros
- Projeto está pronto para deploy na Vercel

Não implemente nada fora desta sprint.