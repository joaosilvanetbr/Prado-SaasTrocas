'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CheckIcon, WarningIcon } from '@/components/icons';
import { updatePasswordAction, updateCurrentUserProfileAction } from '@/app/actions/users.actions';

interface UserData {
  id: number;
  nome: string;
  roles: string[];
  setores: number[];
}

interface PerfilContentProps {
  user: UserData;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

function PerfilContent({ user, onShowToast }: PerfilContentProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user.nome);

  const handleSave = async () => {
    if (!name.trim()) {
      onShowToast('Nome é obrigatório.', 'error');
      return;
    }
    if (name.length > 100) {
      onShowToast('Nome deve ter no máximo 100 caracteres.', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const result = await updateCurrentUserProfileAction({ nome: name.trim() });
      if (result.error) {
        onShowToast(result.error, 'error');
      } else {
        onShowToast('Perfil atualizado com sucesso.');
      }
    } catch {
      onShowToast('Erro ao atualizar perfil.', 'error');
    }
    setSaving(false);
  };

  return (
    <Card variant="default" className="overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-[#1f2937]">Detalhes do Perfil</h2>
        <p className="text-sm text-[#6b7280] mt-1">Atualize as informações do seu perfil público.</p>
      </div>
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#1e40af] overflow-hidden flex-shrink-0 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{user.nome.slice(0, 2).toUpperCase()}</span>
          </div>
          <div>
            <Button size="sm" disabled>Alterar Foto</Button>
            <p className="text-xs text-[#9ca3af] mt-2">JPG, GIF ou PNG. Máximo de 2MB.</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white border border-gray-200 text-[#1f2937] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">Nome de Usuário</label>
            <input type="text" value={user.nome} disabled className="w-full bg-gray-50 border border-gray-200 text-[#6b7280] rounded-md px-3 py-2.5 text-sm cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">Cargo</label>
            <input type="text" value={user.roles.join(', ')} disabled className="w-full bg-gray-50 border border-gray-200 text-[#6b7280] rounded-md px-3 py-2.5 text-sm cursor-not-allowed" />
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <Button onClick={handleSave} disabled={saving} loading={saving}>
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </Card>
  );
}

function SegurancaContent({ user, onShowToast }: PerfilContentProps) {
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleSave = async () => {
    if (passwords.new !== passwords.confirm) {
      onShowToast('As senhas não coincidem.', 'error');
      return;
    }
    if (passwords.new.length > 0 && passwords.new.length < 6) {
      onShowToast('A nova senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }
    setSaving(true);
    try {
      const result = await updatePasswordAction(user.id, passwords.current, passwords.new);
      if (result.error) {
        onShowToast(result.error, 'error');
      } else {
        setPasswords({ current: '', new: '', confirm: '' });
        onShowToast('Senha atualizada com sucesso.');
      }
    } catch {
      onShowToast('Erro ao atualizar senha.', 'error');
    }
    setSaving(false);
  };

  return (
    <Card variant="default" className="overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-[#1f2937]">Segurança e Acesso</h2>
        <p className="text-sm text-[#6b7280] mt-1">Gerencie sua senha e configurações de segurança.</p>
      </div>
      <div className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">Senha Atual</label>
          <input
            type="password"
            value={passwords.current}
            onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
            placeholder="••••••••"
            className="w-full bg-white border border-gray-200 text-[#1f2937] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">Nova Senha</label>
          <input
            type="password"
            value={passwords.new}
            onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
            placeholder="••••••••"
            className="w-full bg-white border border-gray-200 text-[#1f2937] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">Confirmar Nova Senha</label>
          <input
            type="password"
            value={passwords.confirm}
            onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
            placeholder="••••••••"
            className="w-full bg-white border border-gray-200 text-[#1f2937] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 transition-colors"
          />
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <Button onClick={handleSave} disabled={saving} loading={saving}>
          {saving ? 'Salvando...' : 'Atualizar Senha'}
        </Button>
      </div>
    </Card>
  );
}

export default function ConfiguracoesClient({ user }: { user: UserData }) {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);
  const [fadeKey, setFadeKey] = useState(0);
  const [activeSection, setActiveSection] = useState<'perfil' | 'seguranca'>('perfil');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSectionChange = (section: 'perfil' | 'seguranca') => {
    setActiveSection(section);
    setFadeKey(k => k + 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {toasts.map(toast => (
        <div key={toast.id} className={`fixed bottom-4 right-4 bg-white rounded-lg px-4 py-3 flex items-center gap-3 animate-scale-in z-50 border shadow-lg ${toast.type === 'success' ? 'border-green-400' : 'border-red-400'}`}>
          {toast.type === 'success' ? <CheckIcon className="text-green-600" /> : <WarningIcon className="text-red-600" />}
          <span className="text-[#1f2937] text-sm font-medium">{toast.message}</span>
        </div>
      ))}

      <div className="h-20 border-b border-gray-200 flex items-center px-8 bg-white">
        <h1 className="text-[26px] font-bold text-[#1f2937] tracking-wide uppercase">
          Configurações
        </h1>
      </div>

      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 space-y-1">
            <button
              onClick={() => handleSectionChange('perfil')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-3 ${
                activeSection === 'perfil'
                  ? 'bg-[#ffff00] text-[#999900] border-l-4 border-[#1e40af]'
                  : 'text-[#6b7280] hover:bg-gray-50 hover:translate-x-0.5 border-l-4 border-transparent'
              }`}
            >
              <span>👤</span>
              <span>Perfil da Conta</span>
            </button>
            <button
              onClick={() => handleSectionChange('seguranca')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-3 ${
                activeSection === 'seguranca'
                  ? 'bg-[#ffff00] text-[#999900] border-l-4 border-[#1e40af]'
                  : 'text-[#6b7280] hover:bg-gray-50 hover:translate-x-0.5 border-l-4 border-transparent'
              }`}
            >
              <span>🔒</span>
              <span>Segurança e Acesso</span>
            </button>
          </div>

          <div key={fadeKey} className="col-span-3">
            {activeSection === 'perfil' && <PerfilContent user={user} onShowToast={showToast} />}
            {activeSection === 'seguranca' && <SegurancaContent user={user} onShowToast={showToast} />}
          </div>
        </div>
      </div>
    </div>
  );
}