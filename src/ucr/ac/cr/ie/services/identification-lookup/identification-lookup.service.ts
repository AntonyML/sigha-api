import { Injectable } from '@nestjs/common';
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

// Endpoint del proveedor externo. Vive únicamente acá (servidor), nunca en el
// bundle del frontend. La llamada es servidor-a-servidor, por lo que no
// aplica CORS.
const IDENTIFICATION_LOOKUP_URL = 'https://api.hacienda.go.cr/fe/ae';

@Injectable()
export class IdentificationLookupService {
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

    try {
      const { data } = await axios.get(IDENTIFICATION_LOOKUP_URL, {
        params: { identificacion: digits },
        timeout: LOOKUP_TIMEOUT_MS,
      });

      if (data?.nombre) {
        return { found: true, fullName: String(data.nombre) };
      }
      return { found: false };
    } catch {
      // Cualquier error del proveedor (timeout, 404, 500, formato inesperado)
      // se traduce siempre al mismo resultado neutro. El detalle del error
      // real solo debería quedar en logs de servidor si hiciera falta.
      return { found: false };
    }
  }
}
