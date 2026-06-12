import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AnalysisType } from './dto/ai.dto';
import { dateToLocalString } from '../common/utils/date.utils';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genai: GoogleGenAI;
  private readonly model = 'gemini-3.5-flash';
  private readonly timeoutMs = 30000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY no configurada. El módulo IA no funcionará.');
    }
    this.genai = new GoogleGenAI({ apiKey: apiKey ?? '' });
  }

  async analyze(googleId: string, type: AnalysisType, userQuestion?: string): Promise<string> {
    const context = await this.buildUserContext(googleId);

    const systemPrompt = `Actúas como un entrenador personal certificado y experto en biomecánica, hipertrofia y fuerza.
      Tu objetivo es analizar datos reales de entrenamiento y armar recomendaciones basadas en evidencia científica (volumen recuperable, frecuencia, intensidad, progresión de cargas, deloads).
      Si el usuario pide algo que arriesgue su salud, advertilo claramente y sugerí alternativas seguras.
      Respondé siempre en español latinoamericano neutro, con tono amigable y motivador.
      No inventes datos que no estén en el contexto proporcionado.

      Cuando el usuario pida una rutina o plan de entrenamiento, devolvé la respuesta estrictamente en formato JSON con estas llaves:
      { "rutina": [ { "dia": "string", "ejercicio": "string", "series": number, "repeticiones": number, "consejo_tecnico": "string" } ] }
      Si no pide rutina, respondé en texto normal. Si no hay suficiente contexto para dar una respuesta precisa, pedí más información amablemente.`;

    const userPrompt = userQuestion
      ? `${userQuestion}\n\nContexto del usuario:\n${context}`
      : this.buildPromptByType(type, context);

    try {
      const start = Date.now();
      const response = await this.withTimeout(
        this.genai.models.generateContent({
          model: this.model,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            maxOutputTokens: 4096,
            temperature: 0.7,
          },
        }),
        this.timeoutMs,
      );
      const elapsed = Date.now() - start;
      const text = response.text ?? '';

      this.logger.log(`[AI] type=${type} user=${googleId} elapsed=${elapsed}ms chars=${text.length}`);

      return text;
    } catch (err) {
      this.logger.error(`[AI] Error generando contenido: ${err.message}`, err.stack);
      if (err.message?.includes('quota') || err.message?.includes('rate limit')) {
        throw new ServiceUnavailableException('Cuota de IA excedida. Intentá más tarde.');
      }
      if (err.message?.includes('timeout')) {
        throw new ServiceUnavailableException('El servicio de IA está tardando demasiado. Intentá de nuevo.');
      }
      throw new ServiceUnavailableException('Error al contactar el servicio de IA. Intentá más tarde.');
    }
  }

  async chat(googleId: string, message: string): Promise<string> {
    return this.analyze(googleId, AnalysisType.GENERAL, message);
  }

  private buildPromptByType(type: AnalysisType, context: string): string {
    const prompts: Record<AnalysisType, string> = {
      [AnalysisType.GENERAL]: `Hacé un análisis general de mi entrenamiento de las últimas 4 semanas. Identificá fortalezas, debilidades y oportunidades de mejora.\n\n${context}`,
      [AnalysisType.PROGRESS]: `Analizá mi progreso de fuerza en cada ejercicio. ¿Dónde estoy estancado? ¿Dónde estoy progresando bien? Sugerí estrategias de progresión de cargas.\n\n${context}`,
      [AnalysisType.VOLUME]: `Analizá el volumen de entrenamiento por grupo muscular y decime si hay desequilibrios (ej: mucho pecho y poca espalda). Recomendá ajustes.\n\n${context}`,
      [AnalysisType.RECOVERY]: `Analizá mi frecuencia de entrenamiento, duración de sesiones y patrones de descanso. ¿Estoy descansando lo suficiente? ¿Hay riesgo de sobreentrenamiento?\n\n${context}`,
      [AnalysisType.ROUTINE]: `Armame una rutina de entrenamiento semanal basada en mi historial, perfil y objetivos. Incluí ejercicios, series, repeticiones y progresión. Devolvé JSON si es posible.\n\n${context}`,
      [AnalysisType.TECHNIQUE]: `Revisá mi historial de ejercicios e identificá si hay patrones que sugieran problemas técnicos (ej: peso estancado con muchas reps, o reps muy bajas con peso alto). Dá consejos de técnica.\n\n${context}`,
    };
    return prompts[type];
  }

  private async buildUserContext(googleId: string): Promise<string> {
    const user = await this.usersService.findByGoogleId(googleId);
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const [workouts, stats, prs, bodyMetrics] = await Promise.all([
      this.prisma.workout.findMany({
        where: {
          userId: user.id,
          date: { gte: fourWeeksAgo },
          status: 'COMPLETED',
        },
        include: {
          sets: {
            include: { exercise: true },
            where: { isWarmup: false },
          },
        },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      this.prisma.set.groupBy({
        by: ['exerciseId'],
        where: {
          workout: { userId: user.id, date: { gte: fourWeeksAgo } },
          isWarmup: false,
        },
        _sum: { volume: true },
        _count: { _all: true },
        _max: { weightKg: true, oneRepMax: true },
      }),
      this.prisma.set.findMany({
        where: {
          workout: { userId: user.id },
          isPR: true,
          isWarmup: false,
        },
        include: { exercise: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.bodyMetric.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);

    const lines: string[] = [
      `=== PERFIL ===`,
      `Nombre: ${user.name}`,
      `Email: ${user.email}`,
      profile ? `Objetivo: ${profile.fitnessGoal} | Nivel: ${profile.experienceLevel} | Peso: ${profile.weightKg}kg | Altura: ${profile.heightCm}cm` : 'Sin perfil completado',
      ``,
      `=== MÉTRICAS CORPORALES ===`,
    ];

    if (bodyMetrics.length > 0) {
      for (const bm of bodyMetrics) {
        lines.push(`${dateToLocalString(bm.date)}: ${bm.weightKg ? bm.weightKg + 'kg' : '-'} | Grasa: ${bm.bodyFat ? bm.bodyFat + '%' : '-'}`);
      }
    } else {
      lines.push('Sin registros de métricas corporales.');
    }

    lines.push(`\n=== RESUMEN 4 SEMANAS ===`);
    lines.push(`Workouts completados: ${workouts.length}`);
    lines.push(`Total de series: ${workouts.reduce((acc, w) => acc + w.sets.length, 0)}`);
    lines.push(`Total de volumen: ${workouts.reduce((acc, w) => acc + w.sets.reduce((a, s) => a + (s.volume ?? 0), 0), 0)}kg`);
    lines.push(`PRs logrados: ${prs.length}`);

    lines.push(`\n=== TOP PRs ===`);
    for (const pr of prs.slice(0, 5)) {
      lines.push(`${pr.exercise.nameEs ?? pr.exercise.name}: ${pr.weightKg}kg x ${pr.reps} reps (1RM estimado: ${pr.oneRepMax?.toFixed(1)}kg)`);
    }

    lines.push(`\n=== HISTORIAL DE ENTRENAMIENTOS ===`);
    for (const workout of workouts.slice(0, 15)) {
      const date = dateToLocalString(workout.date);
      lines.push(`\n${date} - ${workout.name ?? 'Entrenamiento'} (${workout.durationMin ?? '?'} min)`);

      const byExercise = new Map<string, typeof workout.sets>();
      for (const set of workout.sets) {
        const key = set.exercise.nameEs ?? set.exercise.name;
        if (!byExercise.has(key)) byExercise.set(key, []);
        byExercise.get(key)!.push(set);
      }

      for (const [exercise, sets] of byExercise.entries()) {
        const maxWeight = Math.max(...sets.map((s) => s.weightKg));
        const totalVol = sets.reduce((a, s) => a + (s.volume ?? 0), 0);
        const hasPR = sets.some((s) => s.isPR);
        const avgRpe = sets.filter(s => s.rpe).length > 0
          ? (sets.reduce((a, s) => a + (s.rpe ?? 0), 0) / sets.filter(s => s.rpe).length).toFixed(1)
          : '-';
        lines.push(
          `  ${exercise}: ${sets.length} series, max ${maxWeight}kg, vol ${Math.round(totalVol)}kg, RPE avg ${avgRpe}${hasPR ? ' ⭐PR' : ''}`,
        );
      }
    }

    lines.push(`\n=== ESTADÍSTICAS POR EJERCICIO (4 semanas) ===`);
    for (const stat of stats.slice(0, 15)) {
      const ex = await this.prisma.exercise.findUnique({ where: { id: stat.exerciseId } });
      if (!ex) continue;
      lines.push(`${ex.nameEs ?? ex.name}: ${stat._count._all} series, vol total ${Math.round(stat._sum.volume ?? 0)}kg, max peso ${stat._max.weightKg}kg, max 1RM ${stat._max.oneRepMax?.toFixed(1)}kg`);
    }

    return lines.join('\n');
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), ms);
      promise
        .then((val) => { clearTimeout(timer); resolve(val); })
        .catch((err) => { clearTimeout(timer); reject(err); });
    });
  }
}
