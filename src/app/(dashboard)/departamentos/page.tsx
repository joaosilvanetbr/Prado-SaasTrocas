'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/format';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { PlusIcon, EditIcon, DeleteIcon, CheckIcon } from '@/components/icons';
interface Setor {
  id: number;
  nome: string;
  meta: number;
  comprador: string;
  ativo: boolean;
}

const MOCK_COMPRADORES = [
  'Fernando Pinto',
  'Ana Souza',
  'Ricardo Lima',
  'Patrícia Moura',
];

const INITIAL_SETORES: Setor[] = [
  { id: 1, nome: 'Açougue',   meta: 15000, comprador: 'Fernando Pinto', ativo: true },
  { id: 2, nome: 'Bebidas',   meta: 8000,  comprador: 'Ana Souza',       ativo: true },
  { id: 3, nome: 'Petshop',   meta: 5000,  comprador: 'Ricardo Lima',    ativo: true },
  { id: 4, nome: 'Higiene',   meta: 4000,  comprador: 'Fernando Pinto',  ativo: true },
  { id: 5, nome: 'Mercearia', meta: 13000, comprador: 'Patrícia Moura',  ativo: true },
];

const EMPTY_FORM = { nome: '', meta: '', comprador: '' };

export default function DepartamentosPage() {
  const [setores, setSetores] = useState<Setor[]>(INITIAL_SETORES);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(setor: Setor) {
    setForm({ nome: setor.nome, meta: String(setor.meta), comprador: setor.comprador });
    setEditingId(setor.id);
    setShowForm(true);
  }

  function handleSave() {
    if (!form.nome.trim() || !form.meta) return;
    const metaNum = parseFloat(form.meta);
    if (isNaN(metaNum) || metaNum <= 0) return;

    if (editingId !== null) {
      setSetores(prev =>
        prev.map(s => s.id === editingId
          ? { ...s, nome: form.nome, meta: metaNum, comprador: form.comprador }
          : s
        )
      );
    } else {
      const newId = Math.max(...setores.map(s => s.id), 0) + 1;
      setSetores(prev => [...prev, { id: newId, nome: form.nome, meta: metaNum, comprador: form.comprador, ativo: true }]);
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleToggleAtivo(id: number) {
    setSetores(prev => prev.map(s => s.id === id ? { ...s, ativo: !s.ativo } : s));
  }

  function confirmDelete() {
    if (deleteId !== null) {
      setSetores(prev => prev.filter(s => s.id !== deleteId));
      setDeleteId(null);
    }
  }

  const totalMeta = setores.filter(s => s.ativo).reduce((a, s) => a + s.meta, 0);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-20 border-b border-gray-200 flex items-center justify-between px-8 bg-white">
        <div>
          <h1 className="text-[22px] font-bold text-[#1f2937] tracking-wide uppercase leading-tight">
            Departamentos & Metas
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
            <p className="text-4xl font-bold text-[#1f2937]">{setores.filter(s => s.ativo).length}</p>
          </Card>
          <Card variant="default">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Meta Global Diária</h3>
            <p className="text-2xl font-bold text-[#1e40af]">{formatCurrency(totalMeta)}</p>
          </Card>
          <Card variant="default">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Compradores Vinculados</h3>
            <p className="text-4xl font-bold text-[#1f2937]">
              {new Set(setores.map(s => s.comprador).filter(Boolean)).size}
            </p>
          </Card>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-[#1f2937]">Lista de Departamentos</h2>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-[#6b7280] text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Departamento</th>
                <th className="px-6 py-4">Meta Diária</th>
                <th className="px-6 py-4">Comprador Responsável</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {setores.map((setor) => (
                <tr key={setor.id} className={`transition-colors ${setor.ativo ? 'hover:bg-gray-50' : 'opacity-50'}`}>
                  <td className="px-6 py-4 font-semibold text-[#1f2937]">{setor.nome}</td>
                  <td className="px-6 py-4 text-[#1e40af] font-bold">{formatCurrency(setor.meta)}</td>
                  <td className="px-6 py-4 text-[#6b7280]">
                    {setor.comprador || <span className="italic text-[#9ca3af]">Não atribuído</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {setor.ativo
                      ? <Badge variant="success" size="sm">Ativo</Badge>
                      : <Badge variant="info" size="sm">Inativo</Badge>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(setor)} title="Editar" className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-[#6b7280] hover:text-[#1e40af] hover:border-[#1e40af] transition-colors">
                        <EditIcon />
                      </button>
                      <button onClick={() => handleToggleAtivo(setor.id)} title={setor.ativo ? 'Desativar' : 'Ativar'} className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-[#6b7280] hover:text-[#ffcc00] hover:border-[#ffcc00] transition-colors">
                        {setor.ativo
                          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="6"/><circle cx="16" cy="12" r="2" fill="currentColor"/></svg>
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="6"/><circle cx="8" cy="12" r="2" fill="currentColor"/></svg>
                        }
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
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Meta Diária (R$) *</label>
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
                value={form.comprador}
                onChange={e => setForm(f => ({ ...f, comprador: e.target.value }))}
                className="w-full bg-white border border-gray-300 hover:border-[#1e40af] focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 text-[#1f2937] rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
              >
                <option value="">Selecionar comprador...</option>
                {MOCK_COMPRADORES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.nome.trim() || !form.meta}>
              {editingId ? 'Salvar Alterações' : 'Criar Departamento'}
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
            <p className="text-sm text-[#6b7280] mb-6">Esta ação não pode ser desfeita. O histórico de lançamentos deste setor será preservado.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" className="flex-1" onClick={confirmDelete}>Excluir</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}