Você está trabalhando no projeto Prado SaaS Trocas.

A Sprint 1 criou a fundação do projeto.
A Sprint 2 implementou Dashboard real, KPIs, tabela de setores e Lançamentos do Dia.

Agora execute a Sprint 3.

Objetivo da Sprint 3:
Implementar Relatórios/Histórico e Meus Setores com dados reais do banco, filtro por data, permissões por papel e regra visual global de performance.

Regras obrigatórias:
- Não alterar arquivos dentro da pasta docs/.
- Não alterar nenhum arquivo .md.
- Não alterar README.md.
- Não alterar SPEC.md.
- Não alterar SPRINT.md.
- A IA pode ler documentação, mas não pode modificá-la.
- Alterar apenas arquivos de código, configuração ou banco necessários para a sprint.
- Não implementar CRUD completo de usuários nesta sprint.
- Não implementar CRUD completo de departamentos nesta sprint.
- Não redesenhar a interface.
- Preservar visual atual.
- Não trocar a stack.
- Não substituir Drizzle por Prisma.
- Não substituir Neon por Supabase.

Regra de negócio principal:
Meta é limite.
Realizado acima da meta é ruim.
Realizado abaixo ou igual à meta é bom ou aceitável.
Diferença positiva significa estouro do limite.
Diferença negativa significa dentro do limite.

Regra visual global:
- Sem lançamento: neutro/cinza
- Percentual até 79%: Ótimo / verde
- Percentual de 80% até 100%: Atenção / amarelo
- Percentual de 101% até 129%: Acima / vermelho
- Percentual de 130% ou mais: Crítico / vermelho

Tarefas:

1. Revisar src/lib/performance.ts

Garantir que existam as funções:
- calcularDiferenca(realizado, meta)
- calcularPercentual(realizado, meta)
- getStatusTrocas(realizado, meta, hasReport?)
- getPerformanceColor(realizado, meta, hasReport?)

Nenhuma tela deve calcular status manualmente.
Dashboard, Relatórios e Meus Setores devem usar esse helper.

2. Revisar src/lib/format.ts

Garantir funções:
- formatCurrency(value)
- formatDateBR(date)
- formatPercent(value)
- formatInputDate(date?)

Usar pt-BR e BRL.

3. Implementar histórico em src/app/actions/reports.actions.ts

Garantir ou criar:

getReportsHistoryAction(startDate?: string, endDate?: string)

Comportamento:
- Buscar registros em daily_reports
- Fazer join com sectors
- Permitir filtro por startDate e endDate
- Ordenar por data decrescente
- Calcular diferença, percentual e status usando src/lib/performance.ts
- Retornar { success: true, reports } ou { error: string }

Formato esperado de cada item:
{
  id,
  date,
  sectorId,
  sectorName,
  realizado,
  meta,
  diferenca,
  percentual,
  status,
  statusVariant
}

Garantir também:

getReportsByDateAction(date: string)

Comportamento:
- Buscar relatórios da data
- Fazer join com setores
- Retornar dados calculados

4. Implementar página de Relatórios

Arquivos:
- src/app/(dashboard)/relatorios/page.tsx
- src/app/(dashboard)/relatorios/RelatoriosClient.tsx

A página deve conter:
- Título "Histórico"
- Subtítulo simples
- Filtro por data inicial
- Filtro por data final
- Botão "Aplicar filtro"
- Botão "Limpar filtro"
- Cards de totais
- Tabela de relatórios

Cards:
- Total Realizado
- Meta (Limite)
- Diferença
- Registros

Tabela:
- Data
- Setor
- Realizado
- Meta (Limite)
- Diferença
- Percentual
- Status

Regras:
- Valores em BRL
- Datas em pt-BR
- Diferença positiva em vermelho
- Diferença negativa ou zero em verde
- Badge de status usando helper de performance

Estado vazio:
Se não houver relatórios, mostrar:
"Nenhum lançamento encontrado para o período selecionado."

5. Implementar Meus Setores

Arquivos:
- src/app/(dashboard)/meus-setores/page.tsx
- src/app/(dashboard)/meus-setores/MeusSetoresClient.tsx

A tela deve:
- Buscar usuário logado
- Identificar role e setores permitidos
- Buscar setores permitidos
- Buscar lançamentos do dia
- Juntar setor + relatório
- Mostrar apenas setores permitidos
- Usar a mesma regra visual do Dashboard

6. Criar action para Meus Setores

Criar, se necessário:
src/app/actions/meus-setores.actions.ts

Função:
getMySectorsData(date?: string)

Comportamento:
- Ler cookie/JWT do usuário logado
- Obter sub, roles e setores
- Buscar setores permitidos
- Buscar relatórios da data atual ou informada
- Se não existir relatório para um setor:
  - realizado = 0
  - meta = sectors.meta
  - hasReport = false
  - status = Sem lançamento
- Se existir relatório:
  - usar valor_realizado
  - usar valor_meta
  - hasReport = true
- Calcular diferença, percentual e status via helper central
- Retornar { success: true, sectors } ou { error: string }

Retorno esperado:
{
  id,
  nome,
  meta,
  realizado,
  diferenca,
  percentual,
  status,
  statusVariant,
  hasReport
}

7. Layout de Meus Setores

Manter visual atual.

A tela deve conter:
- Título "Meus Setores"
- Subtítulo "Acompanhe os setores vinculados ao seu usuário"
- Cards de resumo:
  - Setores vinculados
  - Total Realizado
  - Meta (Limite)
  - Diferença
- Tabela ou cards por setor:
  - Setor
  - Realizado
  - Meta (Limite)
  - Diferença
  - Percentual
  - Status

8. Corrigir regra visual de Meus Setores

Exemplo correto:
Bebidas:
- Realizado R$ 13.075,32
- Meta R$ 7.000,00
- Percentual 187%
- Diferença +R$ 6.075,32
- Status Crítico
- Cor vermelha

Petshop:
- Realizado R$ 921,82
- Meta R$ 2.000,00
- Percentual 46%
- Diferença -R$ 1.078,18
- Status Ótimo
- Cor verde

Nunca tratar valor acima da meta como positivo.

9. Garantir permissões

Rotas:
- /relatorios: admin e gerente
- /meus-setores: admin, gerente e comprador

Verificar:
- comprador não acessa /relatorios
- comprador não acessa /lancamentos
- comprador não acessa /departamentos
- comprador não acessa /usuarios

10. Garantir integração com dados reais

Não usar mock fixo.
Usar dados reais de:
- sectors
- daily_reports
- users.setores

11. Rodar validações

Após implementar:
- rodar TypeScript
- rodar build
- corrigir erros

Critérios de aceite:
- Relatórios carregam dados reais
- Filtro de data funciona
- Cards de totais calculam corretamente
- Tabela de relatórios aparece corretamente
- Estado vazio aparece quando não houver dados
- Meus Setores carrega setores permitidos
- Comprador vê apenas setores atribuídos
- Status visual respeita a regra global
- Setor sem lançamento aparece neutro
- Nenhum arquivo .md foi alterado
- Pasta docs/ não foi alterada
- npm run build passa
- TypeScript passa sem erros

Não implemente nada fora desta sprint.