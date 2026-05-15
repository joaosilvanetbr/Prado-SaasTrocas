'use client';

import React, { useState, useCallback } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { SpinnerIcon, CheckIcon, WarningIcon, EditIcon, DeleteIcon, PlusIcon, SearchIcon } from '@/components/icons';
import { useUsers } from '@/hooks/useUsers';
import { useSectors } from '@/hooks/useSectors';
import { formatCurrency } from '@/lib/format';

interface User {
  id: number;
  nome: string;
  password_hash?: string;
  role: string;
  setores: string;
  created_at?: Date | null;
}

const ALL_ROLES = [
  { value: 'admin', label: 'Admin', color: 'text-[#7c3aed] bg-purple-100 border-purple-200' },
  { value: 'gerente', label: 'Gerente', color: 'text-[#0369a1] bg-sky-100 border-sky-200' },
  { value: 'comprador', label: 'Comprador', color: 'text-[#b39800] bg-[#ffff00] border-[#ffcc00]/30' },
];

interface UserForm {
  nome: string;
  password: string;
  role: string;
  setores: number[];
  status: boolean;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

function ToastNotification({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg px-4 py-3 flex items-center gap-3 animate-scale-in z-50 border-2 shadow-lg ${toast.type === 'success' ? 'border-green-400' : 'border-red-400'}`}>
      {toast.type === 'success' ? <CheckIcon className="text-green-600" /> : <WarningIcon className="text-red-600" />}
      <span className="text-[#1f2937] text-sm font-medium">{toast.message}</span>
    </div>
  );
}

export default function UsuariosPage() {
  const { users, isLoading, isError, createUser, updateUser, deleteUser, isCreating, isUpdating, isDeleting } = useUsers();
  const { sectors } = useSectors();
  const [search, setSearch] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; user: User | null }>({ show: false, user: null });
  const [formModal, setFormModal] = useState<{ show: boolean; mode: 'create' | 'edit'; user: User | null }>({ show: false, mode: 'create', user: null });
  const [form, setForm] = useState<UserForm>({ nome: '', password: '', role: 'comprador', setores: [], status: true });
  const [errors, setErrors] = useState<Partial<Record<keyof UserForm, string>>>({});

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const filteredUsers = users.filter(u =>
    u.nome.toLowerCase().includes(search.toLowerCase())
  );

  const getRolesLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRolesColor = (role: string) => {
    if (role === 'admin') return 'text-[#7c3aed] bg-purple-100 border-purple-200';
    if (role === 'gerente') return 'text-[#0369a1] bg-sky-100 border-sky-200';
    return 'text-[#b39800] bg-[#ffff00] border-[#ffcc00]/30';
  };

  const openCreate = () => {
    setForm({ nome: '', password: '', role: 'comprador', setores: [], status: true });
    setErrors({});
    setFormModal({ show: true, mode: 'create', user: null });
  };

  const openEdit = (user: User) => {
    const setoresArray = user.setores
      ? user.setores.split(',').filter(Boolean).map(s => parseInt(s.trim()))
      : [];
    setForm({
      nome: user.nome,
      password: '',
      role: user.role,
      setores: setoresArray,
      status: true,
    });
    setErrors({});
    setFormModal({ show: true, mode: 'edit', user });
  };

  const closeModal = () => {
    if (isCreating || isUpdating) return;
    setFormModal({ show: false, mode: 'create', user: null });
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof UserForm, string>> = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (formModal.mode === 'create' && !form.password.trim()) newErrors.password = 'Senha é obrigatória';
    if (form.password.length > 0 && form.password.length < 6) newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('nome', form.nome.trim());
    formData.append('role', form.role);
    formData.append('setores', form.setores.join(','));
    if (form.password) formData.append('password', form.password);

    try {
      if (formModal.mode === 'edit' && formModal.user) {
        await updateUser({ id: formModal.user.id, data: { nome: form.nome, role: form.role, setores: form.setores.join(',') } });
        showToast(`${form.nome.trim()} atualizado.`);
      } else {
        formData.append('password', form.password);
        await createUser(formData);
        showToast(`${form.nome.trim()} criado.`);
      }
      setFormModal({ show: false, mode: 'create', user: null });
    } catch {
      showToast('Erro ao salvar usuário.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    try {
      await deleteUser(deleteModal.user.id);
      showToast(`${deleteModal.user.nome} excluído.`);
      setDeleteModal({ show: false, user: null });
    } catch {
      showToast('Erro ao excluir usuário.', 'error');
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center">
        <p className="text-red-600">Erro ao carregar usuários.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {toasts.map(t => (
        <ToastNotification key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}

      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-backdrop-in">
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <DeleteIcon className="text-red-600" />
              </div>
              <div>
                <h3 className="text-[#1f2937] font-semibold">Confirmar exclusão</h3>
                <p className="text-[#6b7280] text-sm">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="text-[#374151] mb-6">Excluir <span className="font-semibold">{deleteModal.user?.nome}</span>?</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal({ show: false, user: null })}>Cancelar</Button>
              <Button variant="danger" className="flex-1" onClick={handleDelete} loading={isDeleting}>Excluir</Button>
            </div>
          </div>
        </div>
      )}

      {formModal.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-backdrop-in p-4" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-lg shadow-xl animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#1f2937]">{formModal.mode === 'edit' ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                <p className="text-sm text-[#6b7280]">{formModal.mode === 'edit' ? 'Atualize os dados do usuário.' : 'Preencha os dados do novo usuário.'}</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#6b7280] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Nome <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={e => { setForm(f => ({ ...f, nome: e.target.value })); setErrors(err => ({ ...err, nome: undefined })); }}
                  placeholder="Ex: João Silva"
                  className={`w-full bg-white border ${errors.nome ? 'border-red-400' : 'border-gray-200'} text-[#1f2937] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 transition-colors`}
                />
                {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
              </div>

              {formModal.mode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Senha <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(err => ({ ...err, password: undefined })); }}
                    placeholder="••••••••"
                    className={`w-full bg-white border ${errors.password ? 'border-red-400' : 'border-gray-200'} text-[#1f2937] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 transition-colors`}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Cargo <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  {ALL_ROLES.map(r => {
                    const selected = form.role === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, role: r.value }))}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${selected ? `${r.color} ring-2 ring-[#1e40af]/30` : 'border-gray-200 text-[#6b7280] hover:border-gray-300 hover:scale-105 active:scale-95'}`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Departamentos</label>
                <div className="flex flex-wrap gap-2">
                  {sectors.map(s => {
                    const selected = form.setores.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setForm(f => ({
                            ...f,
                            setores: selected
                              ? f.setores.filter(id => id !== s.id)
                              : [...f.setores, s.id],
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          selected
                            ? 'border-[#1e40af] bg-[#1e40af]/5 text-[#1e40af]'
                            : 'border-gray-200 text-[#6b7280] hover:border-gray-300'
                        }`}
                      >
                        {s.nome}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[#9ca3af] mt-1">Selecione os departamentos. Deixe vazio para todos.</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={closeModal} disabled={isCreating || isUpdating}>Cancelar</Button>
              <Button variant="primary" className="flex-1" onClick={handleSave} disabled={isCreating || isUpdating} loading={isCreating || isUpdating}>
                {isCreating || isUpdating ? 'Salvando...' : formModal.mode === 'edit' ? 'Salvar' : 'Criar Usuário'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="h-24 border-b border-gray-200 flex items-center px-8 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937] tracking-tight uppercase">Gestão de Usuários</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Gerencie acessos e permissões.</p>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9ca3af]">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-64 bg-white border border-gray-200 text-[#1f2937] placeholder-[#9ca3af] rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
            />
          </div>
          <Button onClick={openCreate} leftIcon={<PlusIcon />}>Adicionar Usuário</Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-[#6b7280] text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Cargo</th>
                <th className="px-6 py-4">Setores</th>
                <th className="px-6 py-4">Criado em</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#6b7280]">Carregando...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#6b7280]">Nenhum usuário encontrado.</td>
                </tr>
              ) : filteredUsers.map((user) => {
                const setoresArr = user.setores ? user.setores.split(',').filter(Boolean).map(s => parseInt(s.trim())) : [];
                const setorNames = setoresArr.length > 0 ? setoresArr.map(id => sectors.find(s => s.id === id)?.nome).filter(Boolean).join(', ') : 'Todos';
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1e40af] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {user.nome.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[#1f2937] font-medium">{user.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getRolesColor(user.role)}`}>
                        {getRolesLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#6b7280] text-xs max-w-[140px]">{setorNames}</td>
                    <td className="px-6 py-4 text-[#6b7280] text-xs">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(user)} title="Editar" className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-[#6b7280] hover:text-[#1f2937] hover:border-[#1e40af] transition-colors">
                          <EditIcon />
                        </button>
                        <button onClick={() => setDeleteModal({ show: true, user })} title="Excluir" className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-[#6b7280] hover:text-red-600 hover:border-red-400 transition-colors">
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-4 border-t border-gray-100">
            <span className="text-xs text-[#9ca3af]">{filteredUsers.length} de {users.length} usuários</span>
          </div>
        </div>
      </div>
    </div>
  );
}