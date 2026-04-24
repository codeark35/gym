import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AnalysisType } from './dto/ai.dto';

@Injectable()
export class AiService {
  private anthropic: Anthropic;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async analyze(externalId: string, type: AnalysisType, userQuestion?: string): Promise<string> {
    const context = await this.buildUserContext(externalId);

    const systemPrompt = `Sos un entrenador personal experto en entrenamiento de fuerza.
Analizás datos reales de entrenamiento y das feedback conciso, accionable y motivador.
Respondé siempre en español rioplatense informal. Máximo 250 palabras.
No inventes datos que no estén en el contexto.`;

    const userPrompt = userQuestion
      ? `${userQuestion}\n\nContexto del usuario:\n${context}`
      : this.buildPromptByType(type, context);

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  async chat(externalId: string, message: string): Promise<string> {
    return this.analyze(externalId, AnalysisType.GENERAL, message);
  }

  private buildPromptByType(type: AnalysisType, context: string): string {
    const prompts: Record<AnalysisType, string> = {
      [AnalysisType.GENERAL]: `Hacé un análisis general de mi entrenamiento de las últimas 4 semanas.\n\n${context}`,
      [AnalysisType.PROGRESS]: `Analizá mi progreso de fuerza y decime cómo vengo evolucionando.\n\n${context}`,
      [AnalysisType.VOLUME]: `Analizá el volumen de entrenamiento por grupo muscular y decime si hay desequilibrios.\n\n${context}`,
      [AnalysisType.RECOVERY]: `Analizá mi frecuencia de entrenamiento y decime si estoy descansando bien.\n\n${context}`,
    };
    return prompts[type];
  }

  private async buildUserContext(externalId: string): Promise<string> {
    const user = await this.usersService.findByExternalId(externalId);

    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const workouts = await this.prisma.workout.findMany({
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
      take: 20,
    });

    const lines: string[] = [
      `Usuario: ${user.name}`,
      `Workouts últimas 4 semanas: ${workouts.length}`,
      '',
      'Historial de entrenamientos:',
    ];

    for (const workout of workouts) {
      const date = workout.date.toISOString().split('T')[0];
      lines.push(`\n${date} - ${workout.name ?? 'Entrenamiento'}`);

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
        lines.push(
          `  ${exercise}: ${sets.length} series, max ${maxWeight}kg, vol ${Math.round(totalVol)}kg${hasPR ? ' ⭐PR' : ''}`,
        );
      }
    }

    return lines.join('\n');
  }
}
