import type { Review } from '@naval/domain';
import { cn, formatDate, statusColor, statusDotColor } from '@/lib/utils';
import { ClipboardList, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ReviewsPanelProps {
  reviews: Review[];
}

const reviewTypeLabel: Record<string, string> = {
  DESIGN: 'Design Review',
  SAFETY: 'Safety Review',
  COMPLIANCE: 'Compliance Review',
  INTERFACE: 'Interface Review',
};

const reviewTypeColor: Record<string, string> = {
  DESIGN: 'text-naval-cyan bg-naval-cyan/10 border-naval-cyan/20',
  SAFETY: 'text-naval-red bg-naval-red/10 border-naval-red/20',
  COMPLIANCE: 'text-naval-indigo bg-naval-indigo/10 border-naval-indigo/20',
  INTERFACE: 'text-naval-teal bg-naval-teal/10 border-naval-teal/20',
};

function ReviewStatusIcon({ status }: { status: string }) {
  if (status === 'APPROVED') return <CheckCircle size={13} className="text-naval-green" />;
  if (status === 'REJECTED') return <XCircle size={13} className="text-naval-red" />;
  return <Clock size={13} className="text-naval-amber" />;
}

export function ReviewsPanel({ reviews }: ReviewsPanelProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-border text-text-muted text-sm">
        No reviews yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const evidenceCount = review.evidence?.length ?? 0;

  return (
    <div className="rounded-lg border border-border-subtle bg-surface-1 p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'text-2xs border px-1.5 py-0.5 rounded font-medium',
              reviewTypeColor[review.type] ?? 'text-text-muted bg-surface-2 border-border-subtle',
            )}
          >
            {reviewTypeLabel[review.type] ?? review.type}
          </span>
          <div className="flex items-center gap-1">
            <ReviewStatusIcon status={review.status} />
            <span className={cn('text-2xs', statusColor(review.status as never))}>
              {review.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <span className="text-2xs text-text-dim shrink-0">{formatDate(review.createdAt)}</span>
      </div>

      <h3 className="text-sm font-medium text-text-primary mb-1">{review.title}</h3>

      {review.description && (
        <p className="text-xs text-text-secondary mb-3 leading-relaxed line-clamp-2">
          {review.description}
        </p>
      )}

      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border-subtle text-2xs text-text-muted">
        {review.createdBy && (
          <span className="flex items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-accent-muted border border-accent/30 flex items-center justify-center text-[9px] font-medium text-accent">
              {review.createdBy.name.slice(0, 2).toUpperCase()}
            </div>
            {review.createdBy.name}
          </span>
        )}
        <span className="flex items-center gap-1 ml-auto">
          <FileText size={11} />
          {evidenceCount} evidence item{evidenceCount !== 1 ? 's' : ''}
        </span>
      </div>

      {evidenceCount > 0 && (
        <div className="mt-3 space-y-1">
          {review.evidence?.map((ev) => (
            <div key={ev.id} className="flex items-center gap-2 rounded bg-surface-2 border border-border-subtle px-2 py-1.5">
              <ClipboardList size={11} className="text-text-muted shrink-0" />
              <span className="text-2xs text-text-secondary truncate flex-1">{ev.title}</span>
              <span className="text-2xs text-text-dim">{ev.type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
