"use client";

import { useTranslations } from "next-intl";

import { DocumentUpload } from "./document-upload";

export default function AddDocumentPage() {
  const t = useTranslations("AddDocument");

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
                {t("pageTitle")}
              </span>
            </h1>
          </div>

          <div className="fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-500 [animation-delay:100ms]">
            <p className="max-w-2xl text-lg text-muted-foreground">
              {t("pageDescription")}
            </p>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-500 [animation-delay:200ms]">
        <div className="max-w-3xl">
          <DocumentUpload />
        </div>
      </div>
    </div>
  );
}
