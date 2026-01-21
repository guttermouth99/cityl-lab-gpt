"use client";

import { cn } from "@baito/ui/lib/utils";
import { Cog, FileText, FolderOpen, LayoutDashboard, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

interface NavItem {
  href: string;
  labelKey: "addKnowledge" | "browseKnowledge";
  icon: React.ComponentType<{ className?: string }>;
}

const knowledgeBaseItems: NavItem[] = [
  {
    href: "/dashboard/add-document",
    labelKey: "addKnowledge",
    icon: Plus,
  },
  {
    href: "/documents/browse",
    labelKey: "browseKnowledge",
    icon: FolderOpen,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("AdminSidebar");

  return (
    <aside className="sticky top-16 flex h-[calc(100vh-4rem)] w-64 flex-col border-r bg-muted/30">
      <nav className="flex-1 space-y-1 p-4">
        <Link
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm transition-colors",
            pathname === "/dashboard"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          href="/dashboard"
        >
          <LayoutDashboard className="h-4 w-4" />
          {t("overview")}
        </Link>

        <div className="mt-6 mb-4 px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          {t("knowledgeBase")}
        </div>
        {knowledgeBaseItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}

        <div className="mt-8 mb-4 px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          {t("engineRoom")}
        </div>
        <a
          className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          href="http://localhost:4111"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Cog className="h-4 w-4" />
          {t("mastraUi")}
        </a>
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
          <FileText className="h-5 w-5 text-secondary-foreground" />
          <div className="text-secondary-foreground text-xs">
            <p className="font-medium">{t("cityLabBerlin")}</p>
            <p>{t("knowledgeBaseAdmin")}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
