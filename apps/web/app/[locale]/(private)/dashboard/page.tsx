import { Cog, FileText, FolderSearch, MessageCircle } from "lucide-react";
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

      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          className="group flex flex-col rounded-lg border bg-card p-6 transition-colors hover:border-muted-foreground/30 hover:bg-muted/30"
          href="/dashboard/add-document"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="mb-2 font-semibold text-lg group-hover:text-foreground">
            Add Documents
          </h2>
          <p className="text-muted-foreground text-sm">
            Add new documents to the knowledge base. Embed URLs and review
            extracted content.
          </p>
        </Link>

        <Link
          className="group flex flex-col rounded-lg border bg-card p-6 transition-colors hover:border-muted-foreground/30 hover:bg-muted/30"
          href="/documents/browse"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FolderSearch className="h-6 w-6" />
          </div>
          <h2 className="mb-2 font-semibold text-lg group-hover:text-foreground">
            Browse Documents
          </h2>
          <p className="text-muted-foreground text-sm">
            View and manage all documents in the knowledge base. Search, filter,
            and organize your content.
          </p>
        </Link>

        <Link
          className="group flex flex-col rounded-lg border bg-card p-6 transition-colors hover:border-muted-foreground/30 hover:bg-muted/30"
          href="/"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h2 className="mb-2 font-semibold text-lg group-hover:text-foreground">
            Go to Chat
          </h2>
          <p className="text-muted-foreground text-sm">
            Return to the chat interface and interact with the CityLAB Berlin
            knowledge assistant.
          </p>
        </Link>

        <a
          className="group flex flex-col rounded-lg border bg-card p-6 transition-colors hover:border-muted-foreground/30 hover:bg-muted/30"
          href="http://localhost:4111"
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cog className="h-6 w-6" />
          </div>
          <h2 className="mb-2 font-semibold text-lg group-hover:text-foreground">
            Maschinenraum
          </h2>
          <p className="text-muted-foreground text-sm">
            Access the Mastra UI to monitor and manage AI workflows and agent
            configurations.
          </p>
        </a>
      </div>
    </div>
  );
}
