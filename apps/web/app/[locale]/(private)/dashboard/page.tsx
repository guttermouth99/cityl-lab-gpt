"use client";

import { Cog, FileText, FolderSearch, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header with background decoration */}
      <header className="relative mb-12 overflow-hidden">
        {/* Background decoration - diagonal stripe */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rotate-12 bg-gradient-to-br from-citylab-pink/10 to-citylab-blue/5" />

        <div className="relative">
          {/* Staggered title animation */}
          <div className="fade-in slide-in-from-bottom-4 animate-in duration-500">
            <h1 className="mb-2 font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl">
              <span className="bg-gradient-to-r from-citylab-pink via-citylab-blue to-citylab-pink bg-clip-text text-transparent">
                {t("title")}
              </span>
            </h1>
          </div>

          <div className="fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-500 [animation-delay:100ms]">
            <p className="max-w-2xl text-lg text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
      </header>

      {/* Dashboard cards */}
      <div className="fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-500 [animation-delay:200ms]">
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            className="group relative flex flex-col overflow-hidden border-2 border-muted bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-citylab-pink/50 hover:shadow-lg"
            href="/dashboard/add-document"
          >
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-citylab-pink to-citylab-blue transition-all duration-300 group-hover:w-1.5" />
            <div className="pl-3">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-citylab-pink/10 text-citylab-pink">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="mb-2 font-semibold text-lg transition-colors group-hover:text-citylab-pink">
                {t("addKnowledge")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t("addKnowledgeDescription")}
              </p>
            </div>
          </Link>

          <Link
            className="group relative flex flex-col overflow-hidden border-2 border-muted bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-citylab-pink/50 hover:shadow-lg"
            href="/documents/browse"
          >
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-citylab-pink to-citylab-blue transition-all duration-300 group-hover:w-1.5" />
            <div className="pl-3">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-citylab-blue/10 text-citylab-blue">
                <FolderSearch className="h-6 w-6" />
              </div>
              <h2 className="mb-2 font-semibold text-lg transition-colors group-hover:text-citylab-pink">
                {t("browseKnowledge")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t("browseKnowledgeDescription")}
              </p>
            </div>
          </Link>

          <Link
            className="group relative flex flex-col overflow-hidden border-2 border-muted bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-citylab-pink/50 hover:shadow-lg"
            href="/"
          >
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-citylab-pink to-citylab-blue transition-all duration-300 group-hover:w-1.5" />
            <div className="pl-3">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-citylab-pink/10 text-citylab-pink">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h2 className="mb-2 font-semibold text-lg transition-colors group-hover:text-citylab-pink">
                {t("goToChat")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t("goToChatDescription")}
              </p>
            </div>
          </Link>

          <a
            className="group relative flex flex-col overflow-hidden border-2 border-muted bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-citylab-pink/50 hover:shadow-lg"
            href="http://localhost:4111"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-citylab-pink to-citylab-blue transition-all duration-300 group-hover:w-1.5" />
            <div className="pl-3">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-citylab-blue/10 text-citylab-blue">
                <Cog className="h-6 w-6" />
              </div>
              <h2 className="mb-2 font-semibold text-lg transition-colors group-hover:text-citylab-pink">
                {t("engineRoom")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t("engineRoomDescription")}
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
