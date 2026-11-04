import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AI_PROVIDER, AiProvider } from './ai-provider.js';
import { MockAiProvider } from './providers/mock.provider.js';
import { OllamaAiProvider } from './providers/ollama.provider.js';

// AI_PROVIDER=ollama usa Ollama, si no el mock
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
  ],
  exports: [AI_PROVIDER],
})
export class AiModule {}
