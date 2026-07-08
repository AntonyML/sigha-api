/**
 * Sensitive data sanitizer for logging
 * Prevents PII/PHI (Protected Health Information) from being written to logs
 * 
 * Compliance: Costa Rica Ley 8968 (Protección de Datos Personales)
 * Healthcare data: Medical records, diagnostics, patient information
 */

/**
 * List of sensitive field names to redact from logs
 * Covers: authentication, personal identifiers, medical data, financial
 */
const SENSITIVE_FIELDS = [
  // Authentication
  'password',
  'contrasena',
  'clave',
  'token',
  'accessToken',
  'refreshToken',
  'jwt',
  'secret',
  'apiKey',
  'api_key',
  
  // Personal identifiers (Costa Rica)
  'cedula',
  'identificacion',
  'dni',
  'pasaporte',
  'sinpe',
  
  // Medical/PHI
  'diagnostico',
  'diagnosis',
  'enfermedad',
  'condicion',
  'tratamiento',
  'medicamento',
  'receta',
  'historial',
  'expediente',
  'paciente',
  'sintoma',
  'symptom',
  'prescripcion',
  
  // Contact information
  'telefono',
  'telefono',
  'celular',
  'direccion',
  'address',
  'email',
  'correo',
  
  // Financial
  'tarjeta',
  'card',
  'cuenta',
  'account',
  'iban',
  'sinpeMovil',
];

/**
 * Patterns to detect and redact sensitive data in string values
 */
const SENSITIVE_PATTERNS: RegExp[] = [
  // Costa Rican cédula (1-9 digits, with or without dashes)
  /\b\d{1,3}-?\d{4,6}-?\d{1,4}\b/g,
  
  // Email addresses
  /\b[\w.-]+@[\w.-]+\.\w+\b/g,
  
  // Phone numbers (CR format: 8 digits, with or without dashes/spaces)
  /\b\d{4}-?\d{4}\b/g,
  
  // JWT tokens (header.payload.signature)
  /\beyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*\b/g,
];

const REDACTED = '[REDACTED]';

/**
 * Check if a field name should be redacted
 */
function isSensitiveField(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()));
}

/**
 * Sanitize a value - redact sensitive patterns in strings
 */
function sanitizeValue(value: string): string {
  if (typeof value !== 'string') {
    return String(value);
  }
  
  let sanitized = value;
  SENSITIVE_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, REDACTED);
  });
  return sanitized;
}

/**
 * Recursively sanitize an object, redacting sensitive fields
 * Preserves structure but replaces sensitive values with [REDACTED]
 * 
 * @param data - Any object to sanitize
 * @param depth - Current recursion depth (prevents infinite loops)
 * @returns Sanitized copy of the object
 */
export function sanitizeForLogging(data: any, depth: number = 0): any {
  // Prevent infinite recursion
  if (depth > 10) {
    return '[MAX_DEPTH_EXCEEDED]';
  }
  
  // Null/undefined
  if (data === null || data === undefined) {
    return data;
  }
  
  // Arrays - sanitize each element
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLogging(item, depth + 1));
  }
  
  // Strings - check for sensitive patterns
  if (typeof data === 'string') {
    return sanitizeValue(data);
  }
  
  // Numbers, booleans - return as-is
  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }
  
  // Objects - recursively sanitize properties
  if (typeof data === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveField(key)) {
        // Redact sensitive fields
        sanitized[key] = REDACTED;
        
        // If it's an object/array, still sanitize it to catch nested sensitive data
        if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeForLogging(value, depth + 1);
        }
      } else {
        // Recursively sanitize non-sensitive fields
        sanitized[key] = sanitizeForLogging(value, depth + 1);
      }
    }
    
    return sanitized;
  }
  
  // Functions, symbols, etc. - convert to string
  return String(data);
}

/**
 * Quick check if data contains sensitive information
 * Useful for conditional logging
 */
export function containsSensitiveData(data: any): boolean {
  if (data === null || data === undefined) {
    return false;
  }
  
  if (Array.isArray(data)) {
    return data.some(item => containsSensitiveData(item));
  }
  
  if (typeof data === 'string') {
    return SENSITIVE_PATTERNS.some(pattern => pattern.test(data));
  }
  
  if (typeof data === 'object') {
    return Object.entries(data).some(([key, value]) => {
      if (isSensitiveField(key)) {
        return true;
      }
      return containsSensitiveData(value);
    });
  }
  
  return false;
}