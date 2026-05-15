'use client';

import React, { useState, useMemo } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon, CheckIcon, WarningIcon } from '@/components/icons';
import { useUsers } from '@/hooks/useUsers';

interface Setor {
  id: number;
  nome: string;
}

interface User {
  id: number;
  nome: string;
  role: string;
  setores: string;
  created_at: Date | null;
}

interface UsuariosClientProps {
  currentUserId: number;
  currentUserNome: string;
  sectorsList: Setor[];
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  comprador: 'Comprador',
};

export default function UsuariosClient({ currentUserId, currentUserNome, sectorsList }: UsuariosClientProps) {
  const { users, isLoading, isError, createUser, updateUser, deleteUser, isCreating, isUpdating, isDeleting } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

  // Form state
  const [form, setForm] = useState({
    nome: '',
    password: '',
    role: 'comprador',
    setores: [] as string[],
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // Calculate summary cards
  const totalUsuarios = users.length;
  const admins = users.filter(u => u.role === 'admin').length;
  const gerentes = users.filter(u => u.role === 'gerente').length;
  const compradores = users.filter(u => u.role === 'comprador').length;

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(u => u.nome.toLowerCase().includes(term));
  }, [users, searchTerm]);

  // Get sector names from IDs
  const getSetoresDisplay = (setoresStr: string): string => {
    if (!setoresStr || setoresStr.trim() === '') return 'Todos';
    const ids = setoresStr.split(',').filter(Boolean).map(s => s.trim());
    if (ids.length === 0) return 'Todos';
    const names = ids.map(id => {
      const setor = sectorsList.find(s => s.id === parseInt(id));
      return setor ? setor.nome : id;
    });
    return names.join(', ');
  };

  // Format date
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Open new user form
  function openNew() {
    setForm({ nome: '', password: '', role: 'comprador', setores: [] });
    setEditingUser(null);
    setShowForm(true);
  }

  // Open edit user form
  function openEdit(user: User) {
    const setoresArray = user.setores ? user.setores.split(',').filter(Boolean) : [];
    setForm({
      nome: user.nome,
      password: '',
      role: user.role,
      setores: setoresArray,
    });
    setEditingUser(user);
    setShowForm(true);
  }

  // Handle form submit
  async function handleSave() {
    if (!form.nome.trim()) {
      showToast('Nome é obrigatório.', 'error');
      return;
    }
    if (!editingUser && !form.password) {
      showToast('Senha é obrigatória.', 'error');
      return;
    }
    if (form.password && form.password.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nome', form.nome.trim());
      formData.append('role', form.role);
      formData.append('setores', form.setores.join(','));

      if (!editingUser) {
        formData.append('password', form.password);
        await createUser(formData);
      } else {
        await updateUser({
          id: editingUser.id,
          data: {
            nome: form.nome.trim(),
            role: form.role,
            setores: form.setores.join(','),
          },
        });
      }

      setShowForm(false);
      setEditingUser(null);
      setForm({ nome: '', password: '', role: 'comprador', setores: [] });
      showToast(editingUser ? 'Usuário atualizado com sucesso.' : 'Usuário criado com sucesso.');
    } catch (error) {
      showToast('Erro ao salvar usuário.', 'error');
    }
  }

  // Handle delete
  async function handleDelete() {
    if (deleteUserId === null) return;
    setDeleteError(null);

    try {
      await deleteUser(deleteUserId);
      setDeleteUserId(null);
      showToast('Usuário excluído com sucesso.');
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      if (errMsg.includes('vínculado') || errMsg.includes('excluir')) {
        setDeleteError(errMsg);
      } else {
        setDeleteUserId(null);
        showToast('Erro ao excluir usuário.', 'error');
      }
    }
  }

  // Toggle sector selection
  function toggleSetor(setorId: string) {
    setForm(f => {
      const current = f.setores;
      if (current.includes(setorId)) {
        return { ...f, setores: current.filter(id => id !== setorId) };
      } else {
        return { ...f, setores: [...current, setorId] };
      }
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Toast notifications */}
      {toasts.map(toast => (
        <div key={toast.id} className={`fixed bottom-4 right-4 bg-white rounded-lg px-4 py-3 flex items-center gap-3 animate-scale-in z-50 border shadow-lg ${toast.type === 'success' ? 'border-green-400' : 'border-red-400'}`}>
          {toast.type === 'success' ? <CheckIcon className="text-green-600" /> : <WarningIcon className="text-red-600" />}
          <span className="text-[#1f2937] text-sm font-medium">{toast.message}</span>
        </div>
      ))}

      {/* Header */}
      <div className="h-20 border-b border-gray-200 flex items-center justify-between px-8 bg-white">
        <div>
          <h1 className="text-[22px] font-bold text-[#1f2937] tracking-wide uppercase leading-tight">
            Gestão de Usuários
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">Gerencie acessos, cargos e setores permitidos</p>
        </div>
        <Button onClick={openNew} leftIcon={<PlusIcon />}>Novo Usuário</Button>
      </div>

      <div className="flex-1 p-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-5">
          <Card variant="default">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Total de Usuários</h3>
            <p className="text-4xl font-bold text-[#1f2937]">{totalUsuarios}</p>
          </Card>
          <Card variant="default">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Administradores</h3>
            <p className="text-4xl font-bold text-[#1e40af]">{admins}</p>
          </Card>
          <Card variant="default">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Gerentes</h3>
            <p className="text-4xl font-bold text-[#1f2937]">{gerentes}</p>
          </Card>
          <Card variant="default">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Compradores</h3>
            <p className="text-4xl font-bold text-[#1f2937]">{compradores}</p>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 text-[#1f2937] rounded-lg pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 transition-colors"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-[#1f2937]">Lista de Usuários</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-[#6b7280]">Carregando...</div>
          ) : isError ? (
            <div className="p-8 text-center text-red-600">Erro ao carregar usuários.</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-[#6b7280]">
              {searchTerm ? 'Nenhum usuário encontrado.' : 'Nenhum usuário cadastrado.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[#6b7280] text-xs uppercase font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">Cargo</th>
                    <th className="px-6 py-4">Setores Permitidos</th>
                    <th className="px-6 py-4">Criado em</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#1f2937]">{user.nome}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'gerente' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#6b7280]">{getSetoresDisplay(user.setores)}</td>
                      <td className="px-6 py-4 text-[#6b7280]">{formatDate(user.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(user)}
                            title="Editar"
                            className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-[#6b7280] hover:text-[#1e40af] hover:border-[#1e40af] transition-colors"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => { setDeleteUserId(user.id); setDeleteError(null); }}
                            title="Excluir"
                            disabled={user.id === currentUserId}
                            className={`w-8 h-8 rounded border flex items-center justify-center transition-colors ${
                              user.id === currentUserId
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                : 'border-gray-300 text-[#6b7280] hover:text-red-600 hover:border-red-400'
                            }`}
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={() => { setShowForm(false); setEditingUser(null); }}
          title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
          size="md"
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Nome *</label>
              <input
                type="text"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                placeholder="Nome completo do usuário"
                className="w-full bg-white border border-gray-300 hover:border-[#1e40af] focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 text-[#1f2937] placeholder-[#9ca3af] rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
              />
            </div>
            {!editingUser && (
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Senha *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-white border border-gray-300 hover:border-[#1e40af] focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 text-[#1f2937] placeholder-[#9ca3af] rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Cargo *</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full bg-white border border-gray-300 hover:border-[#1e40af] focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 text-[#1f2937] rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
              >
                <option value="admin">Administrador</option>
                <option value="gerente">Gerente</option>
                <option value="comprador">Comprador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Setores Permitidos</label>
              <p className="text-xs text-[#6b7280] mb-2">Selecione os setores que este usuário pode acessar (deixe vazio para todos)</p>
              {sectorsList.length === 0 ? (
                <p className="text-sm text-[#9ca3af] italic">Nenhum setor cadastrado</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {sectorsList.map(setor => (
                    <label key={setor.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={form.setores.includes(setor.id.toString())}
                        onChange={() => toggleSetor(setor.id.toString())}
                        className="w-4 h-4 text-[#1e40af] border-gray-300 rounded focus:ring-[#1e40af]"
                      />
                      <span className="text-sm text-[#374151]">{setor.nome}</span>
                    </label>
                  ))}
                </div>
              )}
              {form.setores.length > 0 && (
                <p className="text-xs text-[#6b7280] mt-2">
                  Setores selecionados: {form.setores.map(id => sectorsList.find(s => s.id === parseInt(id))?.nome || id).join(', ')}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="secondary" onClick={() => { setShowForm(false); setEditingUser(null); }}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isCreating || isUpdating || !form.nome.trim() || (!editingUser && !form.password)}
              loading={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? 'Salvando...' : editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUserId !== null && (
        <Modal
          isOpen={deleteUserId !== null}
          onClose={() => { setDeleteUserId(null); setDeleteError(null); }}
          size="sm"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DeleteIcon className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-[#1f2937] mb-2">Excluir Usuário?</h3>
            <p className="text-sm text-[#6b7280] mb-4">Tem certeza que deseja excluir este usuário? Essa ação não poderá ser desfeita.</p>
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => { setDeleteUserId(null); setDeleteError(null); }}>
                Cancelar
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleDelete} loading={isDeleting}>
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}