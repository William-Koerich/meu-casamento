import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 5 }).map((_, indice) => (
        <Skeleton key={indice} className="h-40 rounded-xl" />
      ))}
    </div>
  )
}
