import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SupportChatDto, SupportReplyDto } from './dto/support-chat.dto.js';
import { SUPPORT_PROVIDER, type SupportProvider } from './support-provider.js';

export const SUPPORT_UNAVAILABLE =
  'El asistente no está disponible en este momento. Intenta de nuevo en unos minutos.';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    @Inject(SUPPORT_PROVIDER) private readonly provider: SupportProvider,
  ) {}

  async chat(dto: SupportChatDto): Promise<SupportReplyDto> {
    const messages = [
      ...(dto.history ?? []).map(({ role, content }) => ({ role, content })),
      { role: 'user' as const, content: dto.message.trim() },
    ];
    const started = Date.now();
    try {
      const { answer, sources } = await this.provider.ask(messages);
      return {
        answer,
        sources,
        provider: this.provider.name,
        latencyMs: Date.now() - started,
      };
    } catch (error) {
      this.logger.error(
        `Fallo del asistente (${this.provider.name}): ${(error as Error).message}`,
      );
      throw new ServiceUnavailableException(SUPPORT_UNAVAILABLE);
    }
  }
}
