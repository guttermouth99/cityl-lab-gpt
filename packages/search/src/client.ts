import Typesense from 'typesense'

const typesenseHost = process.env.TYPESENSE_HOST || 'localhost'
const typesensePort = parseInt(process.env.TYPESENSE_PORT || '8108', 10)
const typesenseProtocol = process.env.TYPESENSE_PROTOCOL || 'http'
const typesenseApiKey = process.env.TYPESENSE_API_KEY || 'xyz'

export const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: typesenseHost,
      port: typesensePort,
      protocol: typesenseProtocol,
    },
  ],
  apiKey: typesenseApiKey,
  connectionTimeoutSeconds: 10,
})

export type TypesenseClient = typeof typesenseClient
