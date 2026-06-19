import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  const port = process.env.PORT || 15002;
  await app.listen(port);
  
  console.log(`🚀 Aplikasi proxy berjalan di http://localhost:${port}`);
  console.log(`📋 Endpoint proxy: http://localhost:${port}/proxy`);
}
bootstrap();
