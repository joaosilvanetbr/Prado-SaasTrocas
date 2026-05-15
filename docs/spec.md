## 0. Regras Globais do Projeto

### 0.1 Meta como Limite

Neste sistema, a meta representa o limite máximo aceitável de trocas no dia.

- Realizado acima da meta é ruim.
- Realizado abaixo ou igual à meta é bom ou aceitável.
- Diferença positiva significa estouro do limite.
- Diferença negativa significa que está dentro do limite.

Exemplo:

- Realizado: R$ 13.075,32
- Meta: R$ 7.000,00
- Diferença: +R$ 6.075,32
- Resultado: ruim, vermelho, status Crítico ou Acima.

### 0.2 Regras Visuais de Performance

Todas as telas devem seguir a mesma regra visual:

- Percentual até 79%: Ótimo / verde
- Percentual de 80% até 100%: Atenção / amarelo
- Percentual de 101% até 129%: Acima / vermelho
- Percentual de 130% ou mais: Crítico / vermelho

Essa regra vale para:

- Dashboard
- Meus Setores
- Relatórios
- Histórico
- Lançamentos
- KPIs
- Barras de progresso
- Badges de status

### 0.3 Helper Central de Performance

Todos os cálculos de diferença, percentual, status e cor devem usar um helper central:

`src/lib/performance.ts`

Funções obrigatórias:

- `calcularDiferenca(realizado, meta)`
- `calcularPercentual(realizado, meta)`
- `getStatusTrocas(realizado, meta)`
- `getPerformanceColor(realizado, meta)`

Nenhuma tela deve duplicar a regra de cálculo manualmente.

### 0.4 Diretriz Visual

O visual atual do sistema está aprovado.

Manter:

- Sidebar azul forte
- Item ativo amarelo
- Cards brancos com borda leve
- Tabelas limpas
- Espaçamento amplo
- Tipografia forte nos títulos
- Badges coloridos para status
- Visual administrativo moderno

Evitar:

- Redesenho completo
- Troca de paleta
- Mudanças grandes no layout
- Alterações visuais fora do escopo da sprint

### 0.5 Fonte de Verdade para Setores do Usuário

Para controle de acesso de compradores, a fonte principal é `users.setores`.

- Se `users.setores` estiver vazio, o usuário pode visualizar todos os setores permitidos pelo seu papel.
- Se `users.setores` tiver IDs separados por vírgula, o usuário só pode visualizar esses setores.
- O campo `sectors.comprador_id` é usado para vínculo operacional e exibição administrativa.

### 0.6 Restrições para Agentes de IA

Ao implementar sprints com agentes de IA:

- Não trocar a stack definida.
- Não substituir Drizzle por Prisma.
- Não substituir Neon por Supabase.
- Não alterar autenticação JWT sem solicitação.
- Não criar dados mockados quando existir banco real.
- Não implementar funcionalidades fora da sprint atual.
- Não redesenhar a interface sem pedido explícito.
- Não duplicar regras de cálculo nas telas.
- Não tratar meta como objetivo positivo; meta é limite.