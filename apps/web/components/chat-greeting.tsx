"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SuggestedActions } from "./suggested-actions";

interface ChatGreetingProps {
  onSelectSuggestion: (prompt: string) => void;
  disabled?: boolean;
}

export function ChatGreeting({
  onSelectSuggestion,
  disabled,
}: ChatGreetingProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          alt="CityLAB Berlin"
          className="mb-4 h-16 w-16 rounded-full"
          height={64}
          src="/citylab_berlin_logo_square.jpeg"
          width={64}
        />
        <h1 className="mb-2 font-semibold text-2xl tracking-tight sm:text-3xl">
          CityLAB Berlin Assistant
        </h1>
        <p className="max-w-md text-muted-foreground">
          Wie kann ich dir helfen? Frag mich alles über CityLAB Berlin, unsere
          Projekte und Initiativen.
        </p>
      </motion.div>

      <motion.div
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl"
        initial={{ opacity: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <SuggestedActions disabled={disabled} onSelect={onSelectSuggestion} />
      </motion.div>
    </div>
  );
}
