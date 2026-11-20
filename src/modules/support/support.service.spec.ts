import { ServiceUnavailableException } from '@nestjs/common';
import { MockSupportProvider } from './providers/mock.provider.js';
import type { SupportProvider } from './support-provider.js';
import { SUPPORT_UNAVAILABLE, SupportService } from './support.service.js';

describe('SupportService', () => {
  it('responde con el proveedor y mide la latencia', async () => {
    const service = new SupportService(new MockSupportProvider());

    const reply = await service.chat({ message: '¿Qué es RedNexus?' });

    expect(reply.provider).toBe('mock');
    expect(reply.answer).toContain('RedNexus');
    expect(reply.sources).toEqual([]);
    expect(reply.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('envía el historial y luego la pregunta actual', async () => {
    const ask = vi.fn().mockResolvedValue({ answer: 'ok', sources: [] });
    const service = new SupportService({ name: 'fake', ask });

    await service.chat({
      message: '  ¿y después?  ',
      history: [
        { role: 'user', content: '¿Cómo me registro?' },
        { role: 'assistant', content: 'Con tu correo institucional.' },
      ],
    });

    expect(ask).toHaveBeenCalledWith([
      { role: 'user', content: '¿Cómo me registro?' },
      { role: 'assistant', content: 'Con tu correo institucional.' },
      { role: 'user', content: '¿y después?' },
    ]);
  });

  it('devuelve 503 si el proveedor falla', async () => {
    const failing: SupportProvider = {
      name: 'fake',
      ask: () => Promise.reject(new Error('sin conexión')),
    };
    const service = new SupportService(failing);

    await expect(service.chat({ message: 'hola' })).rejects.toThrow(
      new ServiceUnavailableException(SUPPORT_UNAVAILABLE),
    );
  });
});
