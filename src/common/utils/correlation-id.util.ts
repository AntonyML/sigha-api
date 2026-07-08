import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique correlation ID for each request.
 * Format: UUID v4 (e.g., "550e8400-e29b-41d4-a716-446655440000")
 * 
 * This ID is used to trace a request across multiple services and logs.
 */
export function generateCorrelationId(): string {
  return uuidv4();
}

/**
 * Header name for correlation ID in HTTP requests/responses.
 */
export const CORRELATION_ID_HEADER = 'x-correlation-id';