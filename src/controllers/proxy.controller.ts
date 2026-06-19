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
  }

  @Post('session')
  async session(@Req() request: Request, @Res() response: Response): Promise<void> {
    const sessionId = request.body.session;
    const connected = request.body.status === 'connected';
    await this.proxyService.session(sessionId, connected, response);
  }
}
