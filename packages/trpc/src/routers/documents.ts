import type { embedDocumentTask } from "@baito/worker";
import { neon } from "@neondatabase/serverless";
import { tasks } from "@trigger.dev/sdk";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

interface DocumentSummary {
  sourceId: string;
  title: string;
  url: string;
  contentType: string;
  language: string;
  publishedAt?: string;
  tags?: string[];
  author?: string;
  topic?: string;
  chunkCount: number;
}

export const documentsRouter = createTRPCRouter({
  /**
   * List all unique documents in the knowledge base
   */
  list: publicProcedure.query(async () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = neon(connectionString);

    // Query the vector store table for unique documents by sourceId
    const rows = await sql`
      SELECT 
        metadata->>'sourceId' as source_id,
        metadata->>'title' as title,
        metadata->>'url' as url,
        metadata->>'contentType' as content_type,
        metadata->>'language' as language,
        metadata->>'publishedAt' as published_at,
        metadata->'tags' as tags,
        metadata->>'author' as author,
        metadata->>'topic' as topic,
        COUNT(*) as chunk_count
      FROM "citylab_content"
      GROUP BY 
        metadata->>'sourceId',
        metadata->>'title',
        metadata->>'url',
        metadata->>'contentType',
        metadata->>'language',
        metadata->>'publishedAt',
        metadata->'tags',
        metadata->>'author',
        metadata->>'topic'
      ORDER BY metadata->>'title'
    `;

    return rows.map((row) => ({
      sourceId: row.source_id as string,
      title: row.title as string,
      url: row.url as string,
      contentType: row.content_type as string,
      language: row.language as string,
      publishedAt: row.published_at as string | undefined,
      tags: row.tags as string[] | undefined,
      author: row.author as string | undefined,
      topic: row.topic as string | undefined,
      chunkCount: Number(row.chunk_count),
    })) satisfies DocumentSummary[];
  }),

  /**
   * Trigger document embedding workflow
   * Returns the run ID and public access token for realtime updates
   */
  embed: publicProcedure
    .input(z.object({ url: z.string().url("Valid URL is required") }))
    .mutation(async ({ input }) => {
      const handle = await tasks.trigger<typeof embedDocumentTask>(
        "embed-document",
        {
          url: input.url,
        }
      );
      return {
        runId: handle.id,
        token: handle.publicAccessToken,
      };
    }),

  /**
   * Delete a document and all its chunks from the knowledge base
   */
  delete: publicProcedure
    .input(z.object({ sourceId: z.string() }))
    .mutation(async ({ input }) => {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is required");
      }
      const sql = neon(connectionString);
      const result = await sql`
        DELETE FROM "citylab_content"
        WHERE metadata->>'sourceId' = ${input.sourceId}
        RETURNING id
      `;
      return { success: true, deletedCount: result.length };
    }),
});
