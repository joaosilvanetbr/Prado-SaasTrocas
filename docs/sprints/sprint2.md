Você está trabalhando no projeto Prado SaaS Trocas.

A Sprint 1 já criou a fundação:
- Next.js 16 com App Router
- React 19
- TypeScript
- TailwindCSS
- Drizzle ORM
- Neon PostgreSQL
- JWT com jose
- bcrypt
- Login
- Sidebar
- Layout protegido
- Páginas placeholder
- Tabelas users, sectors e daily_reports

Agora execute a Sprint 2.

Objetivo:
Implementar Dashboard real, KPIs, tabela de setores e tela de Lançamentos do Dia usando dados reais do banco.

Importante:
- Não implementar CRUD completo de usuários ainda.
- Não implementar CRUD completo de departamentos ainda.
- Não alterar a stack.
- Não redesenhar a interface.
- Manter o visual simples, limpo e consistente com a Sprint 1.
- A meta funciona como LIMITE de trocas.
- Realizado acima da meta é ruim e deve aparecer vermelho.
- Realizado abaixo ou igual à meta é bom/aceitável e deve aparecer verde ou amarelo.
- Diferença positiva significa estouro do limite.
- Diferença negativa significa dentro do limite.

Tarefas:

1. Criar src/lib/performance.ts

Implementar:
- calcularDiferenca(realizado, meta)
- calcularPercentual(realizado, meta)
- getStatusTrocas(realizado, meta)

Regras:
- percentual = realizado / meta * 100
- se percentual >= 130: Crítico / danger
- se percentual > 100: Acima / danger
- se percentual >= 80: Atenção / warning
- senão: Ótimo / success

2. Criar ou revisar src/lib/format.ts

Garantir funções:
- formatCurrency(value)
- formatDateBR(date)
- formatInputDate(date)

Usar pt-BR e BRL.

3. Criar src/app/actions/reports.actions.ts

Implementar:

saveDailyReportAction(date: string, sectorsData: SectorReport[])

Tipo:
SectorReport = {
  sector_id: number;
  valor_realizado: number;
  valor_meta: number;
}

Comportamento:
- Validar date no formato YYYY-MM-DD
- Validar valores numéricos >= 0
- Apagar lançamentos antigos da data informada
- Inserir os novos lançamentos na tabela daily_reports
- Retornar { success: true } ou { error: string }

Implementar também:
- getReportsByDateAction(date: string)
- getTodayReportsAction()

getReportsByDateAction deve retornar relatórios com dados do setor via join.

4. Criar src/app/actions/dashboard.actions.ts

Implementar:
getDashboardData(date?: string)

Comportamento:
- Usar a data atual quando date não for enviada
- Buscar todos os setores
- Buscar os relatórios da data
- Para cada setor, retornar:
  - id
  - nome
  - meta
  - realizado
  - diferenca
  - percentual
  - status
- Se não existir relatório do dia para um setor, usar:
  - realizado = 0
  - meta = sectors.meta

5. Criar ou melhorar src/components/KPICards.tsx

Cards:
- Total Realizado
- Meta (Limite)
- Diferença

Cálculos:
- totalRealizado = soma dos realizados
- totalMeta = soma das metas
- diferenca = totalRealizado - totalMeta

Visual:
- Diferença positiva em vermelho
- Diferença negativa ou zero em verde
- Manter estilo limpo com cards

6. Criar ou melhorar src/components/SectorsTable.tsx

Colunas:
- Setor
- Realizado
- Meta (Limite)
- Diferença
- Status

Cada linha:
- Nome do setor
- Realizado formatado
- Barra de progresso
- Percentual
- Meta formatada
- Diferença formatada
- Badge de status

Regras visuais:
- realizado > meta: vermelho
- realizado <= meta: verde/amarelo
- diferença positiva: vermelho
- diferença negativa ou zero: verde

7. Editar src/app/(dashboard)/page.tsx

Implementar Dashboard real:
- Buscar getDashboardData()
- Mostrar título "Relatório de Trocas Diário"
- Mostrar data atual formatada em português
- Mostrar KPICards
- Mostrar SectorsTable
- Mostrar badge "Ao vivo"

8. Implementar tela de Lançamentos do Dia

Arquivos:
- src/app/(dashboard)/lancamentos/page.tsx
- src/app/(dashboard)/lancamentos/LancamentosClient.tsx

Comportamento:
- Buscar setores e lançamentos do dia
- Mostrar tabela com:
  - Setor
  - Input Realizado (R$)
  - Meta (R$)
  - Diferença
- Meta deve vir de daily_reports.valor_meta quando já existir lançamento
- Se não existir lançamento, usar sectors.meta
- Salvar automaticamente ao sair do campo de realizado
- Chamar saveDailyReportAction()
- Mostrar estado "salvando" simples
- Após salvar, atualizar dados

9. Criar botão "Zerar Realizados"

Na tela de lançamentos:
- Botão "Zerar Realizados"
- Confirmar antes de zerar
- Definir todos os realizados como 0
- Manter metas
- Salvar no banco
- Atualizar tela

10. Garantir persistência

Ao lançar valores e recarregar a página:
- Os valores devem continuar aparecendo
- O Dashboard deve refletir os dados salvos

11. Garantir permissões

- Dashboard continua acessível apenas para admin
- Lançamentos continua acessível apenas para admin
- Não quebrar o proxy/middleware da Sprint 1

Critérios de aceite:
- Dashboard mostra setores reais do banco
- Dashboard calcula Total Realizado, Meta e Diferença
- Tabela mostra Realizado, Meta, Diferença, Percentual e Status
- Lançamentos permite editar realizados
- Lançamentos salva em daily_reports
- Valores permanecem depois do refresh
- Botão Zerar Realizados funciona
- Diferença positiva aparece vermelha
- Diferença negativa aparece verde
- Realizado acima da meta aparece como problema
- npm run build passa
- TypeScript passa sem erros

Não implemente funcionalidades fora desta sprint.
Não faça CRUD completo de usuários.
Não faça CRUD completo de departamentos.
Não troque a arquitetura.
Não crie dados mockados fixos quando o banco já tiver dados reais.