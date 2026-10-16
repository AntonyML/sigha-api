import { describe, expect, test } from 'bun:test';
import { HealthController } from './health.controller';

describe('HealthController (Render healthCheckPath /health)', () => {
  test('responde status ok con uptime y timestamp', () => {
    const controller = new HealthController();
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(typeof result.uptime).toBe('number');
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });
});
