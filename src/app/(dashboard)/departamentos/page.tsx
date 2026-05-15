'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/format';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { PlusIcon, EditIcon, DeleteIcon, CheckIcon } from '@/components/icons';
import { useSectors } from '@/hooks/useSectors';

interface Setor {
  id: number;
  nome: string;
  meta: number;
  comprador_id: number | null;
  created_at?: Date | null;
}

interface Comprador {
  id: number;
  nome: string;
}

export default function DepartamentosPage() {
  const { sectors, compradores, isLoading, isError, createSector, updateSector, deleteSector, isCreating, isUpdating, isDeleting } = useSectors();
  const [form, setForm] = useState({ nome: '', meta: '', comprador_id: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Calculate summary cards
  const totalDepartamentos = sectors.length;
  const metaGlobal = sectors.reduce((a, s) => a + (s.meta || 0), 0);
  const uniqueCompradores = new Set(sectors.filter(s => s.comprador_id !== null).map(s => s.comprador_id)).size;
  const mediaMeta = totalDepartamentos > 0 ? metaGlobal / totalDepartamentos : 0;

  // Get comprador name by id
  const getCompradorName = (compradorId: number | null): string => {
    if (!compradorId) return 'Não vinculado';
    const comprador = compradores.find(c => c.id === compradorId);
    return comprador?.nome || 'Não vinculado';
  };

  // Format date
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  function openNew() {
    setForm({ nome: '', meta: '', comprador_id: '' });
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(setor: Setor) {
    setForm({
      nome: setor.nome,
      meta: String(setor.meta || ''),
      comprador_id: setor.comprador_id ? String(setor.comprador_id) : '',
    });
    setEditingId(setor.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.nome.trim()) return;

    const formData = new FormData();
    formData.append('nome', form.nome.trim());
    formData.append('meta', form.meta || '0');
    if (form.comprador_id) {
      formData.append('comprador_id', form.comprador_id);
    }

    try {
      if (editingId !== null) {
        const updateData: Record<string, unknown> = {
          nome: form.nome.trim(),
          meta: parseFloat(form.meta) || 0,
        };
        if (form.comprador_id) {
          updateData.comprador_id = parseInt(form.comprador_id);
        } else {
          updateData.comprador_id = null;
        }
        await updateSector({ id: editingId, data: updateData });
      } else {
        await createSector(formData);
      }
      setForm({ nome: '', meta: '', comprador_id: '' });
      setEditingId(null);
      setShowForm(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(false);
    }
  }

  async function handleDelete() {
    if (deleteId === null) return;
    setDeleteError(null);
    try {
      await deleteSector(deleteId);
      setDeleteId(null);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      if (errMsg.includes('lançamentos vinculados')) {
        setDeleteError(errMsg);
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-20 border-b border-gray-200 flex items-center justify-between px-8 bg-white">
        <div>
          <h1 className="text-[22px] font-bold text-[#1f2937] tracking-wide uppercase leading-tight">
            Departamentos
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">Gerencie setores, metas e compradores responsáveis</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs text-[#16a34a] flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <CheckIcon /> Salvo com sucesso
            </span>
          )}
          <Button onClick={openNew} leftIcon={<PlusIcon />}>Novo Departamento</Button>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-5">
          <Card variant="default">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Total de Departamentos</h3>
            <p className="text-4xl font-bold text-[#1f2937]">{totalDepartamentos}</p>
          </Card>
          <Card variant="default">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Meta Global Diária</h3>
            <p className="text-2xl font-bold text-[#1e40af]">{formatCurrency(metaGlobal)}</p>
          </Card>
          <Card variant="default">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Compradores Vinculados</h3>
            <p className="text-4xl font-bold text-[#1f2937]">{uniqueCompradores}</p>
          </Card>
          <Card variant="default">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Média de Meta por Dept.</h3>
            <p className="text-2xl font-bold text-[#1e40af]">{formatCurrency(mediaMeta)}</p>
          </Card>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-[#1f2937]">Lista de Departamentos</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-[#6b7280]">Carregando...</div>
          ) : isError ? (
            <div className="p-8 text-center text-red-600">Erro ao carregar departamentos.</div>
          ) : sectors.length === 0 ? (
            <div className="p-8 text-center text-[#6b7280]">Nenhum departamento cadastrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[#6b7280] text-xs uppercase font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Departamento</th>
                    <th className="px-6 py-4">Meta (Limite)</th>
                    <th className="px-6 py-4">Comprador Responsável</th>
                    <th className="px-6 py-4">Criado em</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sectors.map((setor) => (
                    <tr key={setor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#1f2937]">{setor.nome}</td>
                      <td className="px-6 py-4 text-[#1e40af]">{formatCurrency(setor.meta || 0)}</td>
                      <td className="px-6 py-4 text-[#6b7280]">{getCompradorName(setor.comprador_id)}</td>
                      <td className="px-6 py-4 text-[#6b7280]">{formatDate(setor.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(setor)} title="Editar" className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-[#6b7280] hover:text-[#1e40af] hover:border-[#1e40af] transition-colors">
                            <EditIcon />
                          </button>
                          <button onClick={() => { setDeleteId(setor.id); setDeleteError(null); }} title="Excluir" className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-[#6b7280] hover:text-red-600 hover:border-red-400 transition-colors">
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
          onClose={() => setShowForm(false)}
          title={editingId ? 'Editar Departamento' : 'Novo Departamento'}
          size="md"
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Nome *</label>
              <input
                type="text"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                placeholder="ex: Açougue, Padaria, Hortifruti..."
                className="w-full bg-white border border-gray-300 hover:border-[#1e40af] focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 text-[#1f2937] placeholder-[#9ca3af] rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Meta (Limite) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] text-sm">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.meta}
                  onChange={e => setForm(f => ({ ...f, meta: e.target.value }))}
                  placeholder="0,00"
                  className="w-full bg-white border border-gray-300 hover:border-[#1e40af] focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 text-[#1f2937] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Comprador Responsável</label>
              <select
                value={form.comprador_id}
                onChange={e => setForm(f => ({ ...f, comprador_id: e.target.value }))}
                className="w-full bg-white border border-gray-300 hover:border-[#1e40af] focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 text-[#1f2937] rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
              >
                <option value="">Selecione um comprador (opcional)</option>
                {compradores.map((c: Comprador) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              {compradores.length === 0 && (
                <p className="text-xs text-[#9ca3af] mt-1">Nenhum comprador cadastrado</p>
              )}
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.nome.trim() || isCreating || isUpdating}>
              {isCreating || isUpdating ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Criar Departamento'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <Modal
          isOpen={deleteId !== null}
          onClose={() => { setDeleteId(null); setDeleteError(null); }}
          size="sm"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DeleteIcon className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-[#1f2937] mb-2">Excluir Departamento?</h3>
            <p className="text-sm text-[#6b7280] mb-4">Tem certeza que deseja excluir este departamento? Essa ação pode afetar relatórios vinculados.</p>
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => { setDeleteId(null); setDeleteError(null); }}>Cancelar</Button>
              <Button variant="danger" className="flex-1" onClick={handleDelete} loading={isDeleting}>Excluir</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}