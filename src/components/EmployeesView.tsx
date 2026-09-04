'use client';

import React, { useState } from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import { Users, Plus, DollarSign, Calendar, ShieldCheck } from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const { employees, advances, addAdvance, totalLaborMonth, laborCostPercentage } = useGastronomy();
  const [showModal, setShowModal] = useState(false);

  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const emp = employees.find(e => e.id === employeeId) || employees[0];

    addAdvance({
      employeeId: emp.id,
      employeeName: emp.name,
      date: new Date().toISOString().split('T')[0],
      amount: parseFloat(amount),
      notes
    });

    setAmount('');
    setNotes('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Personal, Sueldos y Adelantos (Labor Cost)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manten la nómina de empleados bajo control y registra vales/adelantos de quincena.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          + Registrar Adelanto de Sueldo
        </button>
      </div>

      {/* KPI Labor Cost */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Costo Laboral Total (Mes)</div>
            <div className="text-2xl font-black text-white mt-1">${totalLaborMonth.toLocaleString('es-AR')}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Labor Cost %</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{laborCostPercentage.toFixed(1)}%</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Adelantos Entregados (Mes)</div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              ${advances.reduce((acc, a) => acc + a.amount, 0).toLocaleString('es-AR')}
            </div>
          </div>
          <div className="text-xs text-slate-400 text-right">
            {advances.length} adelantos otorgados
          </div>
        </div>
      </div>

      {/* Lista de Empleados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Nómina de Personal</h3>
          <span className="text-xs text-slate-400">{employees.length} empleados activos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Puesto</th>
                <th className="p-3">Modalidad</th>
                <th className="p-3">Sueldo Base</th>
                <th className="p-3">Adelantos Acum.</th>
                <th className="p-3">Saldo a Liquidar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {employees.map(emp => {
                const empAdv = advances.filter(a => a.employeeId === emp.id).reduce((acc, a) => acc + a.amount, 0);
                const netToPay = emp.baseSalary - empAdv;
                return (
                  <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white whitespace-nowrap">{emp.name}</td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded text-[10px]">
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{emp.paymentType}</td>
                    <td className="p-3 text-slate-200 font-medium">${emp.baseSalary.toLocaleString('es-AR')}</td>
                    <td className="p-3 text-rose-400 font-medium">-${empAdv.toLocaleString('es-AR')}</td>
                    <td className="p-3 text-emerald-400 font-bold">${netToPay.toLocaleString('es-AR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Adelanto */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Adelanto / Vale</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleAddAdvance} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Empleado</label>
                <select
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Monto del Adelanto ($)</label>
                <input
                  type="number"
                  placeholder="30000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Motivo / Notas</label>
                <input
                  type="text"
                  placeholder="Adelanto de quincena por emergencia personal"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Guardar Adelanto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
