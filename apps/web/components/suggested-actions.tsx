"use client";

import { Button } from "@baito/ui/components/button";
import { motion } from "framer-motion";

interface SuggestedActionsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const suggestions = [
  {
    title: "Was ist BärGPT?",
    description: "Erfahre mehr über Berlins KI-Assistent",
    prompt: "Was ist BärGPT und wie funktioniert es?",
  },
  {
    title: "Tell me about Parla",
    description: "Parliamentary document search",
    prompt: "What is Parla and how does it help with parliamentary documents?",
  },
  {
    title: "CityLAB Projekte",
    description: "Alle Innovationsprojekte",
    prompt: "Welche Projekte gibt es im CityLAB Berlin?",
  },
  {
    title: "Fairgnügen erkunden",
    description: "Kostenlose Events in Berlin",
    prompt:
      "Was ist Fairgnügen und wie kann ich kostenlose Events in Berlin finden?",
  },
];

export function SuggestedActions({
  onSelect,
  disabled,
}: SuggestedActionsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {suggestions.map((suggestion, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          key={suggestion.title}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <Button
            className="h-auto w-full flex-col items-start gap-1 p-4 text-left hover:bg-muted/50"
            disabled={disabled}
            onClick={() => onSelect(suggestion.prompt)}
            variant="outline"
          >
            <span className="font-medium">{suggestion.title}</span>
            <span className="text-muted-foreground text-xs">
              {suggestion.description}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
