'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as sectorsClient from '@/app/actions/sectors.actions';
import * as usersClient from '@/app/actions/users.actions';

export function useSectors() {
  const queryClient = useQueryClient();

  const listSectors = useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const result = await sectorsClient.listSectorsAction();
      if (result.error) throw new Error(result.error);
      return result.sectors;
    },
  });

  const listSectorsWithComprador = useQuery({
    queryKey: ['sectors', 'withComprador'],
    queryFn: async () => {
      const result = await sectorsClient.listSectorsWithCompradorAction();
      if (result.error) throw new Error(result.error);
      return result.sectors;
    },
  });

  const createSector = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await sectorsClient.createSectorAction(formData);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
    },
  });

  const updateSector = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      const result = await sectorsClient.updateSectorAction(id, data);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
    },
  });

  const deleteSector = useMutation({
    mutationFn: async (id: number) => {
      const result = await sectorsClient.deleteSectorAction(id);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
    },
  });

  const listCompradores = useQuery({
    queryKey: ['compradores'],
    queryFn: async () => {
      const result = await usersClient.listCompradoresAction();
      if (result.error) throw new Error(result.error);
      return result.compradores;
    },
  });

  return {
    sectors: listSectors.data ?? [],
    sectorsWithComprador: listSectorsWithComprador.data ?? [],
    compradores: listCompradores.data ?? [],
    isLoading: listSectors.isLoading,
    isError: listSectors.isError,
    createSector: createSector.mutate,
    updateSector: updateSector.mutate,
    deleteSector: deleteSector.mutate,
    isCreating: createSector.isPending,
    isUpdating: updateSector.isPending,
    isDeleting: deleteSector.isPending,
  };
}
