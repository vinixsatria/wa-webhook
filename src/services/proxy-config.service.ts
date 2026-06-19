import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ProxyConfig } from '../interfaces/proxy.interface';

@Injectable()
export class ProxyConfigService {
  private proxyConfigs: ProxyConfig[] = [];

  constructor() {
    this.loadProxyConfigs();
  }

  private loadProxyConfigs(): void {
    try {
      const configPath = join(process.cwd(), 'proxy.json');
      const configData = readFileSync(configPath, 'utf8');
      this.proxyConfigs = JSON.parse(configData);
    } catch (error) {
      console.error('Error loading proxy config:', error);
      this.proxyConfigs = [];
    }
  }

  getBackendUrl(session: string): string | null {
    const config = this.proxyConfigs.find(c => c.session === session);
    return config ? config.url : null;
  }

  isConnected(session: string): boolean | null {
    const config = this.proxyConfigs.find(c => c.session === session);
    return config ? config.connected === true : null;
  }

  getAllConfigs(): ProxyConfig[] {
    return this.proxyConfigs;
  }

  reloadConfigs(): void {
    this.loadProxyConfigs();
  }

  setConnected(session: string, connected: boolean): void {
    const config = this.proxyConfigs.find(c => c.session === session);
    if (config) {
      config.connected = connected;
    }
  }
}
