import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * ApiKeyGuard — Protege rutas mediante HTTP header x-api-key.
 *
 * Configuración:
 *  - Define API_KEY=<valor-secreto> en tu archivo .env
 *  - Incluye el header en cada petición protegida:
 *      x-api-key: <tu-api-key>
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];

    if (!process.env.API_KEY) {
      throw new UnauthorizedException(
        'El servidor no tiene API_KEY configurada en las variables de entorno',
      );
    }

    if (!apiKey || apiKey !== process.env.API_KEY) {
      throw new UnauthorizedException(
        'API Key inválida o ausente. Incluye el header x-api-key',
      );
    }

    return true;
  }
}
