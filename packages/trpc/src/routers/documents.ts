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
   * List documents with cursor-based pagination for infinite scroll
   */
  listPaginated: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(12),
        cursor: z.string().nullish(), // title of last item for cursor-based pagination
      })
    )
    .query(async ({ input }) => {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is required");
      }
      const sql = neon(connectionString);
      const limit = input.limit;

      // Fetch one extra item to determine if there are more pages
      const rows = input.cursor
        ? await sql`
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
            HAVING metadata->>'title' > ${input.cursor}
            ORDER BY metadata->>'title'
            LIMIT ${limit + 1}
          `
        : await sql`
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
            LIMIT ${limit + 1}
          `;

      // Check if there are more items
      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;

      const documents = items.map((row) => ({
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

      return {
        items: documents,
        nextCursor: hasMore ? documents.at(-1)?.title : null,
      };
    }),

  /**
   * Search documents by metadata fields
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        filters: z
          .object({
            contentType: z.string().nullable(),
            language: z.string().nullable(),
            topic: z.string().nullable(),
          })
          .optional(),
        sortBy: z.enum(["title", "date", "chunks"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is required");
      }
      const sql = neon(connectionString);

      // Escape special LIKE characters to prevent pattern injection
      const escapedQuery = input.query
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_");
      const searchPattern = `%${escapedQuery}%`;

      // Build the query with search and optional filters
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
        WHERE (
          metadata->>'title' ILIKE ${searchPattern}
          OR metadata->>'url' ILIKE ${searchPattern}
          OR metadata->>'author' ILIKE ${searchPattern}
          OR metadata->>'topic' ILIKE ${searchPattern}
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(COALESCE(metadata->'tags', '[]'::jsonb)) AS tag
            WHERE tag ILIKE ${searchPattern}
          )
        )
        ${input.filters?.contentType ? sql`AND metadata->>'contentType' = ${input.filters.contentType}` : sql``}
        ${input.filters?.language ? sql`AND metadata->>'language' = ${input.filters.language}` : sql``}
        ${input.filters?.topic ? sql`AND metadata->>'topic' = ${input.filters.topic}` : sql``}
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
        ORDER BY 
          CASE WHEN ${input.sortBy ?? "title"} = 'title' THEN metadata->>'title' END ASC,
          CASE WHEN ${input.sortBy ?? "title"} = 'date' THEN metadata->>'publishedAt' END DESC NULLS LAST,
          CASE WHEN ${input.sortBy ?? "title"} = 'chunks' THEN COUNT(*) END DESC
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
   *
   * Accepts either:
   * - url: Fetch content from a URL
   * - text: Direct text content (with optional title and source)
   */
  embed: publicProcedure
    .input(
      z
        .object({
          url: z.string().url("Valid URL is required").optional(),
          text: z.string().optional(),
          title: z.string().optional(),
          source: z.string().url("Valid source URL is required").optional(),
        })
        .refine((data) => data.url || data.text, {
          message: "Either url or text must be provided",
        })
    )
    .mutation(async ({ input }) => {
      const handle = await tasks.trigger<typeof embedDocumentTask>(
        "embed-document",
        {
          url: input.url,
          text: input.text,
          title: input.title,
          source: input.source,
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
