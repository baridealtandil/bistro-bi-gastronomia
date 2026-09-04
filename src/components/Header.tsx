'use client';

import React from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import { Utensils, Shield, User, Bell, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenAiChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAiChat }) => {
  const { role, setRole, pendingChecksAmount7Days, pendingServicesAmount } = useGastronomy();
  const alertCount = (pendingChecksAmount7Days > 0 ? 1 : 0) + (pendingServicesAmount > 0 ? 1 : 0);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Title */}
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500 p-2 rounded-xl text-slate-950 font-bold flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg md:text-xl tracking-tight flex items-center gap-2">
              Bistró BI <span className="text-xs bg-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">Complemento POS</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Gestión Financiera, Cheques e IA para Gastronomía</p>
          </div>
        </div>

        {/* Right Actions & Role Switcher */}
        <div className="flex items-center space-x-3">
          {/* AI Quick Button */}
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="hidden md:inline">Consultar a la</span> IA
          </button>

          {/* Alert Badge */}
          <div className="relative hidden sm:block">
            <div className="p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl">
              <Bell className="w-4 h-4" />
            </div>
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </div>

          {/* Role Toggle Switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setRole('ADMIN')}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                role === 'ADMIN'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Acceso total a finanzas, sueldos y configuración"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
            <button
              onClick={() => setRole('COLLABORATOR')}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                role === 'COLLABORATOR'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Carga rápida de datos sin métricas sensibles"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Colaborador</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
