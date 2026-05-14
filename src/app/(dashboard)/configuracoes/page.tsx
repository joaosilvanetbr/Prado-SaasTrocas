'use client';

import { useState, useEffect } from 'react';

type Section = 'perfil' | 'seguranca' | 'notificacoes' | 'preferencias';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const menuItems = [
  { id: 'perfil' as Section, label: 'Perfil da Conta', icon: '👤' },
  { id: 'seguranca' as Section, label: 'Segurança e Acesso', icon: '🔒' },
  { id: 'notificacoes' as Section, label: 'Notificações', icon: '🔔' },
  { id: 'preferencias' as Section, label: 'Preferências do Sistema', icon: '⚙️' },
];

function ToastNotification({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg px-4 py-3 flex items-center gap-3 animate-scale-in z-50 border shadow-lg ${
      toast.type === 'success' ? 'border-green-400' : 'border-red-400'
    }`}>
      {toast.type === 'success' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
      )}
      <span className="text-[#1f2937] text-sm font-medium">{toast.message}</span>
    </div>
  );
}

function PerfilContent({ showToast }: { showToast: (msg: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('Carlos Silva');

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    showToast('Perfil atualizado com sucesso.');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-fade-in">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-[#1f2937]">Detalhes do Perfil</h2>
        <p className="text-sm text-[#6b7280] mt-1">Atualize as informações do seu perfil público.</p>
      </div>
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#1e40af] overflow-hidden flex-shrink-0 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <div>
            <button className="px-4 py-2 text-sm font-medium bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-lg transition-all active:scale-95">Mudar Foto</button>
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
            <input type="text" defaultValue="Carlos Silva" disabled className="w-full bg-gray-50 border border-gray-200 text-[#6b7280] rounded-md px-3 py-2.5 text-sm cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">E-mail</label>
            <input type="email" defaultValue="carlos.silva@exchange.inc" disabled className="w-full bg-gray-50 border border-gray-200 text-[#6b7280] rounded-md px-3 py-2.5 text-sm cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">Cargo</label>
            <input type="text" defaultValue="Admin - Gestor de Operações" disabled className="w-full bg-gray-50 border border-gray-200 text-[#6b7280] rounded-md px-3 py-2.5 text-sm cursor-not-allowed" />
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-medium bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-lg transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Salvando...
            </>
          ) : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}

function SegurancaContent({ showToast }: { showToast: (msg: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleSave = async () => {
    if (passwords.new !== passwords.confirm) {
      showToast('As senhas não coincidem.');
      return;
    }
    if (passwords.new.length > 0 && passwords.new.length < 6) {
      showToast('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setPasswords({ current: '', new: '', confirm: '' });
    showToast('Senha atualizada com sucesso.');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-fade-in">
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

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-[#1f2937]">Autenticação em dois fatores</p>
              <p className="text-sm text-[#6b7280]">Adicione uma camada extra de segurança à sua conta.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6b7280]">{twoFA ? 'Ativado' : 'Desativado'}</span>
              <button
                onClick={() => setTwoFA(v => !v)}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${twoFA ? 'bg-[#1e40af]' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-all duration-200 ${twoFA ? 'left-[22px]' : 'left-0.5'}`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-medium bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-lg transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Salvando...
            </>
          ) : 'Atualizar Senha'}
        </button>
      </div>
    </div>
  );
}

function NotificacoesContent({ showToast }: { showToast: (msg: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    relatorioDiario: true,
    alertasMeta: true,
    novosUsuarios: false,
    alteracoesSistema: true,
  });

  const toggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    showToast('Preferências de notificação salvas.');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-fade-in">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-[#1f2937]">Notificações</h2>
        <p className="text-sm text-[#6b7280] mt-1">Escolha como deseja receber alertas e atualizações.</p>
      </div>
      <div className="p-6 space-y-4">
        {[
          { key: 'email' as const, label: 'Notificações por E-mail', desc: 'Receba atualizações importantes por e-mail.' },
          { key: 'relatorioDiario' as const, label: 'Relatório Diário', desc: 'Resumo diário do desempenho dos setores.' },
          { key: 'alertasMeta' as const, label: 'Alertas de Meta', desc: 'Notifique quando setores atingirem 90% da meta.' },
          { key: 'novosUsuarios' as const, label: 'Novos Usuários', desc: 'Alerte quando novos usuários forem criados.' },
          { key: 'alteracoesSistema' as const, label: 'Alterações no Sistema', desc: 'Notifique sobre atualizações e manutenções.' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
            <div>
              <p className="font-medium text-[#1f2937]">{label}</p>
              <p className="text-sm text-[#6b7280]">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${notifications[key] ? 'bg-[#1e40af]' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-all duration-200 ${notifications[key] ? 'left-[22px]' : 'left-0.5'}`}></div>
            </button>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-medium bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-lg transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Salvando...
            </>
          ) : 'Salvar Preferências'}
        </button>
      </div>
    </div>
  );
}

function PreferenciasContent({ showToast }: { showToast: (msg: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    tema: 'sistema',
    idioma: 'pt-BR',
    formatoData: 'dd/MM/yyyy',
    timezone: 'America/Sao_Paulo',
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    showToast('Preferências salvas.');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-fade-in">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-[#1f2937]">Preferências do Sistema</h2>
        <p className="text-sm text-[#6b7280] mt-1">Personalize a aparência e o comportamento do sistema.</p>
      </div>
      <div className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">Tema da Interface</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'claro', label: 'Claro' },
              { value: 'escuro', label: 'Escuro' },
              { value: 'sistema', label: 'Automático' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPreferences(p => ({ ...p, tema: value }))}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  preferences.tema === value
                    ? 'border-[#1e40af] bg-[#1e40af]/5 text-[#1e40af] shadow-sm'
                    : 'border-gray-200 text-[#6b7280] hover:border-gray-300 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">Idioma</label>
          <select
            value={preferences.idioma}
            onChange={e => setPreferences(p => ({ ...p, idioma: e.target.value }))}
            className="w-full bg-white border border-gray-200 text-[#1f2937] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] transition-colors"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es">Español</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">Formato de Data</label>
          <select
            value={preferences.formatoData}
            onChange={e => setPreferences(p => ({ ...p, formatoData: e.target.value }))}
            className="w-full bg-white border border-gray-200 text-[#1f2937] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] transition-colors"
          >
            <option value="dd/MM/yyyy">DD/MM/AAAA</option>
            <option value="MM/dd/yyyy">MM/DD/AAAA</option>
            <option value="yyyy-MM-dd">AAAA-MM-DD (ISO)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">Fuso Horário</label>
          <select
            value={preferences.timezone}
            onChange={e => setPreferences(p => ({ ...p, timezone: e.target.value }))}
            className="w-full bg-white border border-gray-200 text-[#1f2937] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] transition-colors"
          >
            <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
            <option value="America/New_York">Nova York (GMT-5)</option>
            <option value="UTC">UTC (GMT+0)</option>
          </select>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-medium bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-lg transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Salvando...
            </>
          ) : 'Salvar Preferências'}
        </button>
      </div>
    </div>
  );
}

export default function ConfiguracoesPage() {
  const [activeSection, setActiveSection] = useState<Section>('perfil');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [fadeKey, setFadeKey] = useState(0);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    setFadeKey(k => k + 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {toasts.map(toast => (
        <ToastNotification key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}

      <div className="h-20 border-b border-gray-200 flex items-center px-8 bg-white">
        <h1 className="text-[26px] font-bold text-[#1f2937] tracking-wide uppercase">
          Configurações
        </h1>
      </div>

      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-3 ${
                  activeSection === item.id
                    ? 'bg-[#ffff00] text-[#999900] border-l-4 border-[#1e40af]'
                    : 'text-[#6b7280] hover:bg-gray-50 hover:translate-x-0.5 border-l-4 border-transparent'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div key={fadeKey} className="col-span-3">
            {activeSection === 'perfil' && <PerfilContent showToast={showToast} />}
            {activeSection === 'seguranca' && <SegurancaContent showToast={showToast} />}
            {activeSection === 'notificacoes' && <NotificacoesContent showToast={showToast} />}
            {activeSection === 'preferencias' && <PreferenciasContent showToast={showToast} />}
          </div>
        </div>
      </div>
    </div>
  );
}