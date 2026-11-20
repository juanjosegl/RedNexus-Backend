import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MockSupportProvider } from './providers/mock.provider.js';
import { OpenWebUiSupportProvider } from './providers/openwebui.provider.js';
import { SupportController } from './support.controller.js';
import { SUPPORT_PROVIDER, SupportProvider } from './support-provider.js';
import { SupportService } from './support.service.js';

// SUPPORT_PROVIDER=openwebui usa el modelo RAG de Open WebUI, si no el mock
@Module({
  controllers: [SupportController],
  providers: [
    SupportService,
    {
      provide: SUPPORT_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): SupportProvider => {
        const provider =
          config.get<string>('support.provider') === 'openwebui'
            ? new OpenWebUiSupportProvider({
                url: config.getOrThrow<string>('support.openWebUiUrl'),
                apiKey: config.getOrThrow<string>('support.apiKey'),
                model: config.getOrThrow<string>('support.model'),
                timeoutMs: config.getOrThrow<number>('support.timeoutMs'),
              })
            : new MockSupportProvider();
        new Logger('SupportModule').log(
          `Asistente de soporte: ${provider.name}`,
        );
        return provider;
      },
    },
  ],
})
export class SupportModule {}
