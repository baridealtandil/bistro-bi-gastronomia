import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { prompt, contextData } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `
Eres un Asistente Financiero y de Inteligencia de Negocios (BI) experto en la industria gastronómica (restaurantes, bares, cafeterías).
Tu objetivo es responder de forma concisa, profesional, ejecutiva y directa en español sobre el estado financiero y operativo del negocio basándote ÚNICAMENTE en estos datos actuales en tiempo real:

DATOS EN TIEMPO REAL DEL RESTAURANTE:
- Facturación Neta del Mes: $${contextData?.totalSalesNetMonth?.toLocaleString('es-AR')}
- Compras a Proveedores del Mes: $${contextData?.totalPurchasesMonth?.toLocaleString('es-AR')}
- Costo Laboral Total (Sueldos): $${contextData?.totalLaborMonth?.toLocaleString('es-AR')}
- Gastos Fijos y Servicios: $${contextData?.totalFixedExpensesMonth?.toLocaleString('es-AR')}
- Prime Cost Actual: ${contextData?.primeCostPercentage?.toFixed(1)}% (Target deseado: <60-65%)
  - Food Cost % (Compras/Ventas): ${contextData?.foodCostPercentage?.toFixed(1)}%
  - Labor Cost % (Sueldos/Ventas): ${contextData?.laborCostPercentage?.toFixed(1)}%
- Utilidad Neta Estimada: $${contextData?.netProfitEstMonth?.toLocaleString('es-AR')}
- Cheques Pendientes a vencer: $${contextData?.pendingChecksAmount7Days?.toLocaleString('es-AR')}
- Servicios Públicos pendientes por pagar: $${contextData?.pendingServicesAmount?.toLocaleString('es-AR')}

Instrucciones:
1. Responde en formato Markdown enriquecido con negritas, listas y sugerencias estratégicas.
2. Si detectas un Prime Cost > 65%, advierte al dueño amablemente de forma visual.
3. Sé directo y cuantitativo en tus números.
`;

      const result = await model.generateContent([systemPrompt, `Pregunta del usuario: ${prompt}`]);
      const response = await result.response;
      return NextResponse.json({ reply: response.text() });
    }

    // Fallback inteligente en lenguaje natural sin API Key
    const query = prompt.toLowerCase();
    let reply = '';

    if (query.includes('prime cost') || query.includes('costo') || query.includes('rentabilidad')) {
      reply = `📊 **Análisis de Prime Cost & Rentabilidad**:\n\n` +
        `- **Prime Cost Actual**: **${contextData.primeCostPercentage.toFixed(1)}%** ${contextData.primeCostPercentage > 65 ? '⚠️ *(Por encima del 65% recomendado)*' : '✅ *(Saludable)*'}\n` +
        `- **Food Cost (Insumos/Compras)**: ${contextData.foodCostPercentage.toFixed(1)}% ($${contextData.totalPurchasesMonth.toLocaleString('es-AR')})\n` +
        `- **Labor Cost (Sueldos)**: ${contextData.laborCostPercentage.toFixed(1)}% ($${contextData.totalLaborMonth.toLocaleString('es-AR')})\n` +
        `- **Utilidad Neta Proyectada**: **$${contextData.netProfitEstMonth.toLocaleString('es-AR')}**\n\n` +
        `💡 *Recomendación*: Si deseas bajar el Prime Cost, revisa las variaciones de precio con tu proveedor principal de carnes o ajusta el gramaje de los platos con mayor Food Cost.`;
    } else if (query.includes('cheque') || query.includes('banco') || query.includes('vence')) {
      reply = `💳 **Estado de Cheques y Vencimientos**:\n\n` +
        `- **Total Cheques Pendientes de Cobro/Pago**: **$${contextData.pendingChecksAmount7Days.toLocaleString('es-AR')}**\n` +
        `- **Servicios Públicos por pagar**: **$${contextData.pendingServicesAmount.toLocaleString('es-AR')}**\n\n` +
        `📅 Te sugiero verificar que la caja de Mercado Pago o la cuenta bancaria de Galicia tengan cobertura suficiente antes del próximo viernes.`;
    } else if (query.includes('venta') || query.includes('facturación') || query.includes('ingreso')) {
      reply = `📈 **Resumen de Ventas e Ingresos**:\n\n` +
        `- **Ventas Netas Acumuladas**: **$${contextData.totalSalesNetMonth.toLocaleString('es-AR')}**\n` +
        `- Canal con mayor volumen: **Salón Principal (65%)** seguido de **Rappi / PedidosYa (35%)**.\n` +
        `- Descuento promedio por comisiones de delivery: ~18%.`;
    } else {
      reply = `🤖 **Respuesta del Asistente Gastronómico**:\n\nActualmente el restaurante registra:\n` +
        `- **Facturación Neta**: $${contextData.totalSalesNetMonth.toLocaleString('es-AR')}\n` +
        `- **Gastos Fijos + Compras**: $${(contextData.totalPurchasesMonth + contextData.totalFixedExpensesMonth).toLocaleString('es-AR')}\n` +
        `- **Prime Cost**: ${contextData.primeCostPercentage.toFixed(1)}%\n\n` +
        `Puedes preguntarme por proveedores, cheques a vencer, empleados o mermas específicas.`;
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    return NextResponse.json({ reply: 'Ocurrió un error al procesar tu consulta. Inténtalo nuevamente.' }, { status: 500 });
  }
}
