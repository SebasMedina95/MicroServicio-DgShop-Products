import { Module } from '@nestjs/common';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ProvidersModule } from './modules/providers/providers.module';

@Module({
  imports: [
    CategoriesModule, 
    ProductsModule, ProvidersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
