import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AI_PROVIDER, AiProvider } from './ai-provider.js';
import { MockTranscriber } from './providers/mock-transcriber.js';
import { MockAiProvider } from './providers/mock.provider.js';
import { OllamaAiProvider } from './providers/ollama.provider.js';
import { WhisperTranscriber } from './providers/whisper.provider.js';
import { TRANSCRIBER, type Transcriber } from './transcription.js';

// AI_PROVIDER=ollama usa Ollama, si no el mock.
// TRANSCRIBE_PROVIDER=whisper usa whisper.cpp, si no el mock.
@Module({
  providers: [
    {
      provide: AI_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): AiProvider => {
        const provider =
          config.get<string>('ai.provider') === 'ollama'
            ? new OllamaAiProvider({
                url: config.getOrThrow<string>('ollama.url'),
                llmModel: config.getOrThrow<string>('ollama.llmModel'),
                embedModel: config.getOrThrow<string>('ollama.embedModel'),
                timeoutMs: config.getOrThrow<number>('ollama.timeoutMs'),
              })
            : new MockAiProvider();
        new Logger('AiModule').log(`Proveedor de IA: ${provider.name}`);
        return provider;
      },
    },
    {
      provide: TRANSCRIBER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Transcriber => {
        const transcriber =
          config.get<string>('transcription.provider') === 'whisper'
            ? new WhisperTranscriber({
                url: config.getOrThrow<string>('transcription.whisperUrl'),
                language: config.getOrThrow<string>('transcription.language'),
                timeoutMs: config.getOrThrow<number>('transcription.timeoutMs'),
              })
            : new MockTranscriber();
        new Logger('AiModule').log(`Transcripción: ${transcriber.name}`);
        return transcriber;
      },
    },
  ],
  exports: [AI_PROVIDER, TRANSCRIBER],
})
export class AiModule {}
