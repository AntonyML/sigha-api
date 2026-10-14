import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { IdentificationLookupService } from './identification-lookup.service';
import axios from 'axios';

describe('IdentificationLookupService', () => {
  let service: IdentificationLookupService;
  let mockCache: {
    get: ReturnType<typeof mock>;
    set: ReturnType<typeof mock>;
  };

  beforeEach(() => {
    mockCache = {
      get: mock(() => Promise.resolve(null)),
      set: mock(() => Promise.resolve()),
    };
    service = new IdentificationLookupService(mockCache as any);
  });

  it('debería retornar { found: false } de inmediato si los dígitos son inválidos', async () => {
    const result = await service.lookupByIdentification('123');
    expect(result).toEqual({ found: false });
    expect(mockCache.get).not.toHaveBeenCalled();
    expect(mockCache.set).not.toHaveBeenCalled();
  });

  it('debería retornar el valor en caché si existe, sin llamar a axios', async () => {
    const cachedData = { found: true, fullName: 'JUAN PEREZ SOTO' };
    mockCache.get = mock(() => Promise.resolve(cachedData));

    const axiosGetSpy = mock(() => Promise.resolve({ data: {} }));
    const origGet = axios.get;
    axios.get = axiosGetSpy as any;

    try {
      const result = await service.lookupByIdentification('112340567');
      expect(result).toEqual(cachedData);
      expect(mockCache.get).toHaveBeenCalledWith('id-lookup:112340567');
      expect(axiosGetSpy).not.toHaveBeenCalled();
    } finally {
      axios.get = origGet;
    }
  });

  it('debería llamar a axios en cache miss y guardar acierto positivo por 24 horas', async () => {
    const origGet = axios.get;
    axios.get = mock(() => Promise.resolve({
      data: { nombre: 'MARIA LOPEZ MORA' },
    })) as any;

    try {
      const result = await service.lookupByIdentification('205670890');
      expect(result).toEqual({ found: true, fullName: 'MARIA LOPEZ MORA' });
      expect(mockCache.get).toHaveBeenCalledWith('id-lookup:205670890');
      expect(mockCache.set).toHaveBeenCalledWith(
        'id-lookup:205670890',
        { found: true, fullName: 'MARIA LOPEZ MORA' },
        24 * 60 * 60 * 1000,
      );
    } finally {
      axios.get = origGet;
    }
  });

  it('debería guardar resultado negativo por 5 minutos ante error de red o 404', async () => {
    const origGet = axios.get;
    axios.get = mock(() => Promise.reject(new Error('Network Error or 404'))) as any;

    try {
      const result = await service.lookupByIdentification('999999999');
      expect(result).toEqual({ found: false });
      expect(mockCache.set).toHaveBeenCalledWith(
        'id-lookup:999999999',
        { found: false },
        5 * 60 * 1000,
      );
    } finally {
      axios.get = origGet;
    }
  });

  it('debería funcionar correctamente sin caché inyectada (fallback)', async () => {
    const serviceWithoutCache = new IdentificationLookupService(undefined);
    const origGet = axios.get;
    axios.get = mock(() => Promise.resolve({
      data: { nombre: 'CARLOS ALVARADO' },
    })) as any;

    try {
      const result = await serviceWithoutCache.lookupByIdentification('101110222');
      expect(result).toEqual({ found: true, fullName: 'CARLOS ALVARADO' });
    } finally {
      axios.get = origGet;
    }
  });
});
