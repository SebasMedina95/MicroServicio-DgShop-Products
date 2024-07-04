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
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ProductsService } from './products.service';
import { FilesService } from '../../helpers/files/files.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PageOptionsDto } from '../../helpers/paginations/dto/page-options.dto';
import { PageDto } from '../../helpers/paginations/dto/page.dto';

import { MaxFileSizeValidator } from './validators/max-file-size-validator';
import { FileTypeValidator } from './validators/file-type-validator';

import { ApiTransactionResponse } from '../../util/ApiResponse';
import { EResponseCodes } from '../../constants/ResponseCodesEnum';
import { CustomError } from '../../helpers/errors/custom.error';
import { IErrorImages, IImagesSimpleTable, IProducts } from './interfaces/products.interface';

@Controller('products')
export class ProductsController {

  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: FilesService
  ) {}

  //* El cargue de imágenes será interceptado desde el Gateway y de allí las enviamos para acá y es acá
  //* donde haremos las validaciones común y corriente.
  @MessagePattern({ cmd: 'create_product' })
  async create(
    @Payload() createProductDto: CreateProductDto,
  ): Promise<ApiTransactionResponse<IProducts | string | IErrorImages[] | CustomError>> {

    let errorsImages: IErrorImages[] = [];
    let imagesNames: string[] = [];

    //* Esto lo tuvimod que hacer porque desde el gateway enviamos [{},{},{} ...] 
    //* pero acá nos está llegando como [[],[],[] ...] y adicional, el buffer no me 
    //* llegaba como Buffer sino como un objeto, entonces hacemos un reconversión para garantizar la carga
    let arrayProcess: Express.Multer.File[] = [];
    for (const iterImgs of createProductDto.imagesProducts) {
      const obj = {
        ...iterImgs,
        buffer: Buffer.from(iterImgs.buffer.data)
      }
      arrayProcess.push(obj)
    }

    if (arrayProcess) {

      const maxFileSizeValidator = new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }); // 4 MB
      const fileTypeValidator = new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' });

      for (const iterImgs of arrayProcess) {
            
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
    if( arrayProcess && errorsImages.length == 0 ){

      const product = saveProduct as IProducts;
      for (const iterImages of arrayProcess) {
        
        let executeFile = this.cloudinaryService.uploadFile(iterImages);

        executeFile.then( async(p)  => {

          const url_cloudinary = p.url;
          const objReg: IImagesSimpleTable = {
            url: url_cloudinary,
            productId: product.id
          }
  
          await this.productsService.createImages(objReg);
  
        })

      }

    }

    return new ApiTransactionResponse(
      saveProduct,
      EResponseCodes.OK,
      "Producto registrado correctamente."
    );

  }

  @MessagePattern({ cmd: 'get_products_paginated' })
  async findAll(
    @Payload() pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<IProducts> | Object> {

    return this.productsService.findAll(pageOptionsDto);

  }

  @MessagePattern({ cmd: 'get_product_by_id' })
  async findOne(
    @Payload('id') id: number
  ): Promise<ApiTransactionResponse<IProducts | string>> {

    return this.productsService.findOne(id);

  }

  @MessagePattern({ cmd: 'update_product' })
  @UseInterceptors(FilesInterceptor('imagesProducts', 10)) //TODO -> Revisar para los microservicios
  async update(
    @Payload() files: Array<Express.Multer.File>, //TODO -> Revisar para los microservicios
    @Payload() updateProductDto: UpdateProductDto
  ): Promise<ApiTransactionResponse<IProducts | string | IErrorImages[] | CustomError>> {

    let errorsImages: IErrorImages[] = [];
    let imagesNames: string[] = [];

    //1. Si viene imagenes
    if( files ){
      
      //1.1 Validamos imágenes
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

      if( errorsImages.length > 0 ){
        return new ApiTransactionResponse(
          errorsImages,
          EResponseCodes.FAIL,
          "Las imágenes de los productos tienen errores, revise."
        );
      }

      //1.2 Borramos los que estén registrados anteriormente (Es decir que desde el Front nos deben garantizar esto)
      const getImages = await this.productsService.imagesByProduct(Number(updateProductDto.id));
      if( getImages.length > 0 ){

        //Las removemos de Cloudinary
        for (const iterImages of getImages) {

          const arrayName = iterImages.url.split('/');
          const getName = arrayName[arrayName.length - 1];
          const [ name , ext ] = getName.split('.');

          //Borramos con una función propia de cloudinary
          await this.cloudinaryService.deleteFile(name);

        }

        //Las removemos de la base de datos
        await this.productsService.deleteImagesByProduct(Number(updateProductDto.id));

      }

      //1.3 Registramos nuevamente o registramos la primera vez
      if( files && errorsImages.length == 0 ){

        for (const iterImages of files){

          let executeFile = this.cloudinaryService.uploadFile(iterImages);

          executeFile.then( async(p)  => {

            const url_cloudinary = p.url;
            const objReg: IImagesSimpleTable = {
              url: url_cloudinary,
              productId: Number(updateProductDto.id)
            }
    
            await this.productsService.createImages(objReg);
    
          })

        }

      } 

    } //Si vamos a manejar archivos / imágenes

    //2. Actualizar producto
    const updateProduct = await this.productsService.update(Number(updateProductDto.id), updateProductDto);
    if( updateProduct instanceof CustomError  ){
      return new ApiTransactionResponse(
        updateProduct.message,
        EResponseCodes.FAIL,
        "Ocurrieron errores, no se pudo actualizar el producto."
      );
    }

    return new ApiTransactionResponse(
      updateProduct,
      EResponseCodes.OK,
      "Producto actualizado correctamente."
    );

  }

  @MessagePattern({ cmd: 'remove_logic_product' })
  async remove(
    @Payload('id') id: number
  ): Promise<ApiTransactionResponse<IProducts | string>> {

    return this.productsService.remove(id);

  }
}
