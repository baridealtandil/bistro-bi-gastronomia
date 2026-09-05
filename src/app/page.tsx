'use client';

import React, { useState } from 'react';
import { GastronomyProvider } from '../context/GastronomyContext';
import { Header } from '../components/Header';
import { Navigation, TabType } from '../components/Navigation';
import { DashboardView } from '../components/DashboardView';
import { SalesView } from '../components/SalesView';
import { SuppliersView } from '../components/SuppliersView';
import { ExpensesView } from '../components/ExpensesView';
import { ChecksView } from '../components/ChecksView';
import { BankAccountsView } from '../components/BankAccountsView';
import { InitialBalancesView } from '../components/InitialBalancesView';
import { EmployeesView } from '../components/EmployeesView';
import { DishesView } from '../components/DishesView';
import { AiChatView } from '../components/AiChatView';
import { MakeIntegrationView } from '../components/MakeIntegrationView';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      <Header onOpenAiChat={() => setActiveTab('ia')} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === 'ventas' && <SalesView />}
          {activeTab === 'compras' && <SuppliersView />}
          {activeTab === 'gastos' && <ExpensesView />}
          {activeTab === 'cheques' && <ChecksView />}
          {activeTab === 'bancos' && <BankAccountsView />}
          {activeTab === 'saldos' && <InitialBalancesView />}
          {activeTab === 'empleados' && <EmployeesView />}
          {activeTab === 'ia' && <AiChatView />}
          {activeTab === 'make' && <MakeIntegrationView />}
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
