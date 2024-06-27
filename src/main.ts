import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { envs } from './config/envs';

async function bootstrap() {

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: envs.port
      }
    }
  );
  const logger = new Logger('Bootstrap')

  //? Alias de la aplicación
  // app.setGlobalPrefix('api-ms-dgshop/products/v1'); //* Ya no nos funciona por MicroService

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
  // app.enableCors(); //* Ya no nos funciona por MicroService

  await app.listen();
  // await app.listen( envs.port );
  logger.log(`Microservicio corriendo en puerto: ${envs.port}`);
  logger.log(`La url general de la API es: ${envs.url_dev}`);

}
bootstrap();
