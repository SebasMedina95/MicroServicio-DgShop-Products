import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, BadRequestException, UploadedFiles } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { MaxFileSizeValidator } from './validators/max-file-size-validator';
import { FileTypeValidator } from './validators/file-type-validator';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // @Post()
  // create(@Body() createProductDto: CreateProductDto) {
  //   // return this.productsService.create(createProductDto);
  //   return createProductDto;
  // }

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        // destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        files: 10, // Límite de 10 archivos
      },
    }),
  )
  async create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createProductDto: CreateProductDto,
  ){

    //TODO: Validación de tamaño y tipo de archivo
    //TODO: Validación para Cloudinary
    //TODO: Implementación de Cloudinary
    //TODO: PROYECTO GUÍA TEMPORAL -> 07-TALYBU-MOTEL
    if (files) {
      // const maxFileSizeValidator = new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }); // 4 MB
      // const fileTypeValidator = new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' });

      // // Aplicar validaciones manualmente
      // // Para manejar el control completo
      // const errors = [];
      // if (!maxFileSizeValidator.isValid(file)) {
      //   errors.push(`File size should not exceed ${maxFileSizeValidator.maxSize} bytes`);
      // }

      // if (!fileTypeValidator.isValid(file)) {
      //   errors.push(`File type should be one of the following: ${fileTypeValidator.fileType}`);
      // }

      // if (errors.length > 0) {
      //   throw new BadRequestException(errors.join(', '));
      // }
      console.log('Files:', files);

    }

    // Aquí puedes manejar el DTO y el archivo si existe. 
    console.log('DTO:', createProductDto);

    return createProductDto;

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
