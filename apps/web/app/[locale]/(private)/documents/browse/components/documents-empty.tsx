"use client";

import { Button } from "@baito/ui/components/button";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function DocumentsEmpty() {
  const t = useTranslations("Knowledge");

  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden py-16">
      {/* Abstract background graphic */}
      <div className="absolute inset-0 -z-10">
        {/* Large gradient circle */}
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-citylab-pink/10 via-transparent to-citylab-blue/10 blur-3xl" />

        {/* Floating geometric shapes */}
        <div className="absolute top-[20%] left-[10%] h-24 w-24 rotate-12 animate-float border-2 border-citylab-pink/20" />
        <div className="absolute top-[30%] right-[15%] h-16 w-16 -rotate-6 animate-float border-2 border-citylab-blue/10 [animation-delay:1s] [animation-duration:8s]" />
        <div className="absolute bottom-[25%] left-[20%] h-12 w-12 rotate-45 animate-float border-2 border-citylab-blue/20 [animation-delay:0.5s] [animation-duration:7s]" />
        <div className="absolute right-[25%] bottom-[20%] h-20 w-20 animate-float rounded-full bg-citylab-pink/5 [animation-delay:2s] [animation-duration:9s]" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                height="40"
                id="empty-grid"
                patternUnits="userSpaceOnUse"
                width="40"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect fill="url(#empty-grid)" height="100%" width="100%" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="fade-in slide-in-from-bottom-8 relative animate-in duration-700">
        {/* Icon */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <div className="relative">
            {/* Animated rings */}
            <div
              className="absolute inset-0 animate-ping rounded-full bg-citylab-pink/20"
              style={{ animationDuration: "3s" }}
            />
            <div
              className="absolute -inset-4 animate-ping rounded-full bg-citylab-blue/10"
              style={{ animationDuration: "4s", animationDelay: "1s" }}
            />

            {/* Main icon container */}
            <div className="relative flex h-24 w-24 items-center justify-center border-2 border-citylab-pink bg-background">
              <Plus className="h-10 w-10 text-citylab-pink" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="mb-8 max-w-md text-center">
          <h2 className="mb-3 font-bold text-3xl tracking-tight md:text-4xl">
            <span className="bg-gradient-to-r from-citylab-pink to-citylab-blue bg-clip-text text-transparent">
              {t("noDocuments")}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("noDocumentsDescription")}
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            asChild
            className="group gap-2 bg-citylab-pink px-6 py-6 text-lg hover:bg-citylab-pink/90"
            size="lg"
          >
            <Link href="/dashboard/add-document">
              <Plus className="h-5 w-5" />
              {t("addDocument")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
