import { FileText } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your CityLAB Berlin knowledge base.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          className="group flex flex-col rounded-lg border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-accent"
          href="/documents"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="mb-2 font-semibold text-lg group-hover:text-primary">
            Documents
          </h2>
          <p className="text-muted-foreground text-sm">
            Add and manage documents in the knowledge base. Embed URLs and
            review extracted content.
          </p>
        </Link>
      </div>
    </div>
  );
}
