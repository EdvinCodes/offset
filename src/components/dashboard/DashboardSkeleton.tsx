import { Skeleton } from "@/components/ui/Skeleton";
import { Logo } from "@/components/ui/Logo";

export default function DashboardSkeleton() {
  return (
    <main className="min-h-screen p-4 sm:p-8 md:p-16 bg-zinc-50 dark:bg-[#09090B] pb-32">
      {/* 1. Header Skeleton */}
      <header className="flex items-center justify-between mb-8 sm:mb-16 max-w-[1400px] mx-auto">
        <div className="opacity-50">
          <Logo className="scale-75 sm:scale-100 origin-left grayscale" />
        </div>
        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
      </header>

      {/* 2. Map Skeleton */}
      <div className="max-w-[1400px] mx-auto mb-8">
        <Skeleton className="w-full aspect-[2/1] rounded-3xl" />
      </div>

      {/* 3. Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-[1400px] mx-auto">
        {/* Hero Card Skeleton (Ocupa 2 espacios) */}
        <div className="col-span-1 sm:col-span-2 xl:col-span-2 xl:row-span-2 h-full min-h-[250px]">
          <Skeleton className="h-full w-full p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 bg-zinc-300 dark:bg-zinc-700" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-24 w-64 bg-zinc-300 dark:bg-zinc-700" />
          </Skeleton>
        </div>

        {/* 3 Tarjetas pequeñas simuladas */}
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <Skeleton className="h-6 w-32 bg-zinc-300 dark:bg-zinc-700" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-16 w-32 bg-zinc-300 dark:bg-zinc-700" />
          </Skeleton>
        ))}
      </div>
    </main>
  );
}
