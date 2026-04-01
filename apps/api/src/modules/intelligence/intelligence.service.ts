import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RagQueryDto } from './dto/rag-query.dto';

export interface RagResult {
  kind: 'subsystem' | 'variant' | 'evidence';
  id: string;
  title: string;
  excerpt: string;
  /** Cosine similarity score (0–1). Placeholder until embeddings are populated. */
  score: number;
  metadata: Record<string, unknown>;
}

export interface AutoSummarizeResult {
  reviewId: string;
  reviewTitle: string;
  evidenceCount: number;
  summary: string;
  suggestedComplianceScore: number;
  suggestedRiskScore: number;
}

@Injectable()
export class IntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * RAG semantic search across subsystems, variants, and evidence.
   *
   * Until the embedding pipeline is live (pgvector + embedding model), this
   * implementation performs a full-text keyword search as a functional
   * stand-in.  The response shape is identical to what the vector-search path
   * will return, so front-end consumers require no changes when the real
   * embedding pipeline is wired up.
   */
  async ragQuery(dto: RagQueryDto): Promise<RagResult[]> {
    const topK = dto.topK ?? 5;
    const keyword = dto.query.toLowerCase();

    const [subsystems, variants, evidence] = await Promise.all([
      this.prisma.subsystem.findMany({
        where: {
          ...(dto.twinId ? { twinId: dto.twinId } : {}),
          ...(dto.projectId
            ? { twin: { project: { id: dto.projectId } } }
            : {}),
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
            { identifier: { contains: keyword, mode: 'insensitive' } },
          ],
        },
        take: topK,
        include: { twin: { select: { id: true, name: true } } },
      }),
      this.prisma.variant.findMany({
        where: {
          ...(dto.twinId ? { twinId: dto.twinId } : {}),
          ...(dto.projectId
            ? { twin: { project: { id: dto.projectId } } }
            : {}),
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
          ],
        },
        take: topK,
        include: { twin: { select: { id: true, name: true } } },
      }),
      this.prisma.evidence.findMany({
        where: {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
          ],
          ...(dto.projectId
            ? { review: { projectId: dto.projectId } }
            : {}),
        },
        take: topK,
        include: { review: { select: { id: true, title: true, projectId: true } } },
      }),
    ]);

    const results: RagResult[] = [
      ...subsystems.map((s) => ({
        kind: 'subsystem' as const,
        id: s.id,
        title: `${s.identifier} — ${s.name}`,
        excerpt: s.description ?? `Subsystem ${s.identifier} in twin "${s.twin.name}"`,
        score: 0.9,
        metadata: { twinId: s.twinId, twinName: s.twin.name, status: s.status },
      })),
      ...variants.map((v) => ({
        kind: 'variant' as const,
        id: v.id,
        title: v.name,
        excerpt: v.description ?? `Variant of twin "${v.twin.name}"`,
        score: 0.85,
        metadata: { twinId: v.twinId, twinName: v.twin.name, isBaseline: v.isBaseline },
      })),
      ...evidence.map((e) => ({
        kind: 'evidence' as const,
        id: e.id,
        title: e.title,
        excerpt: e.description ?? `${e.type} evidence in review "${e.review.title}"`,
        score: 0.8,
        metadata: { reviewId: e.reviewId, reviewTitle: e.review.title, type: e.type },
      })),
    ];

    // Sort by score descending and cap at topK across all entity types.
    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /**
   * Auto-summarise the evidence attached to a review and produce suggested
   * compliance and risk scores.
   *
   * The current implementation uses heuristics (evidence count, type
   * distribution) as a stand-in until an LLM completion call is wired up.
   */
  async autoSummarize(reviewId: string): Promise<AutoSummarizeResult> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { evidence: true },
    });

    if (!review) {
      throw new NotFoundException(`Review ${reviewId} not found`);
    }

    const evidenceCount = review.evidence.length;

    // Heuristic compliance score — improves with more evidence.
    const suggestedComplianceScore = Math.min(
      100,
      Math.round(50 + evidenceCount * 8),
    );

    // Heuristic risk score — decreases as evidence increases (more coverage).
    const suggestedRiskScore = Math.max(
      0,
      Math.round(80 - evidenceCount * 10),
    );

    const typeList =
      evidenceCount > 0
        ? review.evidence.map((e) => e.type.toLowerCase().replace(/_/g, ' ')).join(', ')
        : 'none';

    const summary =
      evidenceCount === 0
        ? `Review "${review.title}" (${review.type}) has no evidence attached. ` +
          `Status: ${review.status}. Consider attaching supporting documents or test results.`
        : `Review "${review.title}" (${review.type}) has ${evidenceCount} piece${evidenceCount !== 1 ? 's' : ''} ` +
          `of evidence: ${typeList}. Status: ${review.status}. ` +
          `Suggested compliance score: ${suggestedComplianceScore}/100. ` +
          `Suggested risk score: ${suggestedRiskScore}/100.`;

    return {
      reviewId: review.id,
      reviewTitle: review.title,
      evidenceCount,
      summary,
      suggestedComplianceScore,
      suggestedRiskScore,
    };
  }
}
