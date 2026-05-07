import { Skeleton } from "@/components/LoadingScreen";

export function MovieRowSkeleton({ title }: { title?: string }) {
  return (
    <section className="py-6">
      {title && (
        <div className="px-4 sm:px-8 mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight opacity-60">{title}</h2>
        </div>
      )}
      <div className="flex gap-4 overflow-hidden px-4 sm:px-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="shrink-0 w-52 sm:w-56 aspect-[2/3]" />
        ))}
      </div>
    </section>
  );
}

export function MovieGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-[2/3] w-full" />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="relative z-10 h-full flex items-end pb-32 px-4 sm:px-12 max-w-screen-2xl mx-auto">
        <div className="space-y-4 max-w-2xl w-full">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-12 w-40 rounded-full" />
            <Skeleton className="h-12 w-40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
