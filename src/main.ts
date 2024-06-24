import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { envs } from './config/envs';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap')

  //? Alias de la aplicación
  app.setGlobalPrefix('api-ms-dgshop/products/v1');

  //? Configuración global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  //? Configuración del cors
  app.enableCors();

  await app.listen( envs.port );
  logger.log(`La API está corriendo en puerto: ${envs.port}`);
  logger.log(`La url general de la API es: ${envs.url_dev}`);

}
bootstrap();
