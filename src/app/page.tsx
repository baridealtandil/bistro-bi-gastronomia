'use client';

import React, { useState, useEffect } from 'react';
import { GastronomyProvider, useGastronomy } from '../context/GastronomyContext';
import { Header } from '../components/Header';
import { Navigation, TabType, COLAB_ALLOWED_TABS } from '../components/Navigation';
import { DashboardView } from '../components/DashboardView';
import { SalesView } from '../components/SalesView';
import { SuppliersView } from '../components/SuppliersView';
import { ExpensesView } from '../components/ExpensesView';
import { ChecksView } from '../components/ChecksView';
import { BankAccountsView } from '../components/BankAccountsView';
import { EmployeesView } from '../components/EmployeesView';
import { SociosView } from '../components/SociosView';
import { DishesView } from '../components/DishesView';
import { AiChatView } from '../components/AiChatView';
import { MakeIntegrationView } from '../components/MakeIntegrationView';
import { PinLoginModal } from '../components/PinLoginModal';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { loginRole } = useGastronomy();
  const isColabLogin = loginRole === 'colab';

  // Si entró con el login "colab", no puede quedarse en una pestaña fuera de
  // Ventas/Proveedores (por ejemplo si ya tenía otra pestaña activa de una
  // sesión anterior, o mientras se lee la cookie recién montado el componente).
  useEffect(() => {
    if (isColabLogin && !COLAB_ALLOWED_TABS.includes(activeTab)) {
      setActiveTab('ventas');
    }
  }, [isColabLogin, activeTab]);

  const canShow = (tab: TabType) => !isColabLogin || COLAB_ALLOWED_TABS.includes(tab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      <PinLoginModal />
      <Header onOpenAiChat={() => setActiveTab('ia')} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && canShow('dashboard') && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === 'ventas' && <SalesView />}
          {activeTab === 'compras' && <SuppliersView />}
          {activeTab === 'gastos' && canShow('gastos') && <ExpensesView />}
          {activeTab === 'cheques' && canShow('cheques') && <ChecksView />}
          {activeTab === 'bancos' && canShow('bancos') && <BankAccountsView />}
          {activeTab === 'empleados' && canShow('empleados') && <EmployeesView />}
          {activeTab === 'socios' && canShow('socios') && <SociosView />}
          {activeTab === 'ia' && canShow('ia') && <AiChatView />}
          {activeTab === 'make' && canShow('make') && <MakeIntegrationView />}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <GastronomyProvider>
      <MainAppContent />
    </GastronomyProvider>
  );
}
