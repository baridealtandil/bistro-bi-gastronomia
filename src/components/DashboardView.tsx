'use client';

import React from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  PieChart as PieIcon,
  Calendar,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    totalSalesNetMonth,
    totalPurchasesMonth,
    totalLaborMonth,
    primeCostPercentage,
    foodCostPercentage,
    laborCostPercentage,
    netProfitEstMonth,
    pendingChecksAmount7Days,
    pendingServicesAmount,
    sales,
    purchases
  } = useGastronomy();

  // Datos agrupados por canal para gráfico de torta
  const channelData = sales.reduce((acc: any, s) => {
    const existing = acc.find((item: any) => item.name === s.channel);
    if (existing) {
      existing.value += s.netAmount;
    } else {
      acc.push({ name: s.channel, value: s.netAmount });
    }
    return acc;
  }, []);

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'];

  // Datos para gráfico comparativo
  const comparisonData = [
    { name: 'Ventas Netas', monto: totalSalesNetMonth },
    { name: 'Compras Insumos', monto: totalPurchasesMonth },
    { name: 'Costo Laboral', monto: totalLaborMonth },
    { name: 'Utilidad Est.', monto: netProfitEstMonth > 0 ? netProfitEstMonth : 0 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Saludo y Resumen rápido */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Tablero de Control Gastronómico (BI)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Métricas clave cruzadas en tiempo real para optimizar margen de ganancia.
          </p>
        </div>
        <button
          onClick={() => onNavigate('ia')}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-xs"
        >
          <Sparkles className="w-4 h-4" />
          Hacer consulta financiera a la IA
        </button>
      </div>

      {/* Alerta de Salud Financiera (Prime Cost) */}
      {primeCostPercentage > 65 ? (
        <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-2xl flex items-start gap-3 text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-sm block text-rose-300">Alerta de Prime Cost Elevado ({primeCostPercentage.toFixed(1)}%)</span>
            Tu costo conjunto de materia prima ({foodCostPercentage.toFixed(1)}%) y sueldos ({laborCostPercentage.toFixed(1)}%) supera el 65% recomendado para gastronomía. Revisa precios de proveedores o ajusta escandallos.
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/30 border border-emerald-800/50 p-4 rounded-2xl flex items-center gap-3 text-emerald-200">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-sm block text-emerald-300">Prime Cost Saludable ({primeCostPercentage.toFixed(1)}%)</span>
            Los costos operativos principales están dentro del rango óptimo (&lt;65%).
          </div>
        </div>
      )}

      {/* Grilla de KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Facturación Neta */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Facturación Neta (Mes)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            ${totalSalesNetMonth.toLocaleString('es-AR')}
          </div>
          <div className="text-[10px] text-slate-400">Descontadas comisiones POS</div>
        </div>

        {/* KPI 2: Prime Cost % */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Prime Cost Total</span>
            <PieIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-xl md:text-2xl font-black ${primeCostPercentage > 65 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {primeCostPercentage.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400">
            Food Cost: {foodCostPercentage.toFixed(1)}% | Labor: {laborCostPercentage.toFixed(1)}%
          </div>
        </div>

        {/* KPI 3: Utilidad Neta Est. */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Utilidad Neta Est.</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            ${netProfitEstMonth.toLocaleString('es-AR')}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold">
            {totalSalesNetMonth > 0 ? ((netProfitEstMonth / totalSalesNetMonth) * 100).toFixed(1) : 0}% margen neto
          </div>
        </div>

        {/* KPI 4: Cheques a Vencer */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Cheques Pendientes</span>
            <Calendar className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-amber-400">
            ${pendingChecksAmount7Days.toLocaleString('es-AR')}
          </div>
          <div className="text-[10px] text-slate-400">Por cobrar o debitar en 7 días</div>
        </div>
      </div>

      {/* Sección de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Estructura Financiera */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Estructura de Ingresos vs Costos</span>
            <span className="text-xs font-normal text-slate-400">Mes Actual</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString('es-AR')}`, 'Monto']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                />
                <Bar dataKey="monto" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Ventas por Canal */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Distribución de Ventas por Canal</span>
            <span className="text-xs font-normal text-slate-400">POS / Delivery</span>
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {channelData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString('es-AR')}`, 'Venta']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Accesos rápidos a modulos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('ventas')}
          className="p-3 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all"
        >
          <div className="text-xs font-semibold text-white flex items-center justify-between">
            + Cargar Venta <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Registrar cierre de turno o día</div>
        </button>

        <button
          onClick={() => onNavigate('compras')}
          className="p-3 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all"
        >
          <div className="text-xs font-semibold text-white flex items-center justify-between">
            + Cargar Factura <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Ingresar compra de insumos u OCR</div>
        </button>

        <button
          onClick={() => onNavigate('cheques')}
          className="p-3 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all"
        >
          <div className="text-xs font-semibold text-white flex items-center justify-between">
            Chequera <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Verificar vencimientos cercanos</div>
        </button>

        <button
          onClick={() => onNavigate('make')}
          className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition-all"
        >
          <div className="text-xs font-semibold text-indigo-300 flex items-center justify-between">
            Sync Fudo/MaxiRest <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Importar CSV o Webhook Make</div>
        </button>
      </div>
    </div>
  );
};
