'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as client from '@/app/actions/reports.actions';

export function useReports() {
  const queryClient = useQueryClient();

  const saveDailyReport = useMutation({
    mutationFn: async ({ date, sectors }: { date: string; sectors: { sector_id: number; valor_realizado: number; valor_meta: number }[] }) => {
      const result = await client.saveDailyReportAction(date, sectors);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports', variables.date] });
      queryClient.invalidateQueries({ queryKey: ['reports', 'today'] });
    },
  });

  return {
    saveDailyReport: saveDailyReport.mutate,
    isSaving: saveDailyReport.isPending,
  };
}

export function useReportsByDate(date: string) {
  return useQuery({
    queryKey: ['reports', 'date', date],
    queryFn: async () => {
      const result = await client.getReportsByDateAction(date);
      if (result.error) throw new Error(result.error);
      return result.reports;
    },
    enabled: !!date,
  });
}

export function useTodayReports() {
  return useQuery({
    queryKey: ['reports', 'today'],
    queryFn: async () => {
      const result = await client.getTodayReportsAction();
      if (result.error) throw new Error(result.error);
      return result.reports;
    },
  });
}

export function useReportsHistory(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'history', startDate, endDate],
    queryFn: async () => {
      const result = await client.getReportsHistoryAction(startDate, endDate);
      if (result.error) throw new Error(result.error);
      return result.reports;
    },
  });
}