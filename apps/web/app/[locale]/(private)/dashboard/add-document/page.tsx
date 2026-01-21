"use client";

import { useTranslations } from "next-intl";

import { DocumentUpload } from "./document-upload";

export default function AddDocumentPage() {
  const t = useTranslations("AddDocument");

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-bold text-3xl">{t("pageTitle")}</h1>
        <p className="text-muted-foreground">{t("pageDescription")}</p>
      </div>
      <DocumentUpload />
    </div>
  );
}
