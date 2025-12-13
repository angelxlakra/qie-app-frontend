import { GraphQLClient } from 'graphql-request'

/**
 * Subgraph endpoint for QIE Events
 * This indexer tracks all events, tiers, and ticket transfers
 */
export const SUBGRAPH_URL = 'https://simplr-events-qie-contracts-production.up.railway.app/graphql'

/**
 * GraphQL client instance for querying the subgraph
 * Uses graphql-request for simplicity and performance
 */
export const subgraphClient = new GraphQLClient(SUBGRAPH_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Helper function to handle GraphQL errors gracefully
 */
export async function querySubgraph<T>(query: string, variables?: Record<string, any>): Promise<T> {
  try {
    return await subgraphClient.request<T>(query, variables)
  } catch (error) {
    console.error('Subgraph query error:', error)
    throw error
  }
}
