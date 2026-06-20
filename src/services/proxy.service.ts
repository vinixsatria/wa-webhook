import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ProxyConfigService } from './proxy-config.service';

@Injectable()
export class ProxyService {
  constructor(private readonly proxyConfigService: ProxyConfigService) {}

  async proxyRequest(
    session: string,
    originalRequest: Request,
    response: Response,
  ): Promise<void> {
    // Validasi method - hanya terima POST
    if (originalRequest.method !== 'POST') {
      throw new HttpException(
        'Hanya method POST yang diizinkan',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    // Dapatkan URL backend berdasarkan session
    const backendUrl = this.proxyConfigService.getBackendUrl(session);
    
    if (!backendUrl) {
      throw new HttpException(
        `Session '${session}' tidak ditemukan dalam konfigurasi proxy`,
        HttpStatus.BAD_REQUEST,
      );
    }

    console.log(`Receive incoming message from WhatsApp Gateway for session ${session}`, {
      method: originalRequest.method,
      originalUrl: originalRequest.url,
      targetUrl: backendUrl,
      headers: originalRequest.headers,
      params: originalRequest.query,
      body: originalRequest.body,
      session,
    });

    // const isConnected = this.proxyConfigService.isConnected(session);
    // if (!isConnected) {
    //   throw new HttpException(
    //     `Tidak dapat terhubung ke backend`,
    //     HttpStatus.SERVICE_UNAVAILABLE,
    //   );
    // }

    try {
      // Siapkan URL target
      // const targetUrl = `${backendUrl}${originalRequest.path}`;
      const targetUrl = `${backendUrl}`;
      
      // Siapkan konfigurasi axios
      const axiosConfig: AxiosRequestConfig = {
        method: originalRequest.method,
        url: targetUrl,
        headers: {
          ...originalRequest.headers,
          host: new URL(backendUrl).host,
        },
        params: originalRequest.query,
        data: originalRequest.body,
        responseType: 'stream',
        timeout: 30000,
      };

      // Hapus header yang tidak perlu
      delete axiosConfig.headers['host'];
      delete axiosConfig.headers['content-length'];

      console.log(`Forward request ${originalRequest.method} to webhook ${targetUrl}`)

      // Lakukan request ke backend
      const axiosResponse: AxiosResponse = await axios(axiosConfig);

      // Set header response
      Object.keys(axiosResponse.headers).forEach(key => {
        if (key.toLowerCase() !== 'transfer-encoding') {
          response.setHeader(key, axiosResponse.headers[key]);
        }
      });

      // Set status code
      response.status(axiosResponse.status);

      // Pipe response body with stream-error handling
      axiosResponse.data.on('error', (streamError) => {
        console.error(
          'Upstream stream error:',
          streamError instanceof Error ? streamError.message : streamError,
        );
        if (!response.headersSent) {
          response
            .status(502)
            .json({ statusCode: 502, message: 'Upstream stream error' });
        } else {
          response.end();
        }
      });
      axiosResponse.data.pipe(response);

    } catch (error) {
      console.error('Proxy error:', error);
      
      if (error.response) {
        // Error dari backend
        const errorData = {
          error: 'Backend error',
          status: error.response.status,
          message: 'Backend returned an error response',
        };
        
        // Coba ambil message dari response jika bisa
        if (error.response.data && typeof error.response.data === 'string') {
          errorData.message = error.response.data;
        } else if (error.response.data && error.response.data.message) {
          errorData.message = error.response.data.message;
        }
        
        response.status(error.response.status).json(errorData);
      } else if (error.code === 'ECONNREFUSED') {
        // Connection refused
        throw new HttpException(
          `Tidak dapat terhubung ke backend untuk session '${session}'`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else if (error.code === 'ENOTFOUND') {
        // Host not found
        throw new HttpException(
          `Backend URL untuk session '${session}' tidak ditemukan`,
          HttpStatus.BAD_GATEWAY,
        );
      } else {
        // Error lainnya
        throw new HttpException(
          `Terjadi kesalahan saat melakukan proxy: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    console.log(`Response from webhook`, { statusCode: response.statusCode, session });
  }

  async session(session: string, connected: boolean, response: Response): Promise<void> {
    this.proxyConfigService.setConnected(session, connected);
    response.status(200).json({ status: 'ok' });
  }

}
