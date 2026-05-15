Você está trabalhando no projeto Prado SaaS Trocas.

A Sprint 1 criou a fundação.
A Sprint 2 implementou Dashboard e Lançamentos.
A Sprint 3 implementou Relatórios e Meus Setores.
A Sprint 4 implementou Departamentos.

Agora execute a Sprint 5.

Objetivo da Sprint 5:
Implementar CRUD completo de Usuários e finalizar Configurações, incluindo perfil e alteração de senha.

Regras obrigatórias:
- Não alterar arquivos dentro da pasta docs/.
- Não alterar nenhum arquivo .md.
- Não alterar README.md.
- Não alterar SPEC.md.
- Não alterar SPRINT.md.
- A IA pode ler documentação, mas não pode modificá-la.
- Alterar apenas arquivos de código, configuração ou banco necessários para esta sprint.
- Não redesenhar a interface.
- Preservar visual atual.
- Não trocar a stack.
- Não substituir Drizzle por Prisma.
- Não substituir Neon por Supabase.
- Não usar dados mockados quando o banco já tiver dados reais.
- Não alterar Dashboard, Relatórios, Lançamentos ou Departamentos, exceto se for necessário para integração de permissões.

Stack:
- Next.js 16 App Router
- React 19
- TypeScript
- TailwindCSS
- Drizzle ORM
- Neon PostgreSQL
- JWT com jose
- bcrypt para senhas

Tarefas:

1. Revisar ou implementar src/app/actions/users.actions.ts

Garantir as funções:

createUserAction(formData: FormData)
listUsersAction()
updateUserAction(id: number, data: Record<string, unknown>)
deleteUserAction(id: number)
updatePasswordAction(id: number, oldPassword: string, newPassword: string)

Criar também, se necessário:

getCurrentUserAction()
updateCurrentUserProfileAction(data)

2. createUserAction

Campos:
- nome
- password
- role
- setores

Validações:
- nome obrigatório, 1 a 100 caracteres
- password obrigatório na criação, 6 a 100 caracteres
- role obrigatório
- role deve ser apenas: admin, gerente ou comprador
- setores opcional

Comportamento:
- Verificar nome único
- Salvar senha com bcrypt
- Salvar setores como string de IDs separados por vírgula
- Se nenhum setor for selecionado, salvar setores como string vazia
- Retornar { success: true, user } ou { error: string }

3. listUsersAction

Comportamento:
- Buscar usuários reais do banco
- Não retornar password_hash para o cliente
- Ordenar por nome ou id
- Retornar id, nome, role, setores e created_at
- Retornar { success: true, users } ou { error: string }

4. updateUserAction

Campos editáveis:
- nome
- role
- setores

Validações:
- nome obrigatório quando enviado
- role deve ser admin, gerente ou comprador
- setores opcional

Regras:
- Senha não é obrigatória na edição
- Não alterar password_hash nessa action
- Verificar nome duplicado
- Atualizar setores como string de IDs separados por vírgula
- Se setores vier vazio, salvar ""
- Retornar { success: true } ou { error: string }

Se o usuário editado for o próprio usuário logado:
- Atualizar cookie/JWT quando nome, role ou setores forem alterados
- Não deixar sessão inconsistente

5. deleteUserAction

Comportamento:
- Identificar usuário logado pelo cookie/JWT
- Não permitir excluir o próprio usuário logado
- Verificar se o usuário está vinculado em sectors.comprador_id
- Se estiver vinculado, não excluir diretamente
- Retornar erro:
  "Não é possível excluir este usuário porque ele está vinculado a um ou mais departamentos."
- Se não houver vínculo, excluir usuário
- Retornar { success: true } ou { error: string }

Não implementar exclusão em cascata nesta sprint.

6. updatePasswordAction

Parâmetros:
- id
- oldPassword
- newPassword

Validações:
- oldPassword obrigatório
- newPassword obrigatório
- newPassword entre 6 e 100 caracteres

Comportamento:
- Buscar usuário
- Validar senha atual com bcrypt
- Se senha atual estiver errada, retornar erro amigável
- Gerar novo hash com bcrypt
- Atualizar password_hash
- Retornar { success: true } ou { error: string }

7. Implementar página /usuarios

Arquivos:
- src/app/(dashboard)/usuarios/page.tsx
- src/app/(dashboard)/usuarios/UsuariosClient.tsx

A página deve conter:
- Título "Gestão de Usuários"
- Subtítulo "Gerencie acessos, cargos e setores permitidos"
- Cards de resumo
- Campo de busca por nome
- Botão "Novo Usuário"
- Tabela de usuários
- Modal de criação
- Modal ou modo de edição
- Confirmação de exclusão

8. Cards da página Usuários

Criar cards:
- Total de Usuários
- Administradores
- Gerentes
- Compradores

Cálculos:
- totalUsuarios = users.length
- admins = users.filter(user => user.role === "admin").length
- gerentes = users.filter(user => user.role === "gerente").length
- compradores = users.filter(user => user.role === "comprador").length

9. Tabela de usuários

Colunas:
- Nome
- Cargo
- Setores Permitidos
- Criado em
- Ações

Ações:
- Editar
- Excluir

Exibição de setores:
- Se users.setores estiver vazio, mostrar "Todos"
- Se users.setores tiver IDs, mostrar nomes dos setores correspondentes
- Se não conseguir resolver o nome, mostrar IDs

10. Modal de criação de usuário

Campos:
- Nome
- Senha
- Cargo
- Setores permitidos

Comportamento:
- Validar campos antes de salvar
- Chamar createUserAction
- Mostrar loading ao salvar
- Fechar modal após sucesso
- Atualizar lista e cards
- Mostrar erro amigável se falhar

11. Modal ou modo de edição de usuário

Campos:
- Nome
- Cargo
- Setores permitidos

Importante:
- Não exigir senha na edição
- Não mostrar senha como campo obrigatório
- Chamar updateUserAction
- Atualizar lista e cards após sucesso
- Mostrar erro amigável se falhar

12. Seleção de setores permitidos

Comportamento:
- Carregar setores reais do banco
- Permitir seleção múltipla
- Salvar como string de IDs separados por vírgula
- Se nenhum setor for selecionado, salvar string vazia

Regra:
- users.setores vazio = todos os setores permitidos pelo papel
- users.setores com IDs = apenas esses setores

13. Exclusão de usuário

Comportamento:
- Ao clicar em excluir, mostrar confirmação:
  "Tem certeza que deseja excluir este usuário? Essa ação não poderá ser desfeita."
- Se confirmar, chamar deleteUserAction
- Se tentar excluir o próprio usuário, mostrar erro amigável
- Se usuário estiver vinculado a departamentos, mostrar erro amigável
- Atualizar lista após sucesso

14. Implementar página /configuracoes

Arquivos:
- src/app/(dashboard)/configuracoes/page.tsx
- src/app/(dashboard)/configuracoes/ConfiguracoesClient.tsx

A página deve conter duas áreas:
- Perfil
- Segurança

15. Configurações - Perfil

Mostrar:
- Nome atual
- Cargo atual
- Setores permitidos, quando aplicável

Permitir editar:
- Nome

Validações:
- Nome obrigatório
- Nome entre 1 e 100 caracteres
- Nome não pode duplicar outro usuário

Comportamento:
- Chamar updateCurrentUserProfileAction ou updateUserAction
- Atualizar banco
- Atualizar cookie/JWT se o nome for alterado
- Mostrar feedback de sucesso ou erro

16. Configurações - Segurança

Campos:
- Senha atual
- Nova senha
- Confirmar nova senha

Validações:
- Senha atual obrigatória
- Nova senha obrigatória
- Nova senha entre 6 e 100 caracteres
- Confirmar senha deve ser igual à nova senha

Comportamento:
- Chamar updatePasswordAction
- Validar senha atual
- Atualizar password_hash com bcrypt
- Mostrar feedback de sucesso
- Limpar campos após sucesso

Mensagens de erro sugeridas:
- "Senha atual incorreta."
- "A nova senha deve ter pelo menos 6 caracteres."
- "As senhas não coincidem."
- "Não foi possível alterar a senha."

17. Permissões

Garantir:
- /usuarios acessível apenas para admin
- /configuracoes acessível para admin, gerente e comprador

Verificar:
- gerente não acessa /usuarios
- comprador não acessa /usuarios
- todos os papéis acessam /configuracoes

Não quebrar proxy/middleware.

18. Segurança

Regras:
- Nunca retornar password_hash para o cliente
- Nunca logar senhas
- Nunca expor JWT_SECRET no cliente
- Validar role no servidor
- Validar permissões no servidor
- Usar bcrypt para toda senha salva

19. Visual

Preservar visual atual:
- Sidebar azul forte
- Item ativo amarelo
- Cards limpos
- Tabela limpa
- Botões no padrão existente
- Modal no padrão existente
- Sem redesign completo

20. Validações finais

Após implementar:
- Rodar TypeScript
- Rodar build
- Corrigir erros

Critérios de aceite:
- /usuarios carrega usuários reais do banco
- Cards de usuários mostram dados reais
- Busca por nome funciona
- Criar usuário funciona
- Editar usuário funciona
- Editar usuário não exige senha
- Excluir usuário pede confirmação
- Não é possível excluir o próprio usuário logado
- Não é possível excluir usuário vinculado a departamentos
- Setores permitidos são salvos corretamente em users.setores
- Cargo só aceita admin, gerente ou comprador
- Senha é salva com bcrypt
- password_hash nunca é enviado ao cliente
- /configuracoes mostra dados do usuário logado
- Usuário consegue alterar o próprio nome
- Usuário consegue alterar a senha
- Senha atual é validada antes de alterar
- Confirmação de senha funciona
- Permissões continuam corretas
- Nenhum arquivo .md foi alterado
- Pasta docs/ não foi alterada
- npm run build passa
- TypeScript passa sem erros

Não implemente nada fora desta sprint.