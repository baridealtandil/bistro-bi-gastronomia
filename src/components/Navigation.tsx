'use client';

import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Truck,
  Receipt,
  CheckSquare,
  Building2,
  Wallet,
  Users,
  UtensilsCrossed,
  Sparkles,
  Webhook
} from 'lucide-react';
import { useGastronomy } from '../context/GastronomyContext';

export type TabType =
  | 'dashboard'
  | 'ventas'
  | 'compras'
  | 'gastos'
  | 'cheques'
  | 'bancos'
  | 'empleados'
  | 'platos'
  | 'ia'
  | 'make';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { role } = useGastronomy();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard BI', icon: LayoutDashboard, adminOnly: true },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp, adminOnly: false },
    { id: 'compras', label: 'Proveedores', icon: Truck, adminOnly: false },
    { id: 'gastos', label: 'Pagos', icon: Receipt, adminOnly: false },
    { id: 'cheques', label: 'Cheques', icon: CheckSquare, adminOnly: false },
    { id: 'bancos', label: 'Bancos', icon: Building2, adminOnly: false },
    { id: 'empleados', label: 'Empleados', icon: Users, adminOnly: true },
    { id: 'ia', label: 'Asistente IA', icon: Sparkles, adminOnly: false },
    { id: 'make', label: 'Integración Make', icon: Webhook, adminOnly: true },
  ];

  const visibleItems = navItems.filter(item => !item.adminOnly || role === 'ADMIN');

  return (
    <>
      {/* Sidebar para Escritorio / Tablet */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-1 shrink-0">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Menú de Navegación
        </div>

        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.id === 'ia' && (
                <span className="ml-auto text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-md font-bold">
                  IA
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* Bar de Navegación Inferior para Teléfonos Móviles */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-50 px-2 py-1.5 flex justify-around items-center overflow-x-auto">
        {visibleItems.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-all ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
