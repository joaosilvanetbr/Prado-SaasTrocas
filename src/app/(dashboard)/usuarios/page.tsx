'use client';

import React, { useState, useCallback } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { SpinnerIcon, CheckIcon, WarningIcon, EditIcon, DeleteIcon, PlusIcon, SearchIcon } from '@/components/icons';

interface Setor {
  id: number;
  nome: string;
}

interface User {
  id: number;
  initials: string;
  name: string;
  roles: string[];
  setores: number[];
  lastAccess: string;
  status: 'Ativo' | 'Inativo';
}

const SHARED_SETORES: Setor[] = [
  { id: 1, nome: 'Açougue' },
  { id: 2, nome: 'Bebidas' },
  { id: 3, nome: 'Petshop' },
  { id: 4, nome: 'Higiene' },
  { id: 5, nome: 'Mercearia' },
  { id: 6, nome: 'Padaria' },
  { id: 7, nome: 'Hortifruti' },
];

const ALL_ROLES = [
  { value: 'admin', label: 'Admin', color: 'text-[#7c3aed] bg-purple-100 border-purple-200' },
  { value: 'gerente', label: 'Gerente', color: 'text-[#0369a1] bg-sky-100 border-sky-200' },
  { value: 'comprador', label: 'Comprador', color: 'text-[#b39800] bg-[#ffff00] border-[#ffcc00]/30' },
];

const INITIAL_USERS: User[] = [
  { id: 1, initials: 'CS', name: 'Carlos Silva',   roles: ['admin'],                   setores: [],       lastAccess: 'Hoje, 08:30',  status: 'Ativo'   },
  { id: 2, initials: 'MR', name: 'Mariana Rocha',  roles: ['gerente'],                 setores: [1, 2],   lastAccess: 'Ontem, 17:45', status: 'Ativo'   },
  { id: 3, initials: 'FP', name: 'Fernando Pinto', roles: ['comprador'],               setores: [1, 4],   lastAccess: '12/05/2024',   status: 'Inativo' },
  { id: 4, initials: 'AS', name: 'Ana Souza',      roles: ['comprador'],               setores: [1, 4],   lastAccess: 'Hoje, 07:15',  status: 'Ativo'   },
  { id: 5, initials: 'RL', name: 'Ricardo Lima',  roles: ['comprador'],               setores: [3],      lastAccess: 'Ontem, 09:00', status: 'Ativo'   },
  { id: 6, initials: 'PM', name: 'Patrícia Moura', roles: ['gerente', 'comprador'],   setores: [2, 5],   lastAccess: 'Ontem, 16:00', status: 'Ativo'   },
];

interface UserForm {
  name: string;
  password: string;
  roles: string[];
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
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; index: number | null; name: string }>({ show: false, index: null, name: '' });
  const [formModal, setFormModal] = useState<{ show: boolean; mode: 'create' | 'edit'; index: number | null }>({ show: false, mode: 'create', index: null });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UserForm>({ name: '', password: '', roles: [], setores: [], status: true });
  const [errors, setErrors] = useState<Partial<Record<keyof UserForm, string>>>({});

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const getRolesLabel = (roles: string[]) => {
    return roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(' / ');
  };

  const getRolesColor = (roles: string[]) => {
    if (roles.includes('admin')) return 'text-[#7c3aed] bg-purple-100 border-purple-200';
    if (roles.includes('gerente') && roles.length === 1) return 'text-[#0369a1] bg-sky-100 border-sky-200';
    return 'text-[#b39800] bg-[#ffff00] border-[#ffcc00]/30';
  };

  const toggleStatus = async (index: number) => {
    setLoadingIndex(index);
    await new Promise(r => setTimeout(r, 500));
    setUsers(prev => prev.map((u, i) =>
      i === index ? { ...u, status: u.status === 'Ativo' ? 'Inativo' : 'Ativo' } : u
    ));
    setLoadingIndex(null);
    const user = users[index];
    showToast(`${user.name} ${user.status === 'Ativo' ? 'inativado' : 'ativado'}.`);
  };

  const confirmDelete = (index: number) => {
    const user = users[index];
    setDeleteModal({ show: true, index, name: user.name });
  };

  const executeDelete = () => {
    if (deleteModal.index !== null) {
      const userName = users[deleteModal.index].name;
      setUsers(prev => prev.filter((_, i) => i !== deleteModal.index));
      showToast(`${userName} excluído.`);
    }
    setDeleteModal({ show: false, index: null, name: '' });
  };

  const openCreate = () => {
    setForm({ name: '', password: '', roles: [], setores: [], status: true });
    setErrors({});
    setFormModal({ show: true, mode: 'create', index: null });
  };

  const openEdit = (index: number) => {
    const u = users[index];
    setForm({
      name: u.name,
      password: '',
      roles: [...u.roles],
      setores: [...u.setores],
      status: u.status === 'Ativo',
    });
    setErrors({});
    setFormModal({ show: true, mode: 'edit', index });
  };

  const closeModal = () => {
    if (saving) return;
    setFormModal({ show: false, mode: 'create', index: null });
  };

  const toggleRole = (role: string) => {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(role)
        ? f.roles.filter(r => r !== role)
        : [...f.roles, role],
    }));
    setErrors(e => ({ ...e, roles: undefined }));
  };

  const toggleSetor = (setorId: number) => {
    setForm(f => ({
      ...f,
      setores: f.setores.includes(setorId)
        ? f.setores.filter(s => s !== setorId)
        : [...f.setores, setorId],
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof UserForm, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (formModal.mode === 'create' && !form.password.trim()) newErrors.password = 'Senha é obrigatória';
    if (form.roles.length === 0) newErrors.roles = 'Selecione pelo menos um cargo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));

    if (formModal.mode === 'edit' && formModal.index !== null) {
      setUsers(prev => prev.map((u, i) => {
        if (i !== formModal.index) return u;
        return { ...u, name: form.name.trim(), roles: [...form.roles], setores: [...form.setores], status: form.status ? 'Ativo' : 'Inativo' };
      }));
      showToast(`${form.name.trim()} atualizado.`);
    } else {
      const parts = form.name.trim().split(' ');
      const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : form.name.slice(0, 2).toUpperCase();
      const newUser: User = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        initials,
        name: form.name.trim(),
        roles: [...form.roles],
        setores: [...form.setores],
        lastAccess: 'Nunca',
        status: form.status ? 'Ativo' : 'Inativo',
      };
      setUsers(prev => [newUser, ...prev]);
      showToast(`${form.name.trim()} criado.`);
    }

    setSaving(false);
    setFormModal({ show: false, mode: 'create', index: null });
  };

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
            <p className="text-[#374151] mb-6">Excluir <span className="font-semibold">{deleteModal.name}</span>?</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal({ show: false, index: null, name: '' })}>Cancelar</Button>
              <Button variant="danger" className="flex-1" onClick={executeDelete}>Excluir</Button>
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
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(err => ({ ...err, name: undefined })); }}
                  placeholder="Ex: João Silva"
                  className={`w-full bg-white border ${errors.name ? 'border-red-400' : 'border-gray-200'} text-[#1f2937] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 transition-colors`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
                <label className="block text-sm font-medium text-[#374151] mb-2">Cargos <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  {ALL_ROLES.map(r => {
                    const selected = form.roles.includes(r.value);
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => toggleRole(r.value)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${selected ? `${r.color} ring-2 ring-[#1e40af]/30` : 'border-gray-200 text-[#6b7280] hover:border-gray-300 hover:scale-105 active:scale-95'}`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
                {errors.roles && <p className="text-red-500 text-xs mt-1">{errors.roles}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Setores</label>
                <div className="flex flex-wrap gap-2">
                  {SHARED_SETORES.map(s => {
                    const selected = form.setores.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSetor(s.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${selected ? 'border-[#1e40af] bg-[#1e40af]/5 text-[#1e40af]' : 'border-gray-200 text-[#6b7280] hover:border-gray-300 hover:scale-105 active:scale-95'}`}
                      >
                        {s.nome}
                      </button>
                    );
                  })}
                </div>
                {form.setores.length === 0 && <p className="text-xs text-[#9ca3af] mt-1">Nenhum setor selecionado = acesso a todos os setores</p>}
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-[#1f2937] text-sm">Status</p>
                  <p className="text-xs text-[#6b7280]">{form.status ? 'Usuário ativo' : 'Usuário inativo'}</p>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, status: !f.status }))}
                  className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${form.status ? 'bg-[#1e40af]' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-all duration-200 ${form.status ? 'left-[22px]' : 'left-0.5'}`}></div>
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={closeModal} disabled={saving}>Cancelar</Button>
              <Button variant="primary" className="flex-1" onClick={handleSave} disabled={saving} loading={saving}>
                {saving ? 'Salvando...' : formModal.mode === 'edit' ? 'Salvar' : 'Criar Usuário'}
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
                <th className="px-6 py-4">Cargos</th>
                <th className="px-6 py-4">Setores</th>
                <th className="px-6 py-4">Último Acesso</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user, idx) => {
                const setorNames = user.setores.length > 0
                  ? user.setores.map(id => SHARED_SETORES.find(s => s.id === id)?.nome).filter(Boolean).join(', ')
                  : 'Todos';
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors opacity-0 animate-fade-in" style={{ animationDelay: `${idx * 0.03}s`, animationFillMode: 'forwards' }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1e40af] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {user.initials}
                        </div>
                        <span className="text-[#1f2937] font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getRolesColor(user.roles)}`}>
                        {getRolesLabel(user.roles)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#6b7280] text-xs max-w-[140px]">{setorNames}</td>
                    <td className="px-6 py-4 text-[#6b7280] text-xs">{user.lastAccess}</td>
                    <td className="px-6 py-4 text-center">
                      {loadingIndex === idx ? (
                        <div className="flex items-center justify-center"><SpinnerIcon /></div>
                      ) : user.status === 'Ativo' ? (
                        <Badge variant="success" size="sm">Ativo</Badge>
                      ) : (
                        <Badge variant="info" size="sm">Inativo</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title={user.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                          onClick={() => toggleStatus(idx)}
                          disabled={loadingIndex === idx}
                          className={`w-7 h-7 rounded border flex items-center justify-center transition-colors ${
                            loadingIndex === idx
                              ? 'opacity-50 cursor-not-allowed'
                              : user.status === 'Ativo'
                                ? 'border-amber-300 text-amber-600 hover:bg-amber-50'
                                : 'border-green-300 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {loadingIndex === idx ? (
                            <SpinnerIcon />
                          ) : user.status === 'Ativo' ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
                          ) : (
                            <CheckIcon className="text-green-600" />
                          )}
                        </button>
                        <button onClick={() => openEdit(idx)} title="Editar" className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-[#6b7280] hover:text-[#1f2937] hover:border-[#1e40af] transition-colors">
                          <EditIcon />
                        </button>
                        <button onClick={() => confirmDelete(idx)} title="Excluir" className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-[#6b7280] hover:text-red-600 hover:border-red-400 transition-colors">
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