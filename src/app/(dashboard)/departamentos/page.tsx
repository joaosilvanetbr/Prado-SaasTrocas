'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/format';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { PlusIcon, EditIcon, DeleteIcon, CheckIcon } from '@/components/icons';
import { useSectors } from '@/hooks/useSectors';

interface Setor {
  id: number;
  nome: string;
  comprador_id: number | null;
  created_at?: Date;
}

export default function DepartamentosPage() {
  const { sectors, isLoading, isError, createSector, updateSector, deleteSector, isCreating, isUpdating, isDeleting } = useSectors();
  const [form, setForm] = useState({ nome: '', meta: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  function openNew() {
    setForm({ nome: '', meta: '' });
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(setor: Setor) {
    setForm({ nome: setor.nome, meta: '' });
    setEditingId(setor.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.nome.trim()) return;

    const formData = new FormData();
    formData.append('nome', form.nome.trim());
    if (form.meta) formData.append('meta', form.meta);

    try {
      if (editingId !== null) {
        await updateSector({ id: editingId, data: { nome: form.nome.trim() } });
      } else {
        await createSector(formData);
      }
      setForm({ nome: '', meta: '' });
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
    try {
      await deleteSector(deleteId);
      setDeleteId(null);
    } catch {
    }
  }

  const totalMeta = sectors.length * 10000;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-20 border-b border-gray-200 flex items-center justify-between px-8 bg-white">
        <div>
          <h1 className="text-[22px] font-bold text-[#1f2937] tracking-wide uppercase leading-tight">
            Departamentos
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">Gerencie os setores e configure as metas diárias.</p>
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
        <div className="grid grid-cols-3 gap-5">
          <Card variant="default">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Departamentos Ativos</h3>
            <p className="text-4xl font-bold text-[#1f2937]">{sectors.length}</p>
          </Card>
          <Card variant="default">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Meta Global Diária</h3>
            <p className="text-2xl font-bold text-[#1e40af]">{formatCurrency(totalMeta)}</p>
          </Card>
          <Card variant="default">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Compradores Vinculados</h3>
            <p className="text-4xl font-bold text-[#1f2937]">-</p>
          </Card>
        </div>

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
            <table className="w-full text-sm text-left">
              <thead className="text-[#6b7280] text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Departamento</th>
                  <th className="px-6 py-4">ID Comprador</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sectors.map((setor) => (
                  <tr key={setor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#1f2937]">{setor.nome}</td>
                    <td className="px-6 py-4 text-[#6b7280]">
                      {setor.comprador_id || <span className="italic text-[#9ca3af]">Não atribuído</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(setor)} title="Editar" className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-[#6b7280] hover:text-[#1e40af] hover:border-[#1e40af] transition-colors">
                          <EditIcon />
                        </button>
                        <button onClick={() => setDeleteId(setor.id)} title="Excluir" className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-[#6b7280] hover:text-red-600 hover:border-red-400 transition-colors">
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={editingId ? 'Editar Departamento' : 'Novo Departamento'}
          size="md"
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Nome do Departamento *</label>
              <input
                type="text"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                placeholder="ex: Açougue, Padaria, Hortifruti..."
                className="w-full bg-white border border-gray-300 hover:border-[#1e40af] focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 text-[#1f2937] placeholder-[#9ca3af] rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
              />
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

      {deleteId !== null && (
        <Modal
          isOpen={deleteId !== null}
          onClose={() => setDeleteId(null)}
          size="sm"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DeleteIcon className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-[#1f2937] mb-2">Excluir Departamento?</h3>
            <p className="text-sm text-[#6b7280] mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" className="flex-1" onClick={handleDelete} loading={isDeleting}>Excluir</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}