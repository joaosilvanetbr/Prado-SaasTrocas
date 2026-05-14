'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as client from '@/app/actions/users.actions';

export function useUsers() {
  const queryClient = useQueryClient();

  const listUsers = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const result = await client.listUsersAction();
      if (result.error) throw new Error(result.error);
      return result.users;
    },
  });

  const createUser = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await client.createUserAction(formData);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      const result = await client.updateUserAction(id, data);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: number) => {
      const result = await client.deleteUserAction(id);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updatePassword = useMutation({
    mutationFn: async ({ id, oldPassword, newPassword }: { id: number; oldPassword: string; newPassword: string }) => {
      const result = await client.updatePasswordAction(id, oldPassword, newPassword);
      if (result.error) throw new Error(result.error);
      return result;
    },
  });

  return {
    users: listUsers.data ?? [],
    isLoading: listUsers.isLoading,
    isError: listUsers.isError,
    createUser: createUser.mutate,
    updateUser: updateUser.mutate,
    deleteUser: deleteUser.mutate,
    updatePassword: updatePassword.mutate,
    isCreating: createUser.isPending,
    isUpdating: updateUser.isPending,
    isDeleting: deleteUser.isPending,
    isUpdatingPassword: updatePassword.isPending,
  };
}