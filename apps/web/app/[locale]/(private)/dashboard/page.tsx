"use client";

import { Cog, FileText, FolderSearch, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
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
            {t("addKnowledge")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("addKnowledgeDescription")}
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
            {t("browseKnowledge")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("browseKnowledgeDescription")}
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
            {t("goToChat")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("goToChatDescription")}
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
            {t("engineRoom")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("engineRoomDescription")}
          </p>
        </a>
      </div>
    </div>
  );
}
