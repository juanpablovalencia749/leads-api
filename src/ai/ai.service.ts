import { Injectable, Logger } from '@nestjs/common';
import { Lead } from '@prisma/client';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async generateSummary(
    leads: Lead[],
    filter: { fuente?: string; fechaInicio?: string; fechaFin?: string },
  ): Promise<{
    resumen: string;
    modo: 'real' | 'mock';
    filtrosAplicados: object;
  }> {
    const filtrosAplicados = {
      fuente: filter.fuente ?? 'todas',
      fechaInicio: filter.fechaInicio ?? null,
      fechaFin: filter.fechaFin ?? null,
    };

    if (process.env.OPENAI_API_KEY) {
      return this.callOpenAi(leads, filtrosAplicados);
    }

    this.logger.warn(
      'OPENAI_API_KEY no configurada — retornando resumen mock documentado.',
    );
    return this.buildMockSummary(leads, filtrosAplicados);
  }

  private async callOpenAi(leads: Lead[], filtros: object) {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = this.buildPrompt(leads, filtros);

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Eres un analista de marketing digital. Genera resúmenes ejecutivos breves, accionables y en español.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
    });

    const resumen =
      response.choices[0]?.message?.content ?? 'Sin respuesta del LLM';
    return { resumen, modo: 'real' as const, filtrosAplicados: filtros };
  }

  private buildMockSummary(leads: Lead[], filtros: object) {
    const total = leads.length;

    if (total === 0) {
      return {
        resumen:
          '[MOCK] No se encontraron leads con los filtros aplicados. ' +
          'Considera ampliar el rango de fechas o verificar el canal de origen.',
        modo: 'mock' as const,
        filtrosAplicados: filtros,
      };
    }

    const fuenteCount: Record<string, number> = {};
    let presupuestoTotal = 0;
    let conPresupuesto = 0;

    for (const lead of leads) {
      fuenteCount[lead.fuente] = (fuenteCount[lead.fuente] ?? 0) + 1;
      if (lead.presupuesto !== null) {
        presupuestoTotal += lead.presupuesto;
        conPresupuesto++;
      }
    }

    const fuentePrincipal = Object.entries(fuenteCount).sort(
      (a, b) => b[1] - a[1],
    )[0];
    const promedio =
      conPresupuesto > 0
        ? (presupuestoTotal / conPresupuesto).toFixed(2)
        : 'N/A';

    const resumen =
      `[MOCK - Activar con OPENAI_API_KEY] ` +
      `📊 Resumen ejecutivo de ${total} lead(s) analizado(s).\n\n` +
      `🔍 Análisis general: Se identificaron leads provenientes de ${Object.keys(fuenteCount).length} canal(es) distintos.\n\n` +
      `📣 Fuente principal: "${fuentePrincipal[0]}" con ${fuentePrincipal[1]} lead(s) ` +
      `(${((fuentePrincipal[1] / total) * 100).toFixed(1)}% del total).\n\n` +
      `💰 Presupuesto promedio: $${promedio} USD.\n\n` +
      `✅ Recomendaciones:\n` +
      `  1. Priorizar seguimiento de leads de "${fuentePrincipal[0]}" dado su alto volumen.\n` +
      `  2. Identificar leads sin presupuesto definido y calificarlos activamente.\n` +
      `  3. Configurar OPENAI_API_KEY para obtener análisis de IA real y personalizado.`;

    return { resumen, modo: 'mock' as const, filtrosAplicados: filtros };
  }

  private buildPrompt(leads: Lead[], filtros: object): string {
    const resumen = leads.map((l) => ({
      nombre: l.nombre,
      fuente: l.fuente,
      producto: l.productoInteres,
      presupuesto: l.presupuesto,
    }));

    return (
      `Analiza estos ${leads.length} leads de marketing:\n` +
      JSON.stringify(resumen, null, 2) +
      `\n\nFiltros aplicados: ${JSON.stringify(filtros)}` +
      `\n\nGenera un resumen ejecutivo de 3 párrafos: análisis general, fuente principal y recomendaciones accionables.`
    );
  }
}
