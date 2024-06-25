import { Controller,
         Get,
         Post,
         Body,
         Patch,
         Param,
         Delete,
         UseInterceptors,
         UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { MaxFileSizeValidator } from './validators/max-file-size-validator';
import { FileTypeValidator } from './validators/file-type-validator';

import { IErrorImages, IProducts } from './interfaces/products.interface';
import { ApiTransactionResponse } from '../../util/ApiResponse';
import { CustomError } from '../../helpers/errors/custom.error';
import { EResponseCodes } from 'src/constants/ResponseCodesEnum';

@Controller('products')
export class ProductsController {

  constructor(private readonly productsService: ProductsService) {}

  @Post('/create')
  @UseInterceptors(FilesInterceptor('imagesProducts', 10))
  async create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createProductDto: CreateProductDto,
  ): Promise<ApiTransactionResponse<IProducts | string | IErrorImages[] | CustomError>> {

    let errorsImages: IErrorImages[] = [];
    let imagesNames: string[] = [];

    if (files) {

      const maxFileSizeValidator = new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }); // 4 MB
      const fileTypeValidator = new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' });

      for (const iterImgs of files) {
            
        if (!maxFileSizeValidator.isValid(iterImgs)) {
          errorsImages.push({
            error: "El tamaño de la imagen sobrepasa las 4MB",
            fileError: iterImgs.originalname
          });
        }

        if (!fileTypeValidator.isValid(iterImgs)) {
          errorsImages.push({
            error: "El formato de la imagen es diferente a .(png|jpg|jpeg)",
            fileError: iterImgs.originalname
          });
        }

        imagesNames.push(iterImgs.originalname);
        
      }

    }

    if( errorsImages.length > 0 ){
      return new ApiTransactionResponse(
        errorsImages,
        EResponseCodes.FAIL,
        "Las imágenes de los productos tienen errores, revise."
      );
    }

    // Aquí puedes manejar el DTO y el archivo si existe.
    //? Registremos primero el producto
    const saveProduct = await this.productsService.create(createProductDto);
    if( saveProduct instanceof CustomError  ){
      return new ApiTransactionResponse(
        saveProduct.message,
        EResponseCodes.FAIL,
        "Ocurrieron errores, no se pudo registrar el producto."
      );
    }

    //? Registramos las imágenes
    if( files && errorsImages.length == 0 ){

    }

    return;

  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
