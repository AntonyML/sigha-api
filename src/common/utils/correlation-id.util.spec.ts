import { describe, it, expect } from 'bun:test';
import {
  CORRELATION_ID_HEADER,
  generateCorrelationId,
} from './correlation-id.util';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('Correlation ID util', () => {
  describe('generateCorrelationId', () => {
    it('should return a string in UUID v4 format', () => {
      expect(generateCorrelationId()).toMatch(UUID_V4_PATTERN);
    });

    it('should generate unique values on consecutive calls', () => {
      const ids = new Set(
        Array.from({ length: 100 }, () => generateCorrelationId()),
      );

      expect(ids.size).toBe(100);
    });

    it('should mark the version nibble as 4', () => {
      const version = generateCorrelationId().split('-')[2][0];

      expect(version).toBe('4');
    });

    it('should be usable as a request header value', () => {
      const headers: Record<string, string> = {
        [CORRELATION_ID_HEADER]: generateCorrelationId(),
      };

      expect(headers[CORRELATION_ID_HEADER]).toMatch(UUID_V4_PATTERN);
    });
  });

  describe('CORRELATION_ID_HEADER', () => {
    it('should use the canonical header name', () => {
      expect(CORRELATION_ID_HEADER).toBe('x-correlation-id');
    });

    it('should be lowercase for HTTP header normalization', () => {
      expect(CORRELATION_ID_HEADER).toBe(CORRELATION_ID_HEADER.toLowerCase());
    });
  });
});
