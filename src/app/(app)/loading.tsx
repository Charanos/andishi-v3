import { CardSkeleton, TableSkeleton } from "@/components/dashboard/shared/skeleton";
import { PageLoader } from "@/components/dashboard/shared/page-loader";

export default function DashboardLoading() {
  return (
    <div className="grid gap-5">
      <PageLoader label="Loading dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <TableSkeleton rows={4} />
    </div>
  );
}

