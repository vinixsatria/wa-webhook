import {
  Controller,
  Post,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../services/proxy.service';
import { connect } from 'http2';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('message')
  async proxy(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    try {
      // Ambil session dari payload request
      let session: string;

      // Coba ambil dari body jika ada
      if (request.body && request.body.session) {
        session = request.body.session;
      }
      // Coba ambil dari query params sebagai fallback
      else if (request.query && request.query.session) {
        session = request.query.session as string;
      }
      // Coba ambil dari headers sebagai fallback
      else if (request.headers && request.headers['x-session']) {
        session = request.headers['x-session'] as string;
      }
      else {
        throw new HttpException(
          'Parameter "session" diperlukan dalam body, query params, atau header x-session',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Lakukan proxy request
      await this.proxyService.proxyRequest(session, request, response);
    } catch (error) {
      this.handleException(error, response);
    }
  }

  @Post('session')
  async session(@Req() request: Request, @Res() response: Response): Promise<void> {
    try {
      const sessionId = request.body?.session;
      const connected = request.body?.status === 'connected';
      await this.proxyService.session(sessionId, connected, response);
    } catch (error) {
      this.handleException(error, response);
    }
  }

  private handleException(error: unknown, response: Response): void {
    if (response.headersSent) {
      response.end();
      return;
    }

    const status =
      error instanceof HttpException
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    if (error instanceof HttpException) {
      const payload = error.getResponse();
      if (typeof payload === 'string') {
        message = payload;
      } else {
        const msg = (payload as Record<string, unknown>)?.message;
        message = Array.isArray(msg)
          ? (msg as unknown[]).join(', ')
          : String(msg ?? 'Error');
      }
    } else {
      console.error(
        'Unhandled error:',
        error instanceof Error ? error.message : error,
      );
      message = 'Internal server error';
    }

    response.status(status).json({ statusCode: status, message });
  }
}
