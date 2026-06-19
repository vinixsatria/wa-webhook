import { Module } from '@nestjs/common';
import { ProxyController } from './controllers/proxy.controller';
import { ProxyService } from './services/proxy.service';
import { ProxyConfigService } from './services/proxy-config.service';

@Module({
  imports: [],
  controllers: [ProxyController],
  providers: [ProxyService, ProxyConfigService],
})
export class AppModule {}
