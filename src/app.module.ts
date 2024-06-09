import { Module } from '@nestjs/common';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    CategoriesModule, 
    ProductsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
