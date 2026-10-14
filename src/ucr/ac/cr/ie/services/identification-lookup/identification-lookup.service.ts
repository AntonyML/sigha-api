import { Injectable, Optional, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios from 'axios';

/**
 * Respuesta pública y estable que este servicio expone al resto del sistema.
 * El front NUNCA debe ver el formato ni el texto crudo del proveedor externo.
 */
export interface IdentificationLookupResult {
  found: boolean;
  fullName?: string;
}

const LOOKUP_TIMEOUT_MS = 8000;
const CACHE_KEY_PREFIX = 'id-lookup:';
// Los nombres de personas físicas o jurídicas asociadas a una cédula son esencialmente estables:
// se cachean los aciertos positivos por 24 horas (86_400_000 ms) para reducir latencia de ~1200ms a <2ms.
const POSITIVE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
// Las respuestas no encontradas o errores de red se cachean brevemente por 5 minutos (300_000 ms)
// para proteger el API de Hacienda ante ráfagas repetitivas.
const NEGATIVE_CACHE_TTL_MS = 5 * 60 * 1000;

// Endpoint del proveedor externo. Vive únicamente acá (servidor), nunca en el
// bundle del frontend. La llamada es servidor-a-servidor, por lo que no
// aplica CORS.
const IDENTIFICATION_LOOKUP_URL = 'https://api.hacienda.go.cr/fe/ae';

@Injectable()
export class IdentificationLookupService {
  constructor(
    @Optional()
    @Inject(CACHE_MANAGER)
    private readonly cacheManager?: Cache,
  ) {}

  /**
   * Busca el nombre asociado a un número de identificación.
   *
   * Importante: esta función siempre devuelve una estructura propia y estable
   * ({ found, fullName }). Nunca reenvía mensajes, códigos de error, ni la
   * forma de la respuesta del proveedor externo — eso evita acoplar al
   * frontend (y a los usuarios) a la redacción/estructura de un tercero, y
   * permite cambiar de proveedor sin romper contratos.
   */
  async lookupByIdentification(digits: string): Promise<IdentificationLookupResult> {
    if (!/^[0-9]{6,12}$/.test(digits)) {
      return { found: false };
    }

    const cacheKey = `${CACHE_KEY_PREFIX}${digits}`;

    if (this.cacheManager) {
      try {
        const cached = await this.cacheManager.get<IdentificationLookupResult>(cacheKey);
        if (cached !== null && cached !== undefined) {
          return cached;
        }
      } catch {
        // Un fallo en lectura de caché no debe bloquear la consulta real
      }
    }

    let result: IdentificationLookupResult = { found: false };

    try {
      const { data } = await axios.get(IDENTIFICATION_LOOKUP_URL, {
        params: { identificacion: digits },
        timeout: LOOKUP_TIMEOUT_MS,
      });

      if (data?.nombre) {
        result = { found: true, fullName: String(data.nombre) };
      }
    } catch {
      // Cualquier error del proveedor (timeout, 404, 500, formato inesperado)
      // se traduce siempre al mismo resultado neutro. El detalle del error
      // real solo debería quedar en logs de servidor si hiciera falta.
      result = { found: false };
    }

    if (this.cacheManager) {
      try {
        const ttl = result.found ? POSITIVE_CACHE_TTL_MS : NEGATIVE_CACHE_TTL_MS;
        await this.cacheManager.set(cacheKey, result, ttl);
      } catch {
        // Un fallo en escritura de caché no debe romper la respuesta al usuario
      }
    }

    return result;
  }
}
