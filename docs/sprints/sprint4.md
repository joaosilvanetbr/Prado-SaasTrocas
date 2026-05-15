Você está trabalhando no projeto Prado SaaS Trocas.

A Sprint 1 criou a fundação.
A Sprint 2 implementou Dashboard e Lançamentos.
A Sprint 3 implementou Relatórios e Meus Setores.

Agora execute a Sprint 4.

Objetivo da Sprint 4:
Implementar o CRUD completo de Departamentos/Setores, com meta diária como limite e comprador responsável opcional.

Regras obrigatórias:
- Não alterar arquivos dentro da pasta docs/.
- Não alterar nenhum arquivo .md.
- Não alterar README.md.
- Não alterar SPEC.md.
- Não alterar SPRINT.md.
- A IA pode ler documentação, mas não pode modificá-la.
- Alterar apenas arquivos de código, configuração ou banco necessários para esta sprint.
- Não implementar CRUD completo de usuários nesta sprint.
- Não redesenhar a interface.
- Preservar visual atual.
- Não trocar a stack.
- Não substituir Drizzle por Prisma.
- Não substituir Neon por Supabase.
- Não usar dados mockados quando o banco já tiver dados reais.

Regra de negócio principal:
Meta é limite.
A meta do departamento representa o limite máximo aceitável de trocas no dia.
Realizado acima da meta é ruim.
Realizado abaixo ou igual à meta é bom ou aceitável.

Importante:
- A tela administrativa pode chamar a entidade de "Departamentos".
- No banco, a entidade continua sendo "sectors".
- Nas tabelas operacionais, pode aparecer como "Setor".
- Exibir meta como "Meta (Limite)".

Tarefas:

1. Revisar ou implementar src/app/actions/sectors.actions.ts

Garantir as funções:

createSectorAction(formData: FormData)
listSectorsAction()
listSectorsWithCompradorAction()
updateSectorAction(id: number, data: Record<string, unknown>)
deleteSectorAction(id: number)

createSectorAction:
- Receber nome, meta e comprador_id
- Validar nome obrigatório entre 1 e 100 caracteres
- Validar meta >= 0
- comprador_id é opcional
- Salvar na tabela sectors
- Retornar { success: true, sector } ou { error: string }

listSectorsAction:
- Listar todos os setores
- Ordenar por nome ou id
- Retornar { success: true, sectors } ou { error: string }

listSectorsWithCompradorAction:
- Listar setores com dados do comprador responsável via JOIN com users
- Retornar comprador_nome quando houver comprador
- Retornar comprador_id null quando não houver vínculo

updateSectorAction:
- Atualizar nome, meta e comprador_id
- Validar campos
- Não alterar lançamentos antigos
- Retornar { success: true } ou { error: string }

deleteSectorAction:
- Antes de excluir, verificar se existem daily_reports vinculados ao sector_id
- Se existirem lançamentos vinculados, não excluir
- Retornar erro amigável:
  "Não é possível excluir este departamento porque existem lançamentos vinculados a ele."
- Se não houver lançamentos, excluir normalmente
- Retornar { success: true } ou { error: string }

2. Criar ou revisar action para compradores

Arquivo sugerido:
src/app/actions/users.actions.ts

Criar função:

listCompradoresAction()

Comportamento:
- Buscar usuários com role = comprador
- Retornar apenas id e nome
- Ordenar por nome
- Retornar { success: true, compradores } ou { error: string }

Não implementar CRUD completo de usuários nesta sprint.

3. Implementar página de Departamentos

Arquivos:
- src/app/(dashboard)/departamentos/page.tsx
- src/app/(dashboard)/departamentos/DepartamentosClient.tsx

A página deve conter:
- Título "Departamentos"
- Subtítulo "Gerencie setores, metas e compradores responsáveis"
- Cards de resumo
- Botão "Novo Departamento"
- Tabela de departamentos
- Modal de criação
- Modal ou modo de edição
- Confirmação de exclusão

4. Cards de resumo

Criar cards com dados reais:

- Total de Departamentos
- Meta Global Diária
- Compradores Vinculados
- Média de Meta por Departamento

Cálculos:
- totalDepartamentos = sectors.length
- metaGlobal = soma de sectors.meta
- compradoresVinculados = quantidade de comprador_id únicos não nulos
- mediaMeta = metaGlobal / totalDepartamentos, ou 0 se não houver departamentos

Usar formatCurrency para valores monetários.

5. Tabela de departamentos

Colunas:
- Departamento
- Meta (Limite)
- Comprador Responsável
- Criado em
- Ações

Cada linha deve mostrar:
- Nome do departamento
- Meta formatada em BRL
- Nome do comprador responsável ou "Não vinculado"
- Data de criação formatada
- Botão Editar
- Botão Excluir

6. Modal de criação

Campos:
- Nome
- Meta (Limite)
- Comprador responsável opcional

Comportamento:
- Validar campos antes de salvar
- Chamar createSectorAction
- Mostrar loading ao salvar
- Fechar modal após sucesso
- Atualizar lista e cards
- Mostrar erro se falhar

7. Edição de departamento

Campos editáveis:
- Nome
- Meta (Limite)
- Comprador responsável

Comportamento:
- Preencher campos com dados atuais
- Chamar updateSectorAction
- Atualizar lista e cards após sucesso
- Não alterar daily_reports antigos
- Se comprador responsável for removido, salvar comprador_id como null

Regra importante:
Alterar sectors.meta afeta apenas a meta padrão para lançamentos futuros.
Relatórios antigos continuam usando daily_reports.valor_meta.

8. Exclusão de departamento

Comportamento:
- Ao clicar em Excluir, mostrar confirmação:
  "Tem certeza que deseja excluir este departamento? Essa ação pode afetar relatórios vinculados."
- Se confirmar, chamar deleteSectorAction
- Se houver daily_reports vinculados, mostrar erro amigável
- Não implementar exclusão em cascata nesta sprint
- Atualizar lista após sucesso

9. Comprador responsável

Regras:
- Campo é opcional
- Listar apenas usuários com role comprador
- Se não houver compradores cadastrados, permitir criar departamento mesmo assim
- Na tabela, exibir "Não vinculado" quando comprador_id for null

10. Permissões

Garantir que /departamentos continue acessível apenas para admin.

Verificar:
- gerente não acessa /departamentos
- comprador não acessa /departamentos

Não quebrar proxy/middleware.

11. Visual

Preservar visual atual:
- Sidebar azul forte
- Item ativo amarelo
- Cards limpos
- Tabela limpa
- Botões no padrão existente
- Modal no padrão existente
- Sem redesign completo

12. Validações finais

Após implementar:
- Rodar TypeScript
- Rodar build
- Corrigir erros

Critérios de aceite:
- /departamentos carrega dados reais do banco
- Cards mostram dados reais
- Criar departamento funciona
- Editar departamento funciona
- Excluir departamento pede confirmação
- Departamento com lançamentos vinculados não é excluído diretamente
- Comprador responsável opcional funciona
- Compradores vinculados é calculado corretamente
- Meta Global Diária é calculada corretamente
- Média de meta é calculada corretamente
- Lista atualiza após operações
- Nenhum arquivo .md foi alterado
- Pasta docs/ não foi alterada
- npm run build passa
- TypeScript passa sem erros

Não implemente nada fora desta sprint.