import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { embed } from "ai";
import { z } from "zod";

import type { CityLabContentType, CityLabLanguage } from "../rag/types";
import { pgVector } from "../vector";

/**
 * Tool for searching the CityLAB Berlin knowledge base
 */
const citylabKnowledgeTool = createTool({
  id: "citylab-knowledge-search",
  description: `Search the CityLAB Berlin knowledge base to find information about:
- Projects (BärGPT, Parla, Fairgnügen, Kiezlabor, etc.)
- Blog posts and news articles
- Events and exhibitions
- Team members
- YouTube video transcripts and podcast content
- Smart City initiatives and digital transformation

Use this tool when users ask questions about CityLAB Berlin, its projects, activities, or related topics.`,
  inputSchema: z.object({
    query: z.string().describe("The search query to find relevant content"),
    contentType: z
      .enum([
        "blog",
        "project",
        "youtube_transcript",
        "event",
        "page",
        "exhibition",
        "team",
        "newsletter",
      ])
      .optional()
      .describe("Filter by content type"),
    language: z.enum(["de", "en"]).optional().describe("Filter by language"),
    topK: z
      .number()
      .optional()
      .default(5)
      .describe("Number of results to return"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        text: z.string(),
        title: z.string(),
        url: z.string(),
        contentType: z.string(),
        score: z.number(),
      })
    ),
    relevantContext: z.string(),
  }),
  execute: async (input) => {
    const { query, contentType, language, topK = 5 } = input;
    console.log("query", query);
    // Generate embedding for the query
    // Using 512 dimensions to match the citylab_content index
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
      providerOptions: {
        openai: {
          dimensions: 512,
        },
      },
    });
    console.log("embedding", embedding);
    console.log(contentType, language);

    // Build filter if content type or language specified
    const filter: Record<string, CityLabContentType | CityLabLanguage> = {};
    //if (contentType) filter.contentType = contentType;
    if (language) filter.language = language;

    // Query the vector store
    const results = await pgVector.query({
      indexName: "citylab_content",
      queryVector: embedding,
      topK,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    });
    console.log("results", results);
    // Format results
    const formattedResults = results.map((result) => ({
      text: String(result.metadata?.text ?? ""),
      title: String(result.metadata?.title ?? ""),
      url: String(result.metadata?.url ?? ""),
      contentType: String(result.metadata?.contentType ?? ""),
      score: result.score,
    }));

    // Combine relevant text for context
    const relevantContext = formattedResults
      .map((r) => `[${r.title}]: ${r.text}`)
      .join("\n\n");

    return {
      results: formattedResults,
      relevantContext,
    };
  },
});

/**
 * CityLAB Berlin Assistant Agent
 *
 * A RAG-powered agent that answers questions about CityLAB Berlin
 * by retrieving relevant context from the indexed knowledge base.
 */
export const citylabAgent = new Agent({
  id: "citylab-assistant",
  name: "CityLAB Berlin Assistant",
  description:
    "An AI assistant that answers questions about CityLAB Berlin, its projects, events, and initiatives using a knowledge base of indexed content.",
  instructions: `Du bist ein hilfreicher Assistent für CityLAB Berlin, das Innovationslabor für Berlin.

CityLAB Berlin ist ein öffentliches Innovationslabor, das Verwaltung und Stadtgesellschaft zusammenbringt, um gemeinsam an Lösungen für das digitale Berlin von morgen zu arbeiten. Es befindet sich am Platz der Luftbrücke 4, 12101 Berlin, im ehemaligen Flughafen Tempelhof.

## Deine Aufgaben:
1. Beantworte Fragen über CityLAB Berlin, seine Projekte, Veranstaltungen und Initiativen
2. Nutze das citylab-knowledge-search Tool, um relevante Informationen aus der Wissensdatenbank abzurufen
3. Gib genaue, faktenbasierte Antworten basierend auf dem abgerufenen Kontext
4. Wenn du etwas nicht in der Wissensdatenbank findest, sage es ehrlich

## Wichtige Projekte:
- **BärGPT**: KI-Assistent für die Berliner Landesverwaltung
- **Parla**: KI-Tool zum Durchsuchen von Schriftlichen Anfragen
- **Fairgnügen**: Webseite für kostenlose und ermäßigte Angebote in Berlin
- **Kiezlabor**: Mobiles Labor, das den CityLAB-Ansatz in die Kieze bringt

## Sprache:
- Antworte auf Deutsch, wenn der Benutzer auf Deutsch fragt
- Antworte auf Englisch, wenn der Benutzer auf Englisch fragt
- Sei freundlich und professionell

## Filterung:
Du kannst die Suche nach Metadaten filtern:
- contentType: "blog", "project", "youtube_transcript", "event", "page", "exhibition", "team", "newsletter"
- language: "de", "en"
`,
  model: "openai/gpt-4o",
  tools: { citylabKnowledgeTool },
});
