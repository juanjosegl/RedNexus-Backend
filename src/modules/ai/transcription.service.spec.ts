import type { Queue } from 'bullmq';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { AiJob } from '../queue/queue.constants.js';
import {
  MOCK_TRANSCRIPT,
  MockTranscriber,
} from './providers/mock-transcriber.js';
import {
  TranscriptionService,
  UNINTELLIGIBLE_TEXT,
} from './transcription.service.js';
import {
  cleanTranscript,
  isSupportedAudio,
  type Transcriber,
  VOICE_PLACEHOLDER,
} from './transcription.js';

const job = {
  requestId: 'r1',
  mimeType: 'audio/webm',
  audioBase64: Buffer.from('audio').toString('base64'),
};

function setup(
  transcriber: Transcriber = new MockTranscriber(),
  request: object | null = {
    id: 'r1',
    text: VOICE_PLACEHOLDER,
    status: 'PENDING',
  },
) {
  const prisma = {
    helpRequest: {
      findUnique: vi.fn().mockResolvedValue(request),
      update: vi.fn().mockResolvedValue({}),
    },
  };
  const queue = { add: vi.fn() };
  const service = new TranscriptionService(
    prisma as unknown as PrismaService,
    transcriber,
    queue as unknown as Queue,
  );
  return { prisma, queue, service };
}

describe('TranscriptionService (IA-05)', () => {
  it('guarda el texto y encola el emparejamiento', async () => {
    const { prisma, queue, service } = setup();
    const result = await service.transcribeRequest(job);
    expect(result.outcome).toBe('transcribed');
    expect(prisma.helpRequest.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { text: MOCK_TRANSCRIPT },
    });
    expect(queue.add).toHaveBeenCalledWith(
      AiJob.Match,
      { requestId: 'r1' },
      expect.any(Object),
    );
  });

  it('cierra la solicitud si la nota no tiene texto útil', async () => {
    const silent: Transcriber = { name: 'x', transcribe: async () => 'ok' };
    const { prisma, queue, service } = setup(silent);
    expect((await service.transcribeRequest(job)).outcome).toBe(
      'unintelligible',
    );
    expect(prisma.helpRequest.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { text: UNINTELLIGIBLE_TEXT, status: 'CLOSED' },
    });
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('no repite una solicitud ya transcrita (reintento)', async () => {
    const { queue, service } = setup(new MockTranscriber(), {
      id: 'r1',
      text: 'ya tengo texto',
      status: 'PENDING',
    });
    expect((await service.transcribeRequest(job)).outcome).toBe('skipped');
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('propaga el error para que BullMQ reintente', async () => {
    const failing: Transcriber = {
      name: 'x',
      transcribe: () => Promise.reject(new Error('whisper apagado')),
    };
    const { service } = setup(failing);
    await expect(service.transcribeRequest(job)).rejects.toThrow(
      'whisper apagado',
    );
  });
});

describe('utilidades de audio', () => {
  it('acepta los formatos del navegador con o sin codec', () => {
    expect(isSupportedAudio('audio/webm;codecs=opus')).toBe(true);
    expect(isSupportedAudio('audio/mpeg')).toBe(true);
    expect(isSupportedAudio('video/mp4')).toBe(false);
  });

  it('limpia las marcas de silencio de whisper.cpp', () => {
    expect(cleanTranscript(' [BLANK_AUDIO]  Hola   mundo (música) ')).toBe(
      'Hola mundo',
    );
  });
});
