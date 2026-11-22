import PlaceCard from './PlaceCard';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/common/StateViews';

// Lưới thẻ địa điểm kèm trạng thái đang tải / lỗi / rỗng.
// status: 'loading' | 'ready' | 'error' (từ PlacesContext)
export default function PlaceGrid({ places, status, onRetry }) {
  if (status === 'loading' && places.length === 0) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === 'error' && places.length === 0) return <ErrorState onRetry={onRetry} />;
  if (places.length === 0) return <EmptyState />;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place, index) => (
        <PlaceCard key={place.slug} place={place} index={index} />
      ))}
    </div>
  );
}
