import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ProvidersModule } from './modules/providers/providers.module';

import { FilesModule } from './helpers/files/files.module';
import { join } from 'path';

@Module({
  imports: [

    //? Configuración Global
    ConfigModule.forRoot({ isGlobal: true }),

    //? Servidor estático
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
    }),

    CategoriesModule, 
    ProductsModule, 
    ProvidersModule,

    //? Módulos tipo Helper
    FilesModule
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
