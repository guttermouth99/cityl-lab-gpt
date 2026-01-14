import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY

export const openai = new OpenAI({
  apiKey,
})

// Default model for classification tasks
export const DEFAULT_MODEL = 'gpt-4o-mini'

// Embedding model
export const EMBEDDING_MODEL = 'text-embedding-3-small'

export type OpenAIClient = typeof openai
