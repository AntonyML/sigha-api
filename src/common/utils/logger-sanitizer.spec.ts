import { sanitizeForLogging, containsSensitiveData } from './logger-sanitizer';
import { CORRELATION_ID_HEADER } from './correlation-id.util';
import { sanitizeValue } from './logger-sanitizer';

describe('Logger Sanitizer', () => {
  describe('sanitizeForLogging', () => {
    it('should redact password field', () => {
      const data = { username: 'john', password: 'secret123' };
      const result = sanitizeForLogging(data);
      
      expect(result.username).toBe('john');
      expect(result.password).toBe('[REDACTED]');
    });

    it('should redact cedula (Costa Rican ID)', () => {
      const data = { name: 'Juan Perez', cedula: '1-2345-6789' };
      const result = sanitizeForLogging(data);
      
      expect(result.name).toBe('Juan Perez');
      expect(result.cedula).toBe('[REDACTED]');
    });

    it('should redact nested sensitive fields', () => {
      const data = {
        user: {
          name: 'Maria',
          password: 'hashed',
          profile: {
            cedula: '3-4567-8901',
            diagnosis: 'Diabetes Type 2',
          },
        },
      };
      const result = sanitizeForLogging(data);
      
      expect(result.user.password).toBe('[REDACTED]');
      expect(result.user.profile.cedula).toBe('[REDACTED]');
      expect(result.user.profile.diagnosis).toBe('[REDACTED]');
      expect(result.user.name).toBe('Maria');
    });

    it('should redact cedula patterns in strings', () => {
      const data = { notes: 'Patient ID: 1-2345-6789, Observation: Normal' };
      const result = sanitizeForLogging(data);
      
      expect(result.notes).toBe('Patient ID: [REDACTED], Observation: Normal');
    });

    it('should redact email addresses', () => {
      const data = { message: 'Contact: user@example.com for info' };
      const result = sanitizeForLogging(data);
      
      expect(result.message).toBe('Contact: [REDACTED] for info');
    });

    it('should redact phone numbers', () => {
      const data = { phone: '8765-4321' };
      const result = sanitizeForLogging(data);
      
      expect(result.phone).toBe('[REDACTED]');
    });

    it('should redact JWT tokens', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.signature';
      const data = { authorization: token };
      const result = sanitizeForLogging(data);
      
      expect(result.authorization).toBe('[REDACTED]');
    });

    it('should handle arrays', () => {
      const data = {
        patients: [
          { name: 'Ana', cedula: '1-1111-1111' },
          { name: 'Luis', diagnosis: 'Hypertension' },
        ],
      };
      const result = sanitizeForLogging(data);
      
      expect(result.patients[0].cedula).toBe('[REDACTED]');
      expect(result.patients[1].diagnosis).toBe('[REDACTED]');
      expect(result.patients[0].name).toBe('Ana');
    });

    it('should preserve non-sensitive data', () => {
      const data = {
        id: 123,
        active: true,
        timestamp: '2026-07-07',
        count: 42,
      };
      const result = sanitizeForLogging(data);
      
      expect(result).toEqual(data);
    });

    it('should handle null and undefined', () => {
      const data = { a: null, b: undefined, c: 'test' };
      const result = sanitizeForLogging(data);
      
      expect(result.a).toBe(null);
      expect(result.b).toBe(undefined);
      expect(result.c).toBe('test');
    });

    it('should prevent infinite recursion', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;
      
      const result = sanitizeForLogging(circular);
      
      expect(result.name).toBe('test');
    });
  });

  describe('containsSensitiveData', () => {
    it('should detect sensitive field names', () => {
      expect(containsSensitiveData({ password: 'secret' })).toBe(true);
      expect(containsSensitiveData({ cedula: '1-1111-1111' })).toBe(true);
      expect(containsSensitiveData({ diagnosis: 'Flu' })).toBe(true);
    });

    it('should detect sensitive patterns in strings', () => {
      expect(containsSensitiveData('Contact: user@example.com')).toBe(true);
      expect(containsSensitiveData('ID: 1-2345-6789')).toBe(true);
      expect(containsSensitiveData('Phone: 8888-7777')).toBe(true);
    });

    it('should return false for non-sensitive data', () => {
      expect(containsSensitiveData({ name: 'John' })).toBe(false);
      expect(containsSensitiveData({ id: 123 })).toBe(false);
      expect(containsSensitiveData('Regular text')).toBe(false);
    });

    it('should detect nested sensitive data', () => {
      const data = {
        user: {
          profile: {
            password: 'secret',
          },
        },
      };
      expect(containsSensitiveData(data)).toBe(true);
    });
  });

  describe('sanitizeValue', () => {
    it('should redact cédula in different formats', () => {
      expect(sanitizeValue('123456789')).toBe('[REDACTED]');
      expect(sanitizeValue('1-2345-6789')).toBe('[REDACTED]');
      expect(sanitizeValue('12345678')).toBe('[REDACTED]');
    });

    it('should redact multiple patterns in same string', () => {
      const text = 'User john@example.com with cédula 1-1111-1111 called from 8888-7777';
      const result = sanitizeValue(text);
      
      expect(result).toContain('[REDACTED]');
      expect(result.split('[REDACTED]').length).toBeGreaterThan(1);
    });
  });
});